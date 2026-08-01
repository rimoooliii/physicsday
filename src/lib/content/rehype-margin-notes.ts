import type { Element, ElementContent, Root, Text } from 'hast';
import { visit } from 'unist-util-visit';

const MARGIN_NOTE_MARKER = /^\[!margin(?:\s*:\s*([^\]]+))?\]\s*/i;

function firstParagraph(node: Element): Element | undefined {
  return node.children.find(
    (child): child is Element => child.type === 'element' && child.tagName === 'p',
  );
}

function firstText(node: Element): Text | undefined {
  return node.children.find((child): child is Text => child.type === 'text');
}

function element(
  tagName: string,
  className: string,
  children: ElementContent[],
): Element {
  return {
    type: 'element',
    tagName,
    properties: { className: [className] },
    children,
  };
}

export function rehypeMarginNotes() {
  return (tree: Root): void => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'blockquote') return;

      const markerParagraph = firstParagraph(node);
      if (!markerParagraph) return;

      const markerText = firstText(markerParagraph);
      const match = markerText?.value.match(MARGIN_NOTE_MARKER);
      if (!markerText || !match) return;

      markerText.value = markerText.value.slice(match[0].length);
      if (markerParagraph.children.every(
        (child) => child.type === 'text' && child.value.trim() === '',
      )) {
        node.children = node.children.filter((child) => child !== markerParagraph);
      }

      const label = match[1]?.trim() || 'Margin note';
      const content = [...node.children] as ElementContent[];

      node.tagName = 'details';
      node.properties = {
        className: ['margin-note'],
        open: true,
      };
      node.children = [
        element('summary', 'margin-note-summary', [
          element('span', 'margin-note-index', []),
          element('span', 'margin-note-label', [{ type: 'text', value: label }]),
        ]),
        element('div', 'margin-note-content', content),
      ];
    });
  };
}
