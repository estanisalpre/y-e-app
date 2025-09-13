import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: netlify(),
  site: 'https://tu-love-pwa.netlify.app'
});