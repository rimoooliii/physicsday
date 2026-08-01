# Physics Ledger 写作与发布规范

本文定义文章源文件的稳定格式。需要实际上传步骤时，请转到[发布指南](../PUBLISHING_GUIDE.md)；需要了解项目入口和本地命令时，请转到[仓库 README](../README.md)。

`src/content/physics/` 中的 Markdown 是唯一内容源。网页、搜索索引、`.md` 端点和 `.json` 端点都由它生成。

## 稳定身份

文件名、frontmatter `id` 和永久 URL 使用同一个 ID：

```text
PHYS-YYYY-MM-DD-NN
```

- `NN` 是两位数字序号，从 `01` 开始。
- 同一天可以有多篇文章。
- ID 发布后永不修改。
- 标题和摘要可以修改；修改时更新 `updated_at`。
- URL 不使用 slug。

## Frontmatter 模板

```yaml
---
schema_version: 1
id: PHYS-2026-07-21-02
date: 2026-07-21
updated_at: 2026-07-21
title: Article title
summary: A short archive description.
language: en
entry_kind: supplement
status: published
level: graduate-advanced
user_difficulty: unrated
domains:
  - quantum-field-theory
estimated_minutes: 25
---
```

受控字段值以 `src/lib/content/types.ts` 为唯一代码来源。主要取值为：

- `language`: `en`, `zh-CN`, `bilingual`
- `entry_kind`: `daily`, `supplement`, `spaced-retrieval`, `weekly-consolidation`
- `status`: `draft`, `published`, `superseded`, `withdrawn`
- `user_difficulty`: `unrated`, `too-easy`, `appropriate`, `too-hard`
- `level`: `graduate`, `graduate-advanced`, `research`

`domains` 至少包含一个受控主题。完整列表直接查看 `src/lib/content/types.ts`；不要在文档和代码之间另建一套标签。

`replacement` 不是文章类型。替代文章仍保留自己的内容类型：

```yaml
id: PHYS-2026-07-21-04
entry_kind: daily
status: published
replaces: PHYS-2026-07-21-01
```

旧文章改为 `status: superseded`。不要填写 `superseded_by`；网站会反向推导。替代链可为 `A → B → C`，但不能循环、分叉或跨 `entry_kind`。

## 数学公式

行内公式：

```text
$H\psi=E\psi$
```

展示公式：

```text
$$
H=-\frac{\hbar^2}{2m}\frac{\dd^2}{\dd x^2}
$$
```

中央宏包括：

```text
\dd  \ii  \ee  \Tr
\bra{...}  \ket{...}  \braket{...}{...}  \expect{...}
\comm{...}{...}  \anticom{...}{...}
```

每个文件使用隔离的 MathJax 环境。未定义宏、畸形 TeX 和错误节点会阻止发布，并报告文件、公式序号、真实源文件行号及 TeX 原文。

展示公式在阅读页中由上下两条细横线界定。横线属于网站排版，不要在 Markdown 中手写 `<hr>`、表格或边框来模拟。

MathJax 不是完整 TeX 发行版。TikZ、tikz-feynman、circuitikz、PGFPlots、自定义宏包或完整文档 preamble 不在第一版支持范围内；它们应预先生成独立图片后再引用。

## 页边注

边注只用于解释它旁边的论证，例如符号约定、假设限制、参考来源或一小步补充推导。不要把文章元数据、目录或长篇正文放进边注。

把边注写在它所解释的段落之前：

```text
> [!margin: Logical scope]
> The anomaly is exact; the phase-diagram claim still needs infrared assumptions.

The paragraph being annotated begins here.
```

标签可省略，此时显示为 `Margin note`。宽屏中边注进入正文右侧页边；窄屏中它变为可展开的正文内注释。边注应短而少；如果连续边注在页边拥挤，应合并它们或改写正文。

页边注必须紧邻被解释的段落。不要用它承载必读证明步骤，因为窄屏读者可能在折叠状态下略过它。

## 提示与解答

提示使用普通折叠区：

```html
<details>
<summary>Hint</summary>

提示内容。

</details>
```

完整解答使用带 `solution` 类名的折叠区：

```html
<details class="solution">
<summary>Solution</summary>

解答内容。

</details>
```

开始与结束标签之间保留空行，以便内部 Markdown 正确解析。每个标签必须闭合，不要交叉嵌套。

## Daily 结构

周一至周六的标准 daily 包含：

1. Key claim
2. Theme
3. Guiding question
4. Setup
5. Analysis，包含 Derivation、Scope and assumptions、Physical interpretation
6. False claim to diagnose
7. What follows — and what does not
8. 一个练习、两个递进提示、两个 oral checks
9. 分隔显示的 Solution
10. Check your understanding
11. Connections and next step

周日使用 `weekly-consolidation`。网站只强制元数据和 TeX 正确，不尝试自动判断物理内容真伪。

结构是编辑基线，不是必须机械复制的品牌口号。标题应直接说明物理问题；章节名优先使用领域内通行术语，避免为了气氛堆叠抽象概念。

## 草稿与撤回

- `draft` 不生成页面、搜索记录、sitemap 或机器端点。
- `superseded` 保留永久 URL，并链接到替代链的当前文章。
- `withdrawn` 保留 URL 和撤回提示，但不声明有替代文章。
- 普通旧文章仍为 `published`；进入 Archive 不等于改变状态。

## 发布前检查

在仓库根目录运行：

```text
npm run validate
npm run check
npm run build
```

其中 `validate` 检查所有文章的 frontmatter、文件名、替代关系与 TeX；`check` 还会运行测试和 Astro 类型检查；`build` 生成静态网页与搜索索引。

人工预览还应确认：

- 标题和摘要准确，不使用无信息量的口号。
- 正文、目录和右侧页边注在宽屏中保持平衡。
- 展示公式有上下细横线，且没有被横向裁切。
- 手机宽度下目录与边注不会遮挡正文。
- Hint 与 Solution 的折叠状态和内容顺序正确。

提交到 Pull Request 只会校验和构建；合并或直接推送到 `main` 才会部署。完整流程见[发布指南](../PUBLISHING_GUIDE.md)。
