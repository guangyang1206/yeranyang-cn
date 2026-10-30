# Claude Fable 5 贴图素材（竖版）

> ⚠️ **这不是一篇文章**，是 `2026-07-24_claude-opus-5` 相关选题的**图片素材包**。
> 目录命名沿用 `YYYY-MM-DD_slug` 仅为归档一致，不计入文章篇数，不进入 `articles.json`。

- **生成日期**：2026-06-10
- **用途**：公众号图片消息 / 朋友圈 / 小红书 竖版贴图
- **素材内容**：Claude Fable 5 与同期模型的定位首图、能力对比、价格对比、要点总结、发布时刻

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `wechat-post-images.html` | 排版源（`.post-card` 为每张卡片） |
| `screenshot.js` | Playwright 截图脚本，生成下方 PNG |
| `01-hero.png` | 首图 |
| `02-compare.png` | 能力对比 |
| `03-pricing.png` | 价格对比 |
| `04-summary.png` | 要点总结 |
| `05-moment.png` | 发布时刻 |

## 重新生成

```bash
cd articles/ai/2026-06-10_claude-fable5
node screenshot.js
```
