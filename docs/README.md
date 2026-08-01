# Physics Ledger 文档

这里保存当前使用说明和历史设计记录。日常工作优先阅读前三项：

| 文档 | 适合何时阅读 |
| --- | --- |
| [项目 README](../README.md) | 第一次了解项目、启动本地网站或查找常用命令 |
| [发布与复盘指南](../PUBLISHING_GUIDE.md) | 上传文章、查看部署、排查失败或进行每周复盘 |
| [写作与发布规范](authoring.md) | 编写 frontmatter、公式、页边注、提示与解答 |

## 当前约定

- Markdown 原稿位于 `src/content/physics/`，是内容的唯一来源。
- 工作流定义位于 `.github/workflows/pages.yml`，是部署行为的唯一来源。
- 受控字段位于 `src/lib/content/types.ts`，是元数据取值的唯一代码来源。
- 公开网站位于 <https://rimoooliii.github.io/physicsday/>。

## 历史记录

`superpowers/specs/` 和 `superpowers/plans/` 保存早期设计、规格与实施计划。它们用于解释决策背景，不保证描述当前界面。

当历史记录与当前文档或代码冲突时，以 `README.md`、`PUBLISHING_GUIDE.md`、`authoring.md` 和实际工作流为准。
