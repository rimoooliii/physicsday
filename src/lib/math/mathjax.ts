import { AssistiveMmlHandler } from 'mathjax-full/js/a11y/assistive-mml.js';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';

import { TEX_MACROS } from './config';

export interface RenderedFormula {
  svg: string;
}

const adaptor = liteAdaptor();
const handler = RegisterHTMLHandler(adaptor);
AssistiveMmlHandler(handler);

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return new Error(error.message);
  }
  return new Error(String(error));
}

export function renderTexToSvg(texSource: string, display: boolean): RenderedFormula {
  try {
    const input = new TeX({
      packages: AllPackages.filter((name) => name !== 'noundefined'),
      macros: TEX_MACROS,
      formatError: (_jax: unknown, error: unknown) => {
        throw normalizeError(error);
      },
    });
    const output = new SVG({ fontCache: 'local' });
    const document = mathjax.document('', {
      InputJax: input,
      OutputJax: output,
    });
    const node = document.convert(texSource, { display });
    const svg = adaptor.outerHTML(node);

    if (/data-mjx-error|<merror\b/i.test(svg)) {
      const detail = svg.match(/data-mjx-(?:error|message)="([^"]+)"/i)?.[1];
      throw new Error(detail ?? 'MathJax generated an error node');
    }

    return { svg };
  } catch (error) {
    const detail = normalizeError(error).message;
    throw new Error(`TeX rendering failed: ${detail}`);
  }
}
