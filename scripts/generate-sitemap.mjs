import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://pamod.is-a.dev";
const TODAY = new Date().toISOString().slice(0, 10);

const indexedRoutes = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/projects", changefreq: "weekly", priority: "0.9" },
  { path: "/articles", changefreq: "weekly", priority: "0.7" },
];

const normalizePath = (routePath) => {
  if (routePath === "/") {
    return "/";
  }

  return routePath.startsWith("/") ? routePath : `/${routePath}`;
};

const routeEntries = indexedRoutes
  .map((route) => {
    const normalizedPath = normalizePath(route.path);
    const absoluteUrl = `${SITE_URL}${normalizedPath === "/" ? "/" : normalizedPath}`;

    return `  <url>\n    <loc>${absoluteUrl}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`;
  })
  .join("\n");

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routeEntries}\n</urlset>\n`;

const currentFilePath = fileURLToPath(import.meta.url);
const scriptsDir = dirname(currentFilePath);
const outputPath = join(scriptsDir, "..", "public", "sitemap.xml");

writeFileSync(outputPath, sitemapXml, "utf8");
console.log(`Sitemap generated at ${outputPath}`);
