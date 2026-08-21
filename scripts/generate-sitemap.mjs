import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsPath = path.resolve(__dirname, '../src/data/posts.json');
const b2bPostsPath = path.resolve(__dirname, '../src/data/b2bAnalystPosts.ts');
const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
const baseUrl = 'https://xavi-003.github.io/blog';

function parseB2BPosts(fileContent) {
  const posts = [];
  const blocks = fileContent.split(/id:\s*["']b2b-post-/);
  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i];
    const slug = (b.match(/slug:\s*["']([^"']+)["']/) || [])[1];
    const date = (b.match(/date:\s*["']([^"']+)["']/) || [])[1] || '2026-08-20';
    if (slug) {
      posts.push({ slug, date });
    }
  }
  return posts;
}

// 1. Read raw posts from posts.json
let posts = [];
if (fs.existsSync(postsPath)) {
  try {
    posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
  } catch (e) {
    console.error('Error parsing posts.json:', e);
  }
}

// 2. Extract flagship posts from b2bAnalystPosts.ts
let b2bPosts = [];
if (fs.existsSync(b2bPostsPath)) {
  try {
    const content = fs.readFileSync(b2bPostsPath, 'utf8');
    b2bPosts = parseB2BPosts(content);
  } catch (e) {
    console.warn('Could not parse b2bAnalystPosts in sitemap:', e);
  }
}

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

// Add B2B posts first (high priority)
b2bPosts.forEach(post => {
  if (seenSlugs.has(post.slug)) return;
  seenSlugs.add(post.slug);
  uniqueCount++;

  let modDate = new Date().toISOString().split('T')[0];
  if (post.date) {
    try {
      modDate = new Date(post.date).toISOString().split('T')[0];
    } catch(e) {}
  }
  
  sitemapXml += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${modDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;
});

// Add all automated posts
posts.forEach(post => {
  if (seenSlugs.has(post.slug)) return;
  seenSlugs.add(post.slug);
  uniqueCount++;

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
console.log(`✅ Generated sitemap.xml with ${uniqueCount + 1} unique URLs (1 home + ${uniqueCount} posts)`);
