import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import matter from 'gray-matter';

import type { PhysicsEntryData } from './types';
import { extractFormulas, sha256, type FormulaSource } from '../math/extract';

export interface SourceArticle {
  id: string;
  filePath: string;
  raw: string;
  body: string;
  frontmatter: unknown;
  data?: PhysicsEntryData;
  contentSha256: string;
  formulas: FormulaSource[];
}

export function contentLineOffset(raw: string, body: string): number {
  const start = raw.indexOf(body);
  if (start < 0) return 0;
  return raw.slice(0, start).split(/\r\n|\n|\r/).length - 1;
}

export async function readSource(
  id: string,
  root = 'src/content/physics',
): Promise<SourceArticle> {
  const filePath = join(root, `${id}.md`);
  const raw = await readFile(filePath, 'utf8');
  const parsed = matter(raw);
  const lineOffset = contentLineOffset(raw, parsed.content);

  return {
    id,
    filePath,
    raw,
    body: parsed.content,
    frontmatter: parsed.data,
    contentSha256: sha256(parsed.content),
    formulas: extractFormulas(parsed.content).map((formula) => ({
      ...formula,
      line: formula.line + lineOffset,
    })),
  };
}
