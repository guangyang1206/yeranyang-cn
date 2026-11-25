# share/ — 分享型静态站点

本目录托管面向读者的静态网页内容：web slides、demo 页、工具页、活动页，以及由 Markdown 创作源驱动的文学阅读空间。每一个子目录 = 一个独立可访问的分享站点。

---

## 🗂️ 目录职责边界

仓库根目录（`guangyang1206/yeranyang-cn`，原名 `ai-articles`）由多方共同维护（本地手动维护 + OpenClaw 云端实例），为避免相互覆盖，请遵守以下**目录职责分工**：

| 目录 | 用途 | 谁负责 |
|-----|-----|-------|
| `articles/ai/` | AI 深度解读**公众号文章**（HTML 文章版 + 配图素材） | OpenClaw 云端 + 本地都可写 |
| `share/` | 面向读者的静态站点：web slides、demo、工具页、文学阅读层 | **仅本地维护**，OpenClaw 云端**只读、不写** |
| `literature/` | 文学创作 Markdown 母稿、作品档案与公开目录 | **仅本地维护**，HTML 不得反向成为正文真相源 |
| `scripts/`, `index.html`, `README.md`, `BRAND_GUIDELINES.md`, `CNAME` | 站点基础设施 | 双方修改需先在 issue 里知会 |

**不要跨界写**。如需在 `share/` 里增删任何子目录，请以本文件（`share/README.md`）明确记录归属。

---

## 📁 当前子目录

| 子目录 | 内容 | 首发日期 | 访问地址 |
|-------|-----|--------|---------|
| `ai-collab-union/` | AI时代下的人机协同 · 用 WorkBuddy 上手：说清需求、核对结果、沉淀做法 · 24 页中文讲座 slides（含 Chart.js 图表、three.js 封面动效与可下载文本材料） | 2026-11 | https://yeranyang.cn/share/ai-collab-union/ |
| `xauat-2026/` | 西安建筑科技大学校友分享 · 当人工智能开始涌现·人往何处 | 2026-07 | https://yeranyang.cn/share/xauat-2026/ |
| `ai-enlightenment/` | AI 启蒙 · 从零理解 AI · 面向非技术观众的双语（EN / 中）科普 slides | 2025 首发 · 2026-08 更新 | https://yeranyang.cn/share/ai-enlightenment/ |
| `workbuddy-intro/` | WorkBuddy 产品介绍 web slides · 12 页中文版 · 面向外部大众用户 | 2026-08 | https://yeranyang.cn/share/workbuddy-intro/ |
| `ylgl/` | 韵乐共流（完整版）· 音乐内容导读页 | 既有内容 · 2026-08 迁入 | https://yeranyang.cn/share/ylgl/ |
| `ylgl-brief/` | 韵乐共流（精简版）· 音乐内容导读页 | 既有内容 · 2026-08 迁入 | https://yeranyang.cn/share/ylgl-brief/ |
| `literature/` | 文学与创作 · Markdown 驱动的作品入口与长文阅读器 | 2026-10 | https://yeranyang.cn/share/literature/ |

---

## 文学阅读层（2026-11-23 修订）

- 入口先展示作品，再列创作总纲与档案；正文始终从 `literature/catalog.json` 指向的 Markdown 读取，不维护 HTML 正文副本。
- 小说使用暖纸底色、居中标题、约 33 字版心、两字首行缩进，默认正文 20px、1.85 倍行距；档案不套小说缩进，长表格可横向滚动。
- `literature/fonts/` 自托管 Noto Serif SC 变量字体分片与原始 OFL 许可证。字体按字符范围加载，正文 400 与标题 600 使用真实字重；网络失败回退到本机字体。
- 可选宋体或黑体、17–26px 字号与明暗主题，选择仅保存在本机浏览器；手机保留 Markdown 入口与折叠目录，支持键盘焦点、减少动效及打印。
- 阅读进度只计算正文，不把文末创作档案算进去。公开档案间的 Markdown 链接会转到对应阅读页面；未登记文档只打开源文件，不绕过受控目录。

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
