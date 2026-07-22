import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';

import { rehypeRenderMath } from './src/lib/math/rehype-render-math.ts';

const site = process.env.SITE_URL ?? 'https://example.invalid';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  output: 'static',
  site,
  base,
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeRenderMath],
    }),
  },
});
