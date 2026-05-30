import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsPath = path.resolve(__dirname, '../src/data/posts.json');
const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
const baseUrl = 'https://xavi-003.github.io/blog';

const postsRaw = fs.readFileSync(postsPath, 'utf8');
const posts = JSON.parse(postsRaw);

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

const seenSlugs = new Set();
let uniqueCount = 0;

posts.forEach(post => {
  if (seenSlugs.has(post.slug)) return;
  seenSlugs.add(post.slug);
  uniqueCount++;

  // Use post.date, fallback to current date if missing or invalid
  let modDate = new Date().toISOString().split('T')[0];
  if (post.date) {
    try {
      modDate = new Date(post.date).toISOString().split('T')[0];
    } catch(e) {}
  }
  
  sitemapXml += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${modDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
});

sitemapXml += `</urlset>\n`;

fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
console.log(`Generated sitemap.xml with ${uniqueCount + 1} unique URLs (1 home + ${uniqueCount} posts)`);
