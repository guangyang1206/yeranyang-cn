# share/ — 分享型静态站点

本目录托管**非文章类**的静态网页内容：web slides、demo 页、工具页、活动页等。每一个子目录 = 一个独立可扫码访问的分享站点。

---

## 🗂️ 目录职责边界

仓库根目录（`guangyang1206/yeranyang-cn`，原名 `ai-articles`）由多方共同维护（本地手动维护 + OpenClaw 云端实例），为避免相互覆盖，请遵守以下**目录职责分工**：

| 目录 | 用途 | 谁负责 |
|-----|-----|-------|
| `articles/ai/` | AI 深度解读**公众号文章**（HTML 文章版 + 配图素材） | OpenClaw 云端 + 本地都可写 |
| `share/` | **非文章类**静态站点：web slides、demo、工具页 | **仅本地维护**，OpenClaw 云端**只读、不写** |
| `scripts/`, `index.html`, `README.md`, `BRAND_GUIDELINES.md`, `CNAME` | 站点基础设施 | 双方修改需先在 issue 里知会 |

**不要跨界写**。如需在 `share/` 里增删任何子目录，请以本文件（`share/README.md`）明确记录归属。

---

## 📁 当前子目录

| 子目录 | 内容 | 首发日期 | 访问地址 |
|-------|-----|--------|---------|
| `xauat-2026/` | 西安建筑科技大学校友分享 · 当人工智能开始涌现·人往何处 | 2026-07 | https://yeranyang.cn/share/xauat-2026/ |
| `ai-enlightenment/` | AI 启蒙 · 从零理解 AI · 面向非技术观众的双语（EN / 中）科普 slides | 2025 首发 · 2026-08 更新 | https://yeranyang.cn/share/ai-enlightenment/ |
| `workbuddy-intro/` | WorkBuddy 产品介绍 web slides · 12 页中文版 · 面向外部大众用户 | 2026-08 | https://yeranyang.cn/share/workbuddy-intro/ |
| `ylgl/` | 韵乐共流（完整版）· 音乐内容导读页 | 既有内容 · 2026-08 迁入 | https://yeranyang.cn/share/ylgl/ |
| `ylgl-brief/` | 韵乐共流（精简版）· 音乐内容导读页 | 既有内容 · 2026-08 迁入 | https://yeranyang.cn/share/ylgl-brief/ |

---

## 🧭 新增分享的推荐流程

1. **本地准备**：在工作目录里做好完整的 deck / 页面（例如 `***REMOVED***WorkBuddy/<project>/xxx-deck/`）
2. **拷贝到 `share/<slug>/`**：`slug` 用**日期+主题**式短标识（如 `xauat-2026`、`2027-agent-day`）
3. **在本 README 表格里登记一行**
4. **⚠️ 同时在根目录 `shares.json` 里登记一条**——首页「公开分享」板块只读这个文件，不扫目录。漏了这一步，分享**不会出现在首页**。
5. **commit + push**，Pages 会自动构建

`shares.json` 的字段（`accent` 取 `green` / `blue` / `purple` / `amber` / `rose`，`glyph` 用简洁几何符号）：

```json
{
  "slug": "2027-agent-day",
  "title": "标题",
  "desc": "一句话说明，讲给谁听、讲什么",
  "url": "share/2027-agent-day/",
  "date": "2027-03",
  "format": "Web slides",
  "accent": "green",
  "glyph": "◇"
}
```

> 新增分享后，首页内置的离线快照不会自动更新，需重新生成 `index.html` 里的 `FALLBACK.shares`。在线访问不受影响。

## ✋ 关于文件丢失

如果发现 `share/` 下某个子目录**被删或被替换**：

1. 不要惊慌——本地工作目录里通常有完整源
2. 优先看 GitHub 上 `git log --all -- share/<slug>/` 找上一个健康 commit
3. 通过 `git show <commit>:share/<slug>/index.html` 恢复
4. 或者直接从本地工作目录重新覆盖

**避免同一路径被多方无沟通改写**——这是本文件的核心用意。
