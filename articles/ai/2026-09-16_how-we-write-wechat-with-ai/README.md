# 我是怎么用 AI 写公众号的

- **创作日期**：2026-09-16
- **作者**：艾AI
- **栏目**：烨然漫笔 · AI 与人的处境
- **类型**：经验记录 / 方法论
- **编辑状态**：三轮审核通过 + 二次重写审核通过，可部署
- **网站状态**：已部署并验证（canonical 在线）
- **公众号状态**：待生成草稿
- **自动化边界**：只进入公众号草稿箱；正式发布由作者人工决定
- **canonical URL**：https://yeranyang.cn/articles/ai/2026-09-16_how-we-write-wechat-with-ai/article-full.html

> 目录 slug 保留 `how-we-write-wechat-with-ai`（技术标识，canonical URL 已上线，不随标题人称调整而变更）。

## 一句话主张

**AI 负责把动作做对，我负责把事情做对。动作可以交给机器，判断留给自己。**

## 文章定位

上一篇文章《AI替我们干活之后，劳动还属于人吗》结尾留下分享钩子——「改天专门写一篇如何用 AI 写公众号」。本文是该钩子的兑现，第一人称记录式，共八节：

1. AI 替我干的四件事（查证、排版、送草稿、自检）与没交给它的三件事（选题、判断、发布）；
2. 五步链路（写作 → 事实核查 → 双版本排版 → 推送草稿 → 人工发布）；
3. 三个真实踩坑（td 宽度失效、编辑器注入撑爆字符、AI 把「能做成」当「该做」）；
4. 具体装了哪些 skill——7 个具名 skill 及其来历（6 个自己沉淀、1 个现成），并交代还装了六七个现成公众号 skill 但都没用上的原因；
5. 这些 skill 是怎么攒出来的——四段式结构、坑与验证占步骤六成、踩坑当天沉淀的日期证据；
6. 微信后台那几项配置（AppID/AppSecret、IP 白名单与 `40164`、只调草稿接口）；
7. 边界写在规范里（自动化止于草稿箱）；
8. 回到「劳动是否属于人」。

## 装了但这条流水线未使用的现成公众号 skill

诚实交代口径：以下均已安装，但本流水线未调用，原因是缺少「canonical 先上线 → 再推草稿」「按内容指纹幂等判重」「明确止于草稿箱、不碰群发」三条约束。

`wechat-draft-push`、`wechat-draft-pusher`、`wechat-publisher-pro`、`wechat-official-account`、`wechat-article-search`、`wechat-article-spider`（均为现成 skill，非自沉淀）。

## skill 制作方式（第 05 节依据）

- 四段式结构：When to use / Steps / Pitfalls / Verification（frontmatter 含 `name`、`description`、`description_zh`、`description_en`、`agent_created`）。
- 真实行数（`wechat-canonical-draft-pipeline`）：共 115 行，Steps 59 行，Pitfalls 19 + Verification 18 = 37 行，为 Steps 的约 63%。
- 沉淀时机（取自 `agent-created-skills.json` 创建日期）：2026-05-23 两个（事实核查、配图审查）、2026-05-31 两个（公众号排版、封面精简）、2026-08-04 一个（敏感信息审查）、2026-09-08 一个（主流水线）。同日两个即当天连踩两坑。

## 实际使用的 skill 清单

| skill | 用途 | 来历 |
|---|---|---|
| `wechat-canonical-draft-pipeline` | 主流水线：原文先上线，再送草稿箱，含幂等与校验 | 自己沉淀 |
| `ai-industry-article-fact-review` | 事实核查：数字逐条回到一手机构页面 | 自己沉淀 |
| `wechat-compatible-article-html` | 公众号兼容排版 | 自己沉淀 |
| `wechat-cover-refinement` | 封面精简 | 自己沉淀 |
| `canvas-infographic-review` | 配图可读性审查 | 自己沉淀 |
| `pre-opensource-sanitization-audit` | 发布前敏感信息审查 | 自己沉淀 |
| `humanizer` | 去 AI 写作痕迹 | 现成的 |

## 事实与观点边界

- 本文不引用任何外部研究数据，所有工具链与踩坑描述均来自「烨然漫笔」的真实实践，可在 `MEMORY.md`、上一篇 `review-log.md` 与仓库脚本中找到对应出处。
- 文中提到的工具与 skill 是作者自己在用的，不构成推荐，无合作或推广关系；除此之外不点名其他第三方产品。
- 时间口径：内容创作流程自 2026-04 起逐步成形，交付规范于 2026-08 沉淀为单一标准文件，「自动送草稿」2026-09 才跑通、尚在验证期。
- 「自动化止于草稿箱、正式发布人工确认」是本账号的真实纪律，不是行业通用标准。

## 文件清单

| 文件 | 用途 |
|---|---|
| `article-source.md` | 机器可读母稿 |
| `article-full.html` | canonical 网站原文（深色科技风，含目录导航与 skill 表） |
| `article-wechat.html` | 微信公众号兼容版（内联样式，复制粘贴） |
| `cover-assets.html` | 封面设计源（900×383，纯 CSS 几何） |
| `assets/cover-900x383.png` | 公众号 API 上传封面 |
| `review-log.md` | 三轮审核 + 两次重写审核记录 |

## 发布门

- [x] 新选题与已发布文章不重复（本篇为分享钩子的兑现）
- [x] 工具链与踩坑描述可在仓库真实记录中找到出处
- [x] skill 名称与来历逐一核对真实存在
- [x] 网站版与公众号版核心主张一致，标题三版统一
- [x] 全文人称统一为第一人称，无「我们」残留
- [x] 公众号版无脚本、样式块、data URI、正文图片、占位符、外链
- [x] 附注与正文无自相矛盾（已修「不点名产品」与点名 WorkBuddy 的冲突）
- [x] 时间口径不夸大（已修「两三个月」）
- [x] 封面 900×383 就位，原创几何设计，无事实数字
- [x] 三轮审核连续通过
- [x] 网站部署并核验（canonical 在线）
- [ ] 公众号草稿生成并反查
- [ ] 手机预览与作者人工终审
