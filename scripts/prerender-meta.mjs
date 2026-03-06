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
const TEMPLATE_PATH = resolve(DIST, 'index.html');
const BASE_URL = 'https://xavi-003.github.io/blog';

/**
 * Strips markdown syntax and truncates text for use as a meta description.
 * Mirrors the `generateMetaDescription` function in useDocumentMeta.ts.
 */
export function generateMetaDescription(content, maxLength = 160) {
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
    const description = escapeHtml(generateMetaDescription(post.content));
    const title = escapeHtml(post.title);
    const fullTitle = escapeHtml(`${post.title} | AI Insights Pro`);
    const keywords = escapeHtml(`${post.category}, AI, Technology, ${post.source}`);
    const author = escapeHtml(`AI Insights Pro — via ${post.source}`);
    const image = post.image || '';
    const postUrl = `${BASE_URL}/blog/${post.slug}`;
    const publishedTime = new Date(post.date).toISOString();
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
            /(<meta\s+name="twitter:description"\s+content=".*?"\s*\/>)/,
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
 * Main entry point — reads posts.json, the dist template, and writes per-slug HTML.
 */
function main() {
    if (!existsSync(TEMPLATE_PATH)) {
        console.error('❌ dist/index.html not found. Run `vite build` first.');
        process.exit(1);
    }

    const posts = JSON.parse(readFileSync(POSTS_PATH, 'utf-8'));
    const template = readFileSync(TEMPLATE_PATH, 'utf-8');

    let count = 0;

    for (const post of posts) {
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
