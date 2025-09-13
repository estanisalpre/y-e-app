import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwind()],
  },
  output: 'server',
  adapter: netlify(),
  site: 'https://tu-love-pwa.netlify.app'
});