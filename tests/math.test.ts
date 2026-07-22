import type { Element, Root } from 'hast';
import { describe, expect, it } from 'vitest';

import { extractFormulas } from '../src/lib/math/extract';
import { renderTexToSvg } from '../src/lib/math/mathjax';
import { rehypeRenderMath } from '../src/lib/math/rehype-render-math';

describe('math source extraction', () => {
  it('extracts inline and display TeX in source order with source lines', () => {
    const formulas = extractFormulas(
      'Text $E=mc^2$.\n\n$$\n\\Tr(\\rho)=1\n$$',
    );

    expect(
      formulas.map(({ display, tex, line }) => ({ display, tex, line })),
    ).toEqual([
      { display: false, tex: 'E=mc^2', line: 1 },
      { display: true, tex: '\\Tr(\\rho)=1', line: 3 },
    ]);
    expect(formulas.every((formula) => formula.sha256.length === 64)).toBe(true);
  });
});

describe('strict MathJax SVG rendering', () => {
  it('renders supported bra-ket macros as SVG with assistive MathML', () => {
    const rendered = renderTexToSvg(
      '\\bra{\\psi}H\\ket{\\psi}=\\Tr(\\rho H)',
      true,
    );

    expect(rendered.svg).toContain('<svg');
    expect(rendered.svg).toContain('mjx-assistive-mml');
  });

  it('throws on an undefined control sequence', () => {
    expect(() => renderTexToSvg('\\DefinitelyUndefined{x}', true)).toThrow(
      /undefined control sequence/i,
    );
  });

  it('throws on malformed TeX', () => {
    expect(() => renderTexToSvg('\\frac{1}{', true)).toThrow();
  });

  it('does not leak a local macro between conversions', () => {
    expect(() =>
      renderTexToSvg('\\newcommand{\\localmacro}{x}\\localmacro', false),
    ).not.toThrow();
    expect(() => renderTexToSvg('\\localmacro', false)).toThrow(
      /undefined control sequence/i,
    );
  });
});

describe('rehype math wrapper', () => {
  it('preserves original display TeX and adds a copy button', () => {
    const mathNode: Element = {
      type: 'element',
      tagName: 'code',
      properties: { className: ['language-math', 'math-display'] },
      children: [{ type: 'text', value: '\\Tr(\\rho)=1' }],
    };
    const tree: Root = { type: 'root', children: [mathNode] };

    rehypeRenderMath()(tree);

    const wrapper = tree.children[0] as Element;
    expect(wrapper.tagName).toBe('div');
    expect(wrapper.properties.dataTex).toBe(
      Buffer.from('\\Tr(\\rho)=1', 'utf8').toString('base64'),
    );
    expect(wrapper.children.at(-1)).toMatchObject({
      type: 'element',
      tagName: 'button',
      properties: { className: ['copy-tex'], type: 'button' },
    });
  });
});
