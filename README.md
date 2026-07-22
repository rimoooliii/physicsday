# Physics Ledger

Physics Ledger 是一个个人理论物理训练档案。ChatGPT 或 Codex 在聊天中生成完整 Markdown；你把文件保存到仓库；网站负责校验、公式排版、搜索和发布。它不需要 OpenAI API、数据库、RAG 或账户系统。

## 日常使用

1. 在聊天中生成一篇带完整 frontmatter 的 Markdown 文章。
2. 为它分配当天尚未使用的永久 ID，例如 `PHYS-2026-07-21-02`。
3. 保存为 `src/content/physics/PHYS-2026-07-21-02.md`。
4. 运行 `npm run validate`。只有元数据、替代关系和全部 TeX 均通过才可发布。
5. 运行 `npm run dev` 预览，确认后提交并推送。
6. 以后提问时直接提供文章 URL 或 ID。

首次在新电脑使用：

```text
npm ci
npm run dev
```

完整发布前检查：

```text
npm run check
npm run build
```

## GitHub 与部署

当前仓库对应：

```text
https://github.com/rimoooliii/physicsday.git
```

手动连接新的本地副本：

```text
git remote add origin https://github.com/rimoooliii/physicsday.git
git push -u origin main
```

仓库的 GitHub Pages 应选择 **GitHub Actions** 作为构建来源。工作流使用：

```text
SITE_URL=https://rimoooliii.github.io
BASE_PATH=/physicsday
```

公开地址预期为：

```text
https://rimoooliii.github.io/physicsday/
```

Pull Request 只验证和生成构建产物；只有 `main` 的推送会部署。同一个已生成的 `dist/` 产物被直接部署，不会再次构建。

## 文章的三个表示

每篇公开文章同时拥有：

```text
/physics/PHYS-2026-07-21-01/
/physics/PHYS-2026-07-21-01.md
/physics/PHYS-2026-07-21-01.json
```

HTML 用于阅读；Markdown 保留原始 frontmatter 和 TeX；JSON 提供规范化元数据、正文、公式顺序、真实源文件行号和 SHA-256。三个端点由同一源文件生成。

## 评论

评论使用可选的 [giscus](https://giscus.app/) 和公开 GitHub Discussions。未配置时网站仍可完整使用，只显示说明文字。

配置步骤：

1. 在仓库 Settings → General 中启用 Discussions。
2. 在 giscus.app 选择 `rimoooliii/physicsday` 及 Discussions 分类。
3. 把生成的 repository ID 和 category ID 配置为构建环境变量 `PUBLIC_GISCUS_REPO_ID` 与 `PUBLIC_GISCUS_CATEGORY_ID`。

公开评论需要 GitHub 登录，并会公开显示；评论不被当作学习档案的唯一数据源。

## 项目命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 本地预览 |
| `npm run validate` | 校验元数据、ID、替代图与 TeX |
| `npm test` | 运行自动化测试 |
| `npx astro check` | 类型与 Astro 页面检查 |
| `npm run build` | 生成静态网站和 Pagefind 索引 |

详细写作规则见 [`docs/authoring.md`](docs/authoring.md)。设计与实施记录位于 `docs/superpowers/`。
