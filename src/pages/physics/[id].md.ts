import { resolve } from 'node:path';

import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

import { readSource } from '../../lib/content/source';

export const getStaticPaths = (async () => {
  const entries = await getCollection('physics', ({ data }) => data.status !== 'draft');
  return entries.map((entry) => ({
    params: { id: entry.data.id },
    props: { entry },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry as CollectionEntry<'physics'>;
  const source = await readSource(
    entry.data.id,
    resolve('src/content/physics'),
  );
  return new Response(source.raw, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
