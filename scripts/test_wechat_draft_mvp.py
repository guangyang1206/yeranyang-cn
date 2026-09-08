#!/usr/bin/env python3
"""Unit tests for the WeChat draft MVP preflight logic."""

from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("wechat-draft-mvp.py")
SPEC = importlib.util.spec_from_file_location("wechat_draft_mvp", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class WechatDraftMvpTests(unittest.TestCase):
    def test_extract_removes_document_shell_comments_and_data_image(self) -> None:
        source = """<!doctype html><html><head><style>x</style></head><body>
        <!-- note --><section><img src="data:image/png;base64,AAAA"></section>
        <section style="color:#333"><p>正文</p></section></body></html>"""
        content = MODULE.extract_wechat_content(source)
        self.assertNotIn("data:image", content)
        self.assertNotIn("<!--", content)
        self.assertIn("正文", content)

    def test_validate_accepts_clean_article(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            cover = Path(directory) / "cover.png"
            cover.write_bytes(b"png")
            errors = MODULE.validate(
                "模型开始参与造自己",
                "摘要",
                '<section style="color:#333"><p>正文</p></section>',
                cover,
                "https://yeranyang.cn/articles/ai/example/article-full.html",
            )
            self.assertEqual(errors, [])

    def test_validate_rejects_unsafe_or_incomplete_content(self) -> None:
        errors = MODULE.validate(
            "这是一条明显超过微信限制的公众号标题用于验证字节长度检查是否真正生效",
            "",
            '<style>.x{}</style><img src="https://example.com/a.png"><p>TODO</p>',
            Path("/not-found.png"),
            "https://example.com/article",
        )
        self.assertGreaterEqual(len(errors), 5)


if __name__ == "__main__":
    unittest.main()
