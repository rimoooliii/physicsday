# Physics Ledger 手动发布与每周复盘指南

_适用于 ChatGPT、Claude、Gemini、Codex 等任意能够输出 Markdown 的 AI；不需要 AI API，也不要求 AI 拥有 GitHub 权限。_

---

## 🧭 整体流程

每天的工作只需要四步：

1. 让 scheduled task 按原提示词生成当天的物理训练内容。
2. 确认内容满意后，把本文的“通用排版提示词”发给同一个 AI。
3. 将 AI 返回的完整 Markdown 文件手动提交到 GitHub。
4. 等待 GitHub Actions 变绿，然后在网站查看文章。

这样，聊天负责生成和讨论，GitHub 负责保存原始档案，网站负责阅读与检索。换一个 AI 或新开会话时，只需提供文章的 `.md` 地址，不必携带全部旧聊天记录。

---

## 🪪 确定文章 ID

当前网站接受的 ID 格式为：

```text
PHYS-YYYY-MM-DD-NN
```

例如：

| ID | 用途示例 |
|---|---|
| `PHYS-2026-07-21-01` | 当日正式训练 |
| `PHYS-2026-07-21-02` | 同日补充推导 |
| `PHYS-2026-07-21-03` | 同日间隔检索 |

规则：

- `id` 是永久稳定的唯一标识；发布后不要修改或重复使用。
- `date` 可以重复，同一天可以有多篇文章。
- 网站稳定地址以 `id` 为准，标题可以修改。
- 如果新文章替代旧文章，新文章用新的 ID，并通过 `replaces` 指向旧文章。

---

## ✍️ 让任意 AI 整理成可发布文件

在 AI 已经生成当天内容后，把下面整段提示词发给它。只需要先替换开头的四个参数。

````text
请把你上一条生成的物理训练内容整理成可直接上传到 Physics Ledger 的 Markdown 文件。

参数：
- TARGET_ID: PHYS-YYYY-MM-DD-NN
- DATE: YYYY-MM-DD
- ENTRY_KIND: daily
- USER_DIFFICULTY: unrated

你现在是出版编辑，不是内容重写者。必须保留原文的论证、题目、提示、答案和数学内容；只修正 Markdown 结构、LaTeX 定界符、明显的字符损坏和站点元数据。

请遵守以下规则：

1. 最终先输出一行：`Filename: TARGET_ID.md`。
2. 随后只输出一个完整的 `markdown` 代码块，代码块内必须包含 frontmatter 和全文；不得省略、摘要或用“同上”代替任何内容。
3. frontmatter 使用下面的结构，并根据文章内容填写：

```yaml
---
schema_version: 1
id: PHYS-YYYY-MM-DD-NN
date: YYYY-MM-DD
updated_at: YYYY-MM-DD
title: "文章标题"
summary: "用于归档页的一句简短描述"
language: en
entry_kind: daily
status: published
level: graduate-advanced
user_difficulty: unrated
domains:
  - statistical-mechanics
estimated_minutes: 45
---
```

4. 受控字段只能从以下值中选择：
   - `language`: `en`、`zh-CN`、`bilingual`
   - `entry_kind`: `daily`、`supplement`、`spaced-retrieval`、`weekly-consolidation`
   - `status`: `draft`、`published`、`superseded`、`withdrawn`
   - `level`: `graduate`、`graduate-advanced`、`research`
   - `user_difficulty`: `unrated`、`too-easy`、`appropriate`、`too-hard`
   - `domains`: `classical-mechanics`、`quantum-theory`、`quantum-field-theory`、`general-relativity`、`statistical-mechanics`、`condensed-matter`、`particle-physics`、`cosmology`、`string-theory`、`quantum-information`、`mathematical-physics`
5. 行内公式使用 `$...$`，独立公式使用 `$$...$$`。
6. 不要输出完整 LaTeX 文档、导言区、TikZ、`\begin{document}` 或裸露的 `[ ... ]` 公式定界符。
7. 可使用这些站点宏：`\dd`、`\ii`、`\ee`、`\Tr`、`\bra`、`\ket`、`\braket`、`\expect`、`\comm`、`\anticom`。
8. 提示使用：

```html
<details>
<summary>Hint</summary>

提示内容。

</details>
```

9. 解答使用：

```html
<details class="solution">
<summary>Solution</summary>

解答内容。

</details>
```

10. 检查所有公式是否存在丢失反斜杠、错误转义、括号不配对或字符乱码。
11. 如果你怀疑原文存在物理错误，不要静默改写。在完整文件代码块之后另列 `Review warnings`，说明位置、疑点和建议；如果没有疑点，不要添加这一节。
12. 除 `Filename`、完整文件代码块和必要的 `Review warnings` 外，不要输出解释。
````

如果 AI 给出了可下载的 `.md` 文件，可直接下载并上传；否则新建一个纯文本文件，把代码块内部的内容保存为 `TARGET_ID.md`。不要把最外层的三枚反引号复制进文件。

---

## 📤 通过 GitHub 网页手动上传

文章目录：[`src/content/physics`](https://github.com/rimoooliii/physicsday/tree/main/src/content/physics)

### 已经有 `.md` 文件

1. 打开上面的文章目录。
2. 选择 **Add file → Upload files**。
3. 拖入 `PHYS-YYYY-MM-DD-NN.md`。
4. 在提交说明中写一句简短描述，例如 `content: add PHYS-2026-07-21-01`。
5. 将变更提交到 `main` 分支。

### 只有 AI 返回的文本

1. 在文章目录选择 **Add file → Create new file**。
2. 文件名填写完整 ID，例如 `PHYS-2026-07-21-01.md`。
3. 只粘贴 AI 返回的 Markdown 代码块内部内容。
4. 提交到 `main` 分支。

提交前快速确认：文件名与 frontmatter 中的 `id` 完全一致，日期格式为 `YYYY-MM-DD`，并且没有重复 ID。

---

## ✅ 检查发布结果

提交后打开 [GitHub Actions](https://github.com/rimoooliii/physicsday/actions)。最新一次部署显示绿色后，文章通常可以通过以下地址访问：

| 用途 | 地址格式 |
|---|---|
| 阅读页面 | `https://rimoooliii.github.io/physicsday/physics/PHYS-YYYY-MM-DD-NN/` |
| AI 读取的 Markdown | `https://rimoooliii.github.io/physicsday/physics/PHYS-YYYY-MM-DD-NN.md` |
| 结构化元数据 | `https://rimoooliii.github.io/physicsday/physics/PHYS-YYYY-MM-DD-NN.json` |

如果部署失败，旧网站仍会保留。打开失败的 Actions 记录，把红色报错以及对应 Markdown 全文发给任意 AI，并要求它“只修复导致 Physics Ledger 构建失败的问题，返回完整文件”。

常见错误包括：

- ID 或受控字段不符合允许值。
- 文件名与 frontmatter 的 `id` 不一致。
- YAML 中含冒号的标题或摘要没有加引号。
- HTML 的 `<details>` 标签没有闭合。
- 数学公式的定界符、花括号或反斜杠损坏。

---

## 📚 一周后让 AI 读取并分析

不要只发送 ChatGPT 分享链接。最稳妥的做法是把这一周每篇文章的 `.md` 地址明确列出；这样不同 AI 都能读取原始 Markdown 和 LaTeX 公式。

把下面提示词发给具备联网读取能力的 AI，并替换日期、文章地址以及你的反馈。时间统一按东八区（UTC+8）理解。

````text
请对我最近一周的 Physics Ledger 训练做一次严格的课程与理解结构分析。

时间范围：YYYY-MM-DD 至 YYYY-MM-DD，按 UTC+8 解释日期。

必须读取的 Markdown 原文：
- https://rimoooliii.github.io/physicsday/physics/PHYS-YYYY-MM-DD-NN.md
- https://rimoooliii.github.io/physicsday/physics/PHYS-YYYY-MM-DD-NN.md
- 在这里继续列出本周所有文章

我的实际反馈：
- 每篇文章的难度：too-easy / appropriate / too-hard / 未回答
- 我提交过的答案、疑问或 GitHub Discussion 链接：在这里填写
- 本周最不确定的概念：在这里填写

要求：
1. 开头列出你成功读取的文章 ID；无法读取的文章必须明确列出，不得假装已经读取。
2. 对每篇文章提取：核心原理、主要领域、关键对照、toy model、精确结论、近似结论、类比、被击破的错误命题、未解决问题和应回访概念。
3. 检查最近内容是否出现机械重复；如果我同时提供前一周文章，也检查连续 14 次训练中的重复。
4. 检查领域覆盖是否过窄，是否缺少非量子视角，以及是否混淆 exact statement、approximation、representation choice 和 analogy。
5. 如果提供了我的答案或 Discussion，只依据实际证据分析我的理解；如果没有反馈数据，明确说明你只能做课程结构分析，不能可靠判断我的掌握程度。
6. 给出：
   - 本周知识结构图的文字版
   - 三个最重要的理解缺口
   - 两个应进行间隔检索的旧概念
   - 下周内容分配建议
   - 一道跨领域迁移题
7. 在生成 weekly-consolidation 文件之前先询问我是否确认。
````

只读文章能分析课程覆盖和概念结构；若要分析你是否真正掌握，还需要你的答案、难度评价或评论记录。建议把重要回答写入文章的 GitHub Discussion，或者在周复盘时随提示词一并提供。

---

## 🔁 生成并发布周总结

确认周复盘结果后，可以继续发送：

````text
现在请把刚才确认的复盘整理成一篇可发布的 Physics Ledger 周总结。

要求：
- 使用新的永久 ID：PHYS-YYYY-MM-DD-NN
- `entry_kind: weekly-consolidation`
- `status: published`
- 日期按 UTC+8
- 保留本周文章 ID 与稳定链接
- 包含：本周主线、关键概念对照表、exact / approximation / representation choice / false claim 区分、间隔检索题、跨领域迁移题、未解决问题和下周方向
- 题目答案放入 `<details class="solution">` 折叠区
- 使用 Physics Ledger 支持的 Markdown 与 LaTeX 规则
- 先输出 `Filename: ID.md`，然后只输出一个包含完整 frontmatter 和正文的 `markdown` 代码块
- 不得省略内容；发现物理疑点时在文件代码块后列出 `Review warnings`
````

拿到文件后，按照本文“通过 GitHub 网页手动上传”的步骤提交即可。

---

## 📌 最短操作清单

- [ ] scheduled task 在聊天中生成当天内容。
- [ ] 给文章分配未使用的 `PHYS-YYYY-MM-DD-NN`。
- [ ] 把通用排版提示词发给生成内容的 AI。
- [ ] 检查文件名、ID、公式和 frontmatter。
- [ ] 上传到 `src/content/physics` 并提交到 `main`。
- [ ] 等待 GitHub Actions 变绿。
- [ ] 保存文章 `.md` 地址，供新会话和每周复盘直接读取。
- [ ] 记录难度、答案与疑问，使周复盘能够分析真实学习状态。
