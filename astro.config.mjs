import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bohdandomashenko.github.io',
  integrations: [sitemap()],
  markdown: { shikiConfig: { theme: 'github-dark' } },
});
