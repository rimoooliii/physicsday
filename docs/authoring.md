# Physics Ledger 写作与发布规范

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

- `entry_kind`: `daily`, `supplement`, `spaced-retrieval`, `weekly-consolidation`
- `status`: `draft`, `published`, `superseded`, `withdrawn`
- `user_difficulty`: `unrated`, `too-easy`, `appropriate`, `too-hard`
- `level`: `graduate`, `graduate-advanced`, `research`

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

## 草稿与撤回

- `draft` 不生成页面、搜索记录、sitemap 或机器端点。
- `superseded` 保留永久 URL，并链接到替代链的当前文章。
- `withdrawn` 保留 URL 和撤回提示，但不声明有替代文章。
- 普通旧文章仍为 `published`；进入 Archive 不等于改变状态。
