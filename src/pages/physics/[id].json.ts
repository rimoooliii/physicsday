import { resolve } from 'node:path';

import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

import { readSource } from '../../lib/content/source';
import { withBase } from '../../lib/site';

export const getStaticPaths = (async () => {
  const entries = await getCollection('physics', ({ data }) => data.status !== 'draft');
  return entries.map((entry) => ({
    params: { id: entry.data.id },
    props: { entry },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, site }) => {
  const entry = props.entry as CollectionEntry<'physics'>;
  const source = await readSource(
    entry.data.id,
    resolve('src/content/physics'),
  );
  const origin = site ?? new URL('https://example.invalid');
  const base = import.meta.env.BASE_URL;
  const canonicalUrl = new URL(
    withBase(`/physics/${entry.data.id}/`, base),
    origin,
  ).toString();
  const sourceMarkdownUrl = new URL(
    withBase(`/physics/${entry.data.id}.md`, base),
    origin,
  ).toString();
  const metadata = {
    ...entry.data,
    date: entry.data.date.toISOString().slice(0, 10),
    updated_at: entry.data.updated_at.toISOString().slice(0, 10),
  };
  const payload = {
    schema_version: 1,
    id: entry.data.id,
    canonical_url: canonicalUrl,
    source_markdown_url: sourceMarkdownUrl,
    metadata,
    content_markdown: source.body,
    content_sha256: source.contentSha256,
    formula_count: source.formulas.length,
    formulas: source.formulas,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
