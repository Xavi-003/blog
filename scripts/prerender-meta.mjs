#!/usr/bin/env node

/**
 * prerender-meta.mjs
 *
 * Post-build script that generates a static HTML file for each blog post slug.
 * Each file contains the correct SEO meta tags baked in, so social media crawlers
 * (Facebook, Twitter, LinkedIn, WhatsApp) see the right title, description, image,
 * and Open Graph / Twitter Card tags without executing JavaScript.
 *
 * Usage: node scripts/prerender-meta.mjs
 * Runs automatically as part of `npm run build`.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const POSTS_PATH = resolve(ROOT, 'src', 'data', 'posts.json');
const B2B_POSTS_PATH = resolve(ROOT, 'src', 'data', 'b2bAnalystPosts.ts');
const TEMPLATE_PATH = resolve(DIST, 'index.html');
const BASE_URL = 'https://xavi-003.github.io/blog';

function parseB2BPosts(fileContent) {
  const posts = [];
  const blocks = fileContent.split(/id:\s*["']b2b-post-/);
  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i];
    const slug = (b.match(/slug:\s*["']([^"']+)["']/) || [])[1];
    const title = (b.match(/title:\s*["']([^"']+)["']/) || [])[1];
    const subtitle = (b.match(/subtitle:\s*["']([^"']+)["']/) || [])[1];
    const date = (b.match(/date:\s*["']([^"']+)["']/) || [])[1] || '2026-08-20';
    const image = (b.match(/image:\s*["']([^"']+)["']/) || [])[1] || '';
    const category = (b.match(/category:\s*["']([^"']+)["']/) || [])[1] || 'Enterprise AI';
    if (slug && title) {
      posts.push({ slug, title, subtitle: subtitle || '', date, image, category });
    }
  }
  return posts;
}

/**
 * Strips markdown syntax and truncates text for use as a meta description.
 * Mirrors the `generateMetaDescription` function in useDocumentMeta.ts.
 */
export function generateMetaDescription(content, maxLength = 160) {
    if (!content) return 'Executive B2B technology intelligence report.';
    const stripped = content
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[(.+?)\]\(.*?\)/g, '$1')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/---+/g, '')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength - 3).trimEnd() + '...';
}

/**
 * Escapes HTML special characters in a string for safe use in attribute values.
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Generates a complete HTML string from the template with post-specific meta tags.
 */
export function buildPostHtml(template, post) {
    const rawDesc = post.subtitle || generateMetaDescription(post.content);
    const description = escapeHtml(rawDesc);
    const title = escapeHtml(post.title);
    const fullTitle = escapeHtml(`${post.title} | AI Insights Pro`);
    const keywords = escapeHtml(`${post.category || 'Tech'}, AI, Technology, B2B Intelligence, ${post.source || 'AI Insights Pro'}`);
    const author = escapeHtml(post.author?.name || 'Antony Xavier — Lead Tech & Systems Analyst');
    const image = post.image || '';
    const postUrl = `${BASE_URL}/blog/${post.slug}`;
    const publishedTime = new Date(post.date || Date.now()).toISOString();
    const twitterCard = post.image ? 'summary_large_image' : 'summary';

    let html = template;

    // Replace <title>
    html = html.replace(
        /<title>.*?<\/title>/,
        `<title>${fullTitle}</title>`
    );

    // Replace meta name="description"
    html = html.replace(
        /<meta\s+name="description"\s+content=".*?"\s*\/?>/,
        `<meta name="description" content="${description}" />`
    );

    // Replace meta name="keywords"
    html = html.replace(
        /<meta\s+name="keywords"\s+content=".*?"\s*\/?>/,
        `<meta name="keywords" content="${keywords}" />`
    );

    // Replace meta name="author"
    html = html.replace(
        /<meta\s+name="author"\s+content=".*?"\s*\/?>/,
        `<meta name="author" content="${author}" />`
    );

    // Replace og:title
    html = html.replace(
        /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/,
        `<meta property="og:title" content="${title}" />`
    );

    // Replace og:description
    html = html.replace(
        /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/,
        `<meta property="og:description" content="${description}" />`
    );

    // Replace og:type
    html = html.replace(
        /<meta\s+property="og:type"\s+content=".*?"\s*\/?>/,
        `<meta property="og:type" content="article" />`
    );

    // Replace og:url
    html = html.replace(
        /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/,
        `<meta property="og:url" content="${postUrl}" />`
    );

    // Add og:image (insert after og:url)
    if (image) {
        html = html.replace(
            /(<meta\s+property="og:url"\s+content=".*?"\s*\/>)/,
            `$1\n  <meta property="og:image" content="${escapeHtml(image)}" />`
        );
    }

    // Replace twitter:card
    html = html.replace(
        /<meta\s+name="twitter:card"\s+content=".*?"\s*\/?>/,
        `<meta name="twitter:card" content="${twitterCard}" />`
    );

    // Replace twitter:title
    html = html.replace(
        /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/,
        `<meta name="twitter:title" content="${title}" />`
    );

    // Replace twitter:description
    html = html.replace(
        /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/,
        `<meta name="twitter:description" content="${description}" />`
    );

    // Add twitter:image (insert after twitter:description)
    if (image) {
        html = html.replace(
            /(<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>)/,
            `$1\n  <meta name="twitter:image" content="${escapeHtml(image)}" />`
        );
    }

    // Add article:published_time (insert after og:type)
    html = html.replace(
        /(<meta\s+property="og:type"\s+content="article"\s*\/>)/,
        `$1\n  <meta property="article:published_time" content="${publishedTime}" />`
    );

    // Replace canonical link
    html = html.replace(
        /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/,
        `<link rel="canonical" href="${postUrl}" />`
    );

    return html;
}

/**
 * Main entry point — reads posts.json and b2bAnalystPosts, the dist template, and writes per-slug HTML.
 */
function main() {
    if (!existsSync(TEMPLATE_PATH)) {
        console.error('❌ dist/index.html not found. Run `vite build` first.');
        process.exit(1);
    }

    const template = readFileSync(TEMPLATE_PATH, 'utf-8');
    const seenSlugs = new Set();
    const allPosts = [];

    // 1. Read b2bAnalystPosts
    if (existsSync(B2B_POSTS_PATH)) {
        try {
            const content = readFileSync(B2B_POSTS_PATH, 'utf-8');
            const b2bPosts = parseB2BPosts(content);
            for (const post of b2bPosts) {
                if (!seenSlugs.has(post.slug)) {
                    seenSlugs.add(post.slug);
                    allPosts.push(post);
                }
            }
        } catch (e) {
            console.warn('Could not parse b2bAnalystPosts in prerender-meta:', e);
        }
    }

    // 2. Read posts.json
    if (existsSync(POSTS_PATH)) {
        const posts = JSON.parse(readFileSync(POSTS_PATH, 'utf-8'));
        for (const post of posts) {
            if (!seenSlugs.has(post.slug)) {
                seenSlugs.add(post.slug);
                allPosts.push(post);
            }
        }
    }

    let count = 0;

    for (const post of allPosts) {
        const slugDir = resolve(DIST, 'blog', post.slug);
        const outputPath = resolve(slugDir, 'index.html');

        mkdirSync(slugDir, { recursive: true });

        const html = buildPostHtml(template, post);
        writeFileSync(outputPath, html, 'utf-8');
        count++;
    }

    console.log(`✅ Pre-rendered ${count} blog post(s) with SEO meta tags.`);
}

// Run only when executed directly (not imported for tests)
const isDirectExecution = process.argv[1] && resolve(process.argv[1]) === __filename;
if (isDirectExecution) {
    main();
}
