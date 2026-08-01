# Physics Ledger 发布与复盘指南

这份指南说明如何把一篇 Markdown 训练稿上传、校验并发布到新版网站。它适用于 ChatGPT、Claude、Gemini、Codex 或人工写作，不需要 AI 拥有 GitHub 权限。

## 最短发布流程

1. 给文章分配未使用的永久 ID：`PHYS-YYYY-MM-DD-NN`。
2. 将完整文件保存为 `src/content/physics/<ID>.md`。
3. 检查文件名、frontmatter 中的 `id`、日期与公式。
4. 通过 GitHub 网页上传，或在本地运行校验后推送。
5. 等待 [GitHub Actions](https://github.com/rimoooliii/physicsday/actions) 变绿。
6. 打开正式网页，检查正文、公式横线、目录和页边注。

直接提交到 `main` 会立即进入生产部署。内容尚未确认时，先建立 Pull Request；检查通过并合并后才会上线。

## 1. 确定文章 ID

ID 格式固定为：

```text
PHYS-YYYY-MM-DD-NN
```

例如，`PHYS-2026-07-21-01` 是当天第一篇，`PHYS-2026-07-21-02` 是当天第二篇。

- 文件名必须是 `<ID>.md`，并与 frontmatter 中的 `id` 完全一致。
- ID 是永久标识，发布后不要修改或重复使用。
- 标题和摘要可以修改；修改时同步更新 `updated_at`。
- 新文章若替代旧文章，应使用新 ID，并通过 `replaces` 指向旧 ID。

完整字段、受控值和替代规则见 [`docs/authoring.md`](docs/authoring.md)。

## 2. 准备 Markdown 文件

最小骨架如下：

```markdown
---
schema_version: 1
id: PHYS-2026-07-21-02
date: 2026-07-21
updated_at: 2026-07-21
title: "Article title"
summary: "A concise archive description."
language: en
entry_kind: daily
status: published
level: graduate-advanced
user_difficulty: unrated
domains:
  - mathematical-physics
estimated_minutes: 45
---

# Article title

The article begins here.
```

公式和页边注使用网站自己的 Markdown 约定：

```text
Inline: $E^2=p^2c^2+m^2c^4$

Display:
$$
S=\int \mathcal{L}\,\dd^4x
$$

Margin note:
> [!margin: Convention]
> We use the mostly-plus metric signature.
```

展示公式上线后会保留上下细横线。页边注只在宽屏进入正文右侧；在窄屏会变为可展开的正文内注释。

## 3A. 通过 GitHub 网页上传

打开文章目录：[`src/content/physics`](https://github.com/rimoooliii/physicsday/tree/main/src/content/physics)。

如果已有 `.md` 文件：

1. 选择添加或上传文件的入口。
2. 上传 `PHYS-YYYY-MM-DD-NN.md`。
3. 确认预览中只有目标文件发生变化。
4. 使用说明清楚的提交信息，例如 `content: add PHYS-2026-07-21-01`。

如果只有 AI 返回的文本：

1. 在文章目录创建新文件。
2. 文件名填写完整 ID 和 `.md` 后缀。
3. 只粘贴 Markdown 代码块内部的内容，不要复制最外层反引号。
4. 再次确认文件名与 frontmatter 中的 `id` 一致。

确认无误的内容可以直接提交到 `main`。需要审阅时选择新分支并建立 Pull Request；PR 通过后再合并。

## 3B. 在本地上传

第一次使用：

```text
git clone https://github.com/rimoooliii/physicsday.git
cd physicsday
npm ci
```

以后发布一篇文章：

```text
git pull --ff-only
npm run validate
npm run dev
npm run check
npm run build
git status --short
git add src/content/physics/PHYS-YYYY-MM-DD-NN.md
git commit -m "content: add PHYS-YYYY-MM-DD-NN"
git push origin main
```

先保存新文件，再运行以上命令。`git add` 使用明确文件名，避免把无关草稿一并提交。

`npm run dev` 用于人工预览；确认后按 `Ctrl+C` 退出，再继续执行后续命令。

## 4. 检查部署

工作流在 Node.js 24 环境中执行：

1. `npm ci`
2. `npm run check`
3. `npm run build`
4. 上传 `dist/`
5. 仅在事件为 `main` 推送时部署该产物

PR 会完成前四步，但不会修改线上网站。`main` 的最新运行变绿后，文章可通过以下地址访问：

| 用途 | 地址格式 |
| --- | --- |
| 阅读页面 | `https://rimoooliii.github.io/physicsday/physics/<ID>/` |
| 原始 Markdown | `https://rimoooliii.github.io/physicsday/physics/<ID>.md` |
| 结构化 JSON | `https://rimoooliii.github.io/physicsday/physics/<ID>.json` |

最后进行四项人工检查：

- Today 或 Archive 能找到新文章。
- 正文保持居中，左侧目录没有挤压正文。
- 展示公式具有上下细横线，公式内容完整。
- 宽屏页边注位于右侧，窄屏时可正常展开。

## 5. 发布失败时

失败不会覆盖旧网站。打开 Actions 中失败的运行，先查看 `npm run check` 或 `npm run build` 的第一条有效错误。

常见原因：

- 文件名与 frontmatter 中的 `id` 不一致。
- ID、日期或受控字段不符合规范。
- YAML 中含冒号的标题或摘要没有加引号。
- `<details>` 标签没有闭合。
- 公式定界符、花括号、反斜杠或宏损坏。
- `replaces` 指向不存在的文章，或替代链分叉、循环。

校验器会尽量报告文件名、公式序号、源文件行号和原始 TeX。修复后重新提交即可。

## 6. 让 AI 整理原稿

在 AI 已生成内容后，可把下面的提示词发给它。先替换四个参数。

````text
请把上一条物理训练内容整理成可直接上传到 Physics Ledger 的完整 Markdown 文件。

参数：
- TARGET_ID: PHYS-YYYY-MM-DD-NN
- DATE: YYYY-MM-DD
- ENTRY_KIND: daily
- USER_DIFFICULTY: unrated

要求：
1. 保留原论证、题目、提示、解答和数学内容；只修复结构、TeX、字符损坏与元数据。
2. 先输出 `Filename: TARGET_ID.md`，随后只输出一个包含 frontmatter 和全文的 markdown 代码块。
3. frontmatter 遵循仓库 `docs/authoring.md`；文件名、`id` 和永久 ID 必须一致。
4. 行内公式用 `$...$`，展示公式用 `$$...$$`。
5. 可使用 `\dd`、`\ii`、`\ee`、`\Tr`、`\bra`、`\ket`、`\braket`、`\expect`、`\comm`、`\anticom`。
6. 不要输出完整 TeX 文档、preamble、TikZ、PGFPlots 或裸露的 `[ ... ]` 公式定界符。
7. 提示使用 `<details><summary>Hint</summary>...</details>`。
8. 解答使用 `<details class="solution"><summary>Solution</summary>...</details>`。
9. 短注释可用 `> [!margin: Label]`，下一行继续写引用文本；长推导必须留在正文。
10. 检查公式的反斜杠、转义和括号。不要静默修改可疑物理结论。
11. 若有疑点，在文件代码块后列出 `Review warnings`；否则不要添加该节。
12. 不得摘要、省略或用“同上”代替内容。
````

AI 输出后仍需人工阅读。格式校验能发现结构和 TeX 错误，但不能证明物理结论正确。

## 7. 每周复盘

复盘时优先给 AI 提供每篇文章的 `.md` 地址，而不是聊天分享链接。再补上难度评价、你的答案、疑问或 Discussion 链接，AI 才能区分课程结构和真实掌握程度。

````text
请分析我在 YYYY-MM-DD 至 YYYY-MM-DD 的 Physics Ledger 训练，日期按 UTC+8 理解。

必须读取：
- https://rimoooliii.github.io/physicsday/physics/PHYS-YYYY-MM-DD-NN.md
- 在这里继续列出本周文章

我的反馈：
- 每篇难度：too-easy / appropriate / too-hard / 未回答
- 我的答案与疑问：在这里填写

请先列出成功与失败读取的文章 ID。然后分析核心原理、领域覆盖、exact statement、approximation、representation choice、analogy、错误命题和未解决问题。

最后给出三个理解缺口、两个间隔检索主题、下周内容分配和一道跨领域迁移题。没有学习反馈时，请明确说明只能分析课程结构，不能判断掌握程度。
````

确认复盘后，可以用新的永久 ID 和 `entry_kind: weekly-consolidation` 整理为周总结，再按同一发布流程上线。

## 发布清单

- [ ] 文件名与 `id` 完全一致，ID 尚未使用。
- [ ] frontmatter 字段有效，`updated_at` 正确。
- [ ] 公式、提示、解答和页边注已人工预览。
- [ ] `npm run check` 与 `npm run build` 通过，或 PR 检查变绿。
- [ ] 只提交目标文件，没有夹带草稿。
- [ ] 正式页面和 `.md` 地址均可访问。
- [ ] 已记录难度、答案与疑问，供后续复盘使用。
