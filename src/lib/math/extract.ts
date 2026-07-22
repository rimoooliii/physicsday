import { createHash } from 'node:crypto';

import type { Root } from 'mdast';
import type { InlineMath, Math as DisplayMath } from 'mdast-util-math';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

export interface FormulaSource {
  index: number;
  display: boolean;
  tex: string;
  line: number;
  sha256: string;
}

export function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function extractFormulas(markdown: string): FormulaSource[] {
  const tree = unified().use(remarkParse).use(remarkMath).parse(markdown) as Root;
  const formulas: FormulaSource[] = [];

  visit(tree, (node) => {
    if (node.type !== 'inlineMath' && node.type !== 'math') return;
    const mathNode = node as InlineMath | DisplayMath;
    const tex = mathNode.value.trim();
    formulas.push({
      index: formulas.length + 1,
      display: mathNode.type === 'math',
      tex,
      line: mathNode.position?.start.line ?? 1,
      sha256: sha256(tex),
    });
  });

  return formulas;
}
