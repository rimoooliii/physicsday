# Physics Ledger

一个面向高阶理论物理训练的静态出版系统。原始材料保存在 Markdown 中；构建过程负责校验元数据与 TeX、排版公式、生成搜索索引，并发布为可长期引用的网页。

[在线阅读](https://rimoooliii.github.io/physicsday/) · [发布新文章](PUBLISHING_GUIDE.md) · [写作规范](docs/authoring.md) · [文档索引](docs/README.md)

## 阅读体验

- **正文优先。** 文章采用居中的宽正文栏；宽屏显示左侧目录和右侧页边注，注释不会挤窄正文。
- **数学排版。** 展示公式由上下两条细线界定，构建时渲染为 SVG，并保留原始 TeX 以便复制。
- **清楚的入口。** Today 阅读最新训练，Archive 按主题与类型浏览，Progress 查看覆盖情况，Search 全文检索。
- **稳定引用。** 每篇文章使用永久 ID，同时提供适合阅读、复用和程序处理的三种表示。
- **离线可构建。** 不依赖 OpenAI API、数据库、RAG 或账户系统；任意能输出 Markdown 的工具都可参与写作。

## 内容如何流动

```text
Markdown 原稿
    ↓ 元数据、关系与 TeX 校验
静态网页 + 原始 Markdown + JSON
    ↓ Pagefind 索引
GitHub Pages
```

文章的唯一来源是 `src/content/physics/PHYS-YYYY-MM-DD-NN.md`。聊天记录、评论和网页都不是原稿的替代品。

## 快速开始

本地环境建议使用 Node.js 24，与部署工作流保持一致。

```text
npm ci
npm run dev
```

开发服务器会给出本地地址。修改文章或页面后，浏览器会自动刷新。

发布前运行完整检查：

```text
npm run check
npm run build
```

## 添加一篇文章

1. 分配一个当天尚未使用的永久 ID，例如 `PHYS-2026-07-21-02`。
2. 按[写作规范](docs/authoring.md)创建同名 Markdown 文件。
3. 运行 `npm run validate`，检查元数据、替代关系和全部 TeX。
4. 本地预览正文、公式、目录与页边注。
5. 运行完整检查后提交。合并或推送到 `main` 会触发正式部署。

如果不使用本地 Git，请按[发布指南](PUBLISHING_GUIDE.md)通过 GitHub 网页上传。该指南也包含可直接交给 AI 的排版提示词和每周复盘流程。

## 页边注与公式

页边注写在它所解释的段落之前：

```text
> [!margin: Logical scope]
> The anomaly is exact; the infrared conclusion needs extra assumptions.

The paragraph being annotated begins here.
```

宽屏时注释进入右侧页边；窄屏时它成为正文内的可展开注释。页边只放符号约定、适用范围、参考资料或短推导，长论证仍应留在正文。

展示公式继续使用双美元符号：

```text
$$
Z=\Tr\!\left(\ee^{-\beta H}\right)
$$
```

网站会为展示公式恢复上下细横线。完整的宏、结构与限制见[写作规范](docs/authoring.md)。

## 永久地址

一篇已发布文章会生成三个端点：

| 用途 | 地址 |
| --- | --- |
| 阅读 | `/physics/PHYS-2026-07-21-01/` |
| 原始内容 | `/physics/PHYS-2026-07-21-01.md` |
| 结构化数据 | `/physics/PHYS-2026-07-21-01.json` |

HTML 用于阅读；Markdown 保留 frontmatter 和 TeX；JSON 提供规范化元数据、正文、公式顺序、源文件行号和 SHA-256。三个端点由同一源文件生成。

## 部署

仓库通过 [GitHub Actions](https://github.com/rimoooliii/physicsday/actions) 发布到 [GitHub Pages](https://rimoooliii.github.io/physicsday/)。

Pull Request 会安装依赖、运行 `npm run check`、构建网站并上传构建产物，但不会部署。只有 `main` 的推送会部署同一个已经通过检查的 `dist/`，不会在部署阶段再次构建。

站点路径与 giscus 参数已写入 `.github/workflows/pages.yml`。新的本地副本通常不需要配置环境变量；只有测试其他域名或子路径时才参考 `.env.example`。

## 评论

文章评论使用 [giscus](https://giscus.app/) 和公开 GitHub Discussions。评论需要 GitHub 登录并公开显示；它适合讨论，不应成为唯一的学习记录。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动本地预览 |
| `npm run validate` | 校验元数据、ID、替代图与 TeX |
| `npm test` | 运行自动化测试 |
| `npm run check` | 依次执行内容校验、测试和 Astro 检查 |
| `npm run build` | 生成静态网站与 Pagefind 搜索索引 |

当前说明位于 `docs/`。`docs/superpowers/` 保存早期设计与实施记录，用于追溯决策，可能不再描述现在的界面。
