import type { Element, Root } from 'hast';
import { describe, expect, it } from 'vitest';

import { rehypeMarginNotes } from '../src/lib/content/rehype-margin-notes';

function paragraph(value: string): Element {
  return {
    type: 'element',
    tagName: 'p',
    properties: {},
    children: [{ type: 'text', value }],
  };
}

describe('rehype margin notes', () => {
  it('turns a marked blockquote into an open, labelled margin note', () => {
    const quote: Element = {
      type: 'element',
      tagName: 'blockquote',
      properties: {},
      children: [paragraph('[!margin: Logical scope] The exact obstruction comes first.')],
    };
    const tree: Root = { type: 'root', children: [quote] };

    rehypeMarginNotes()(tree);

    const note = tree.children[0] as Element;
    expect(note.tagName).toBe('details');
    expect(note.properties).toMatchObject({
      className: ['margin-note'],
      open: true,
    });
    expect(note.children[0]).toMatchObject({
      type: 'element',
      tagName: 'summary',
    });
    expect(JSON.stringify(note)).toContain('Logical scope');
    expect(JSON.stringify(note)).toContain('The exact obstruction comes first.');
    expect(JSON.stringify(note)).not.toContain('[!margin');
  });

  it('leaves ordinary quotations unchanged', () => {
    const quote: Element = {
      type: 'element',
      tagName: 'blockquote',
      properties: {},
      children: [paragraph('A claim to diagnose.')],
    };
    const tree: Root = { type: 'root', children: [quote] };

    rehypeMarginNotes()(tree);

    expect((tree.children[0] as Element).tagName).toBe('blockquote');
  });
});
