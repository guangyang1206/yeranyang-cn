# Hy4 preview 开始参与自己的研发了

- **首发日期**：2026-08-28
- **本次复核**：2026-09-08
- **作者**：艾AI
- **栏目**：烨然漫笔 · 技术观察
- **状态**：已完成一手来源复核；微信公众号草稿已生成，待后台人工终审与发布
- **公众号草稿日期**：2026-09-08
- **自动化边界**：仅创建草稿，未执行正式发布
- **原状态记录**：内容复核完成，可进入微信公众号草稿箱；不得自动正式发布
- **公众号标题**：`Hy4 preview 开始参与自己的研发了`

## 核心判断

腾讯官方确认 Hy4 preview 参与了自身研发流程中的训练方法、数据策略、评估体系和底层算子自动优化，并披露其参与推理基础设施优化后，端到端吞吐相较腾讯内部基线提升 31.8%。

本文将这件事定义为：**模型进入人类主导的研发闭环**。它不等于模型已经能够自主设定研发目标，也不等于部署后的持续学习。

## 2026-09-08 一手来源复核

| 声明 | 结论 | 一手来源 | 处理方式 |
|---|---|---|---|
| 名称为 `Hy4 preview` | 已确认 | 腾讯公司发布页、官方 GitHub、官方 Hugging Face 模型卡 | 全文统一该写法；保留 `preview`，不写成正式版 |
| 770B 总参数、49B/token 激活 | 已确认 | 官方 GitHub / Hugging Face 模型卡 | 保留 |
| 上下文窗口超过 1M tokens | 已确认 | 腾讯公司发布页、官方模型仓库 | 改为“超过 1M”，不写成精确等于 1M |
| 首次参与训练方法、数据策略、评估体系和底层算子自动优化 | 已确认是腾讯官方表述 | 腾讯公司发布页 | 全文保留“腾讯称/官方披露”限定 |
| 端到端吞吐相较基线提升 31.8% | 已确认是腾讯官方测量 | 腾讯公司发布页 | 撤回“可复现的硬数字”；改为“可量化但公开材料不足以独立复现” |
| 163 名内部专家、203 个工程任务，Hy4 2.99/4 | 已确认 | 腾讯公司发布页、官方模型仓库 | 明确为腾讯内部盲测，不作为第三方排名 |
| Kimi K3 2.94/4、GLM-5.3 2.92/4 | 已确认是同一内部盲测对照 | 官方模型仓库 | 仅用于说明三者分数接近，不写“全面领先” |
| 输入 6 元、输出 18 元、缓存命中最低 0.3 元 / 百万 tokens | 已确认是腾讯发布页列示价格 | 腾讯公司中文发布页 | 保留“发布页列示”“实际以控制台为准” |
| 模型为早期版本，复杂任务思考偏长、倾向过度自我验证 | 已确认 | 官方模型仓库 Known Limitations | 新增到网站完整版 |
| Apache License 2.0 | 已确认 | 官方模型仓库 | 新增到网站完整版 |
| 当前模型通常在发布后停止权重学习 | 已确认是 Sutton / Javed 访谈中的讨论 | Sequoia Capital 原始访谈文字稿 | 不再依赖中文媒体转述；与 Hy4 的研发阶段闭环明确区分 |

## 本次删除与降级

以下内容因与主论点关系弱、截至初稿时主要依赖媒体转引，已从文章、海报和 README 主体中删除：

- DeepSeek 融资、估值与 ARR 时间线
- 英伟达收购 Hugging Face 的旧状态描述
- MiniMax 经营数据
- 智谱、Qwen 的发布与跑分时间线
- Qwen3.8-Flash 旧价格对比
- “31.8% 可复现”“模型自己干出来的”等超出公开证据的表述
- “两个月后正式版会怎样”等预测性句子

说明：截至 2026-09-08，英伟达已在 9 月 3 日正式宣布与 Hugging Face 达成收购协议，但该交易与本文核心论证无直接关系，因此不再保留在正文或海报中。

## 版本差异

### `article-wechat.html`

- 适配微信公众号编辑器，所有核心样式内联
- 无脚本、无外链样式、无正文外链、无本地正文图片
- 只保留 3 条来源说明，正文更短、更适合移动端阅读
- 公众号标题不超过 64 字节
- 封面图不嵌入正文，推草稿时单独上传 `assets/cover-900x383.png`

### `article-full.html`

网站版在公众号版基础上增加：

1. 逐条可点击的一手来源链接
2. 2026-09-08 更新记录
3. 内部盲测 CSS 图表
4. 事实核验方法附录
5. 参数、价格、许可证和已知限制表
6. 对旧稿关键表述的更正说明

### `poster.html`

- 仅保留经一手来源确认的 Hy4 核心信息
- 31.8% 明确标注为腾讯披露、相较内部基线
- 内部盲测明确标注为腾讯内部评估
- 删除其他公司融资、交易和产品发布事件

## 一手来源

1. 腾讯公司中文发布页，2026-08-28，《腾讯发布并开源 Hy4 preview》
   https://www.tencent.com/zh-cn/tencent-releases-and-open-sources-tencent-hy4-preview/
2. 腾讯公司英文发布页，2026-08-28，《Tencent Releases and Open-Sources Tencent Hy4 preview》
   https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/
3. Tencent-Hunyuan/Hy4-preview 官方 GitHub 仓库
   https://github.com/Tencent-Hunyuan/Hy4-preview
4. tencent/Hy4-preview 官方 Hugging Face 模型卡
   https://huggingface.co/tencent/Hy4-preview
5. Sequoia Capital，2026-08-18，Rich Sutton and Khurram Javed: Why AI Models Stop Learning, and How to Start It Again
   https://sequoiacap.com/podcast/rich-sutton-and-khurram-javed-why-ai-models-stop-learning-and-how-to-start-it-again
6. NVIDIA Blog，2026-09-03，NVIDIA to Acquire Hugging Face（仅用于复核被删除的旧时间线状态）
   https://blogs.nvidia.com/blog/nvidia-to-acquire-hugging-face/
7. NVIDIA Form 8-K，2026-09-03（仅用于复核被删除的旧时间线状态）
   https://www.sec.gov/Archives/edgar/data/1045810/000104581026000078/nvda-20260902.htm

## 发布门检查

- [x] 名称、参数、上下文完成一手来源核验
- [x] 31.8% 保留官方来源限定，撤回“独立验证/可复现”表述
- [x] 内部盲测数据保留“腾讯内部”限定
- [x] 价格注明发布页口径与控制台动态性
- [x] 对比产品只保留官方内部盲测中的必要对照
- [x] 公众号 HTML 使用内联样式，无脚本、外链样式或正文外链
- [x] 公众号标题不超过 64 字节
- [x] 正文图片策略明确：正文无图片；封面单独上传
- [x] 封面文件存在：`assets/cover-900x383.png`
- [x] 网站版具有逐条来源、更新记录、图表和方法附录
- [x] 未决事实项为 0
- [ ] 微信公众号编辑器最终预览（推入草稿箱后人工查看）
- [ ] 人工点击“发表”或定时发布（不属于自动化范围）

## 文件清单

| 文件 | 用途 |
|---|---|
| `article-wechat.html` | 微信公众号草稿正文 |
| `article-full.html` | 网站完整版 |
| `poster.html` | 竖版摘要海报 |
| `assets/cover-900x383.png` | 公众号封面，推草稿时单独上传 |
| `cover-assets.html` | 本地封面素材预览页 |
| `review-log.md` | 审核与变更记录 |
| `README.md` | 事实台账与发布门 |
