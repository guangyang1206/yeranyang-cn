#!/usr/bin/env python3
"""Validate a WeChat article and create a draft without publishing it.

Secrets are loaded from an external env file. The script never prints credentials
or access tokens. Draft idempotency state is stored outside the repository.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import os
import re
import sys
import uuid
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

DEFAULT_SECRET_FILE = Path.home() / ".workbuddy" / "secrets" / "wechat_yeranmanbi.env"
DEFAULT_STATE_DIR = Path.home() / ".workbuddy" / "state" / "wechat-drafts"
API_BASE = "https://api.weixin.qq.com/cgi-bin"


def load_env_file(path: Path) -> dict[str, str]:
    if not path.is_file():
        raise ValueError(f"凭证文件不存在：{path}")
    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    for key in ("WECHAT_APPID", "WECHAT_SECRET"):
        if not values.get(key):
            raise ValueError(f"凭证文件缺少 {key}")
    return values


def request_json(request: Request, timeout: int = 30) -> dict:
    with urlopen(request, timeout=timeout) as response:
        payload = json.loads(response.read().decode("utf-8"))
    if payload.get("errcode") not in (None, 0):
        raise RuntimeError(f"微信 API 错误 {payload.get('errcode')}: {payload.get('errmsg', 'unknown')}")
    return payload


def get_access_token(env: dict[str, str]) -> str:
    query = urlencode(
        {
            "grant_type": "client_credential",
            "appid": env["WECHAT_APPID"],
            "secret": env["WECHAT_SECRET"],
        }
    )
    payload = request_json(Request(f"{API_BASE}/token?{query}"))
    token = payload.get("access_token")
    if not token:
        raise RuntimeError("微信 API 未返回 access_token")
    return token


def multipart_body(field: str, path: Path) -> tuple[bytes, str]:
    boundary = f"----workbuddy-{uuid.uuid4().hex}"
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    prefix = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="{field}"; filename="{path.name}"\r\n'
        f"Content-Type: {mime}\r\n\r\n"
    ).encode("utf-8")
    suffix = f"\r\n--{boundary}--\r\n".encode("utf-8")
    return prefix + path.read_bytes() + suffix, boundary


def upload_cover(token: str, cover_path: Path) -> str:
    body, boundary = multipart_body("media", cover_path)
    request = Request(
        f"{API_BASE}/material/add_material?{urlencode({'access_token': token, 'type': 'image'})}",
        data=body,
        method="POST",
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    payload = request_json(request, timeout=60)
    media_id = payload.get("media_id")
    if not media_id:
        raise RuntimeError("封面上传成功但未返回 media_id")
    return media_id


def extract_wechat_content(html: str) -> str:
    body_match = re.search(r"<body[^>]*>([\s\S]*?)</body>", html, flags=re.IGNORECASE)
    content = body_match.group(1).strip() if body_match else html.strip()
    content = re.sub(r"<!--[\s\S]*?-->", "", content)
    content = re.sub(
        r"<section[^>]*>\s*<img[^>]+src=[\"']data:image/[^\"']+[\"'][^>]*>\s*</section>",
        "",
        content,
        flags=re.IGNORECASE,
    )
    content = re.sub(
        r"<img[^>]+src=[\"']data:image/[^\"']+[\"'][^>]*>",
        "",
        content,
        flags=re.IGNORECASE,
    )
    return content.strip()


def validate(title: str, digest: str, content: str, cover: Path, source_url: str) -> list[str]:
    errors: list[str] = []
    if not title.strip():
        errors.append("标题为空")
    if len(title.encode("utf-8")) > 64:
        errors.append(f"标题超过 64 字节：当前 {len(title.encode('utf-8'))} 字节")
    if not digest.strip():
        errors.append("摘要为空")
    if not cover.is_file():
        errors.append(f"封面不存在：{cover}")
    if not source_url.startswith("https://yeranyang.cn/"):
        errors.append("阅读原文必须使用 https://yeranyang.cn/ 下的 canonical URL")
    if re.search(r"<(script|style)\b", content, flags=re.IGNORECASE):
        errors.append("公众号正文仍含 script/style 标签")
    if "data:image/" in content.lower():
        errors.append("公众号正文仍含 data URI 图片")
    image_urls = re.findall(r"<img[^>]+src=[\"']([^\"']+)", content, flags=re.IGNORECASE)
    invalid_images = [url for url in image_urls if "mmbiz.qpic.cn" not in url]
    if invalid_images:
        errors.append(f"正文含 {len(invalid_images)} 个非微信图片地址")
    if re.search(r"\b(TODO|TBD|待补|待确认|XXX)\b", content, flags=re.IGNORECASE):
        errors.append("正文包含待办或占位符")
    return errors


def content_hash(title: str, digest: str, content: str, cover: Path, source_url: str) -> str:
    digestor = hashlib.sha256()
    for value in (title, digest, content, source_url):
        digestor.update(value.encode("utf-8"))
        digestor.update(b"\0")
    digestor.update(cover.read_bytes())
    return digestor.hexdigest()


def create_draft(token: str, payload: dict) -> str:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = Request(
        f"{API_BASE}/draft/add?{urlencode({'access_token': token})}",
        data=body,
        method="POST",
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    response = request_json(request, timeout=60)
    media_id = response.get("media_id")
    if not media_id:
        raise RuntimeError("草稿创建成功但未返回 media_id")
    return media_id


def main() -> int:
    parser = argparse.ArgumentParser(description="将本地文章安全推送到微信公众号草稿箱")
    parser.add_argument("article_dir", type=Path)
    parser.add_argument("--title", required=True)
    parser.add_argument("--digest", required=True)
    parser.add_argument("--author", default="艾AI")
    parser.add_argument("--secret-file", type=Path, default=DEFAULT_SECRET_FILE)
    parser.add_argument("--source-url")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    article_dir = args.article_dir.resolve()
    html_path = article_dir / "article-wechat.html"
    cover_path = article_dir / "assets" / "cover-900x383.png"
    if not html_path.is_file():
        raise ValueError(f"公众号 HTML 不存在：{html_path}")
    slug = article_dir.name
    source_url = args.source_url or f"https://yeranyang.cn/articles/ai/{slug}/article-full.html"
    content = extract_wechat_content(html_path.read_text(encoding="utf-8"))
    errors = validate(args.title, args.digest, content, cover_path, source_url)
    if errors:
        print("预检失败：", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 2

    digest_hash = content_hash(args.title, args.digest, content, cover_path, source_url)
    state_dir = DEFAULT_STATE_DIR
    state_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    state_path = state_dir / f"{slug}.json"
    if state_path.exists() and not args.force:
        previous = json.loads(state_path.read_text(encoding="utf-8"))
        if previous.get("content_hash") == digest_hash and previous.get("media_id"):
            print("相同内容已生成过草稿；为避免重复已停止。")
            print(f"media_id={previous['media_id']}")
            return 0

    print(f"预检通过：title_bytes={len(args.title.encode('utf-8'))}, body_chars={len(content)}")
    print(f"阅读原文：{source_url}")
    if args.dry_run:
        print("dry-run 完成，未调用微信接口。")
        return 0

    env = load_env_file(args.secret_file)
    token = get_access_token(env)
    thumb_media_id = upload_cover(token, cover_path)
    payload = {
        "articles": [
            {
                "title": args.title,
                "author": args.author,
                "digest": args.digest,
                "content": content,
                "content_source_url": source_url,
                "thumb_media_id": thumb_media_id,
                "need_open_comment": 1,
                "only_fans_can_comment": 0,
            }
        ]
    }
    media_id = create_draft(token, payload)
    state = {
        "article": slug,
        "content_hash": digest_hash,
        "media_id": media_id,
        "source_url": source_url,
    }
    state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.chmod(state_path, 0o600)
    print("草稿创建成功。")
    print(f"media_id={media_id}")
    print("请前往 https://mp.weixin.qq.com 的内容管理 → 草稿箱完成手机预览和人工发布。")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"错误：{exc}", file=sys.stderr)
        raise SystemExit(1)
