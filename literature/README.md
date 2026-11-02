# 文学与创作

这里保存「烨然漫笔」的文学创作源文件。所有构思、人物、情节、草稿与修订记录，默认使用 Markdown；面向读者时，由 `share/literature/` 的阅读器转换为 HTML。

## 创作原则

> 让人物自己活起来，让思想从命运中生长出来。

思想内核是：把人当人，把属人的真正属于人；尊重每一个生命，弘扬最朴素的真、善、美。

完整总纲见 [`CREATIVE_CHARTER.md`](./CREATIVE_CHARTER.md)。

## 目录

```text
literature/
├── README.md
├── CREATIVE_CHARTER.md
├── catalog.json
└── works/
    ├── short/
    ├── novella/
    └── novel/
```

每部作品使用独立目录。推荐结构：

```text
YYYY-MM-DD_slug/
├── README.md                 # 元数据、状态与文件索引
├── 01-concept-and-synopsis.md
├── 02-characters.md
├── 03-outline.md
└── 04-draft.md
```

## 内容与展示分离

- `literature/` 是创作源与版本记录，Markdown 为唯一可编辑母稿。
- `share/literature/` 是公开阅读层，不在 HTML 中重复维护正文。
- `catalog.json` 只保存展示所需的技术元数据，不承载创作正文。
- 阅读器只加载 `catalog.json` 已登记的 Markdown 文件，避免任意路径读取。
- 需要独立视觉叙事时，可以为作品生成专属 HTML，但必须保留对应 Markdown 母稿。

## 当前作品

| 体量 | 作品 | 状态 | 创作档案 |
|---|---|---|---|
| 短篇 | 《环球饭店》（暂名） | 第一稿，约九千汉字 | [`works/short/2026-10-29_huanqiu-hotel/`](./works/short/2026-10-29_huanqiu-hotel/) |

推荐先读[小说正文](./works/short/2026-10-29_huanqiu-hotel/04-draft.md)，再读[独立侧记](./works/short/2026-10-29_huanqiu-hotel/06-first-draft-notes.md)。正文、侧记和构思分开维护；第一稿不等于定稿，现实细节核实尚未完成。

## 更新流程

1. 先修改作品目录中的 Markdown。
2. 如新增公开文档，同步登记 `catalog.json`。
3. 本地启动静态服务器，验证文学入口和阅读器。
4. 显式提交相关文件，不使用笼统的全量暂存。
