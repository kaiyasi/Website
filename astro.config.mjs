import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gonets.top',
  output: 'static',
  integrations: [sitemap()],
  devToolbar: { enabled: false },
});
