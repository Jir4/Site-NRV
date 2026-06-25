import { defineConfig } from 'astro/config';

function normalizeSiteUrl(value) {
  if (!value) {
    return undefined;
  }

  return value.startsWith('http') ? value : `https://${value}`;
}

const site = normalizeSiteUrl(
  process.env.PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL,
);

export default defineConfig({
  output: 'static',
  site,
});
