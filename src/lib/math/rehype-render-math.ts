import { Buffer } from 'node:buffer';

import type { Element, ElementContent, Root, RootContent } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import { visit } from 'unist-util-visit';

import { renderTexToSvg } from './mathjax';

function classes(node: Element): string[] {
  const value = node.properties.className;
  return Array.isArray(value) ? value.map(String) : [];
}

function mathCode(node: Element): Element | undefined {
  if (node.tagName === 'code' && classes(node).includes('language-math')) {
    return node;
  }
  if (node.tagName !== 'pre') return undefined;
  const child = node.children[0];
  return child?.type === 'element' && classes(child).includes('language-math')
    ? child
    : undefined;
}

function textValue(node: Element): string {
  return node.children
    .filter((child) => child.type === 'text')
    .map((child) => child.value)
    .join('')
    .trim();
}

function wrapperFor(tex: string, display: boolean): Element {
  const rendered = renderTexToSvg(tex, display);
  const fragment = fromHtml(rendered.svg, { fragment: true });
  const children = [...fragment.children] as ElementContent[];

  if (display) {
    children.push({
      type: 'element',
      tagName: 'button',
      properties: {
        className: ['copy-tex'],
        type: 'button',
        ariaLabel: 'Copy formula as LaTeX',
      },
      children: [{ type: 'text', value: 'Copy LaTeX' }],
    });
  }

  return {
    type: 'element',
    tagName: display ? 'div' : 'span',
    properties: {
      className: ['math-expression', display ? 'math-display' : 'math-inline'],
      dataTex: Buffer.from(tex, 'utf8').toString('base64'),
    },
    children,
  };
}

export function rehypeRenderMath() {
  return (tree: Root): void => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (index === undefined || !parent) return;
      const code = mathCode(node);
      if (!code) return;

      const display = classes(code).includes('math-display');
      parent.children[index] = wrapperFor(textValue(code), display) as RootContent;
    });
  };
}
