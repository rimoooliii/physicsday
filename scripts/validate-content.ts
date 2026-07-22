import { readdir, readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import matter from 'gray-matter';

import { validateRelationships } from '../src/lib/content/relationships';
import { physicsEntrySchema } from '../src/lib/content/schema';
import { contentLineOffset } from '../src/lib/content/source';
import type { PhysicsEntry } from '../src/lib/content/types';
import { extractFormulas } from '../src/lib/math/extract';
import { renderTexToSvg } from '../src/lib/math/mathjax';

export interface ValidationReport {
  entries: number;
  formulas: number;
}

export async function validateContentDirectory(
  root = resolve('src/content/physics'),
): Promise<ValidationReport> {
  let names: string[];
  try {
    names = (await readdir(root)).filter((name) => name.endsWith('.md')).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { entries: 0, formulas: 0 };
    }
    throw error;
  }

  const entries: PhysicsEntry[] = [];
  const errors: string[] = [];
  let formulaCount = 0;

  for (const name of names) {
    const filePath = resolve(root, name);
    try {
      const raw = await readFile(filePath, 'utf8');
      const parsed = matter(raw);
      const data = physicsEntrySchema.parse(parsed.data);
      const stem = basename(name, '.md');
      if (stem !== data.id) {
        throw new Error(`filename stem ${stem} must equal frontmatter id ${data.id}`);
      }
      entries.push({ id: data.id, data, body: parsed.content });
      const lineOffset = contentLineOffset(raw, parsed.content);

      for (const formula of extractFormulas(parsed.content)) {
        formulaCount += 1;
        try {
          renderTexToSvg(formula.tex, formula.display);
        } catch (error) {
          const detail = error instanceof Error ? error.message : String(error);
          errors.push(
            `${name}: formula ${formula.index}, line ${formula.line + lineOffset}: ${detail}\n${formula.tex}`,
          );
        }
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      errors.push(`${name}: ${detail}`);
    }
  }

  try {
    validateRelationships(entries);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  if (errors.length > 0) {
    throw new Error(`Content validation failed:\n${errors.join('\n\n')}`);
  }

  return { entries: entries.length, formulas: formulaCount };
}

const commandPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (commandPath === import.meta.url) {
  validateContentDirectory()
    .then((report) => {
      console.log(`Validated ${report.entries} entries and ${report.formulas} formulas.`);
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
