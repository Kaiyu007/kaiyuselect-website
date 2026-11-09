import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kaiyuselect.com.au',
  output: 'static',
  trailingSlash: 'ignore',
  // Preserve the existing inline spacing rather than Astro 7's JSX whitespace rules.
  compressHTML: true,
});
