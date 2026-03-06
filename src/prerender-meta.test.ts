/**
 * Unit tests for the prerender-meta.mjs script.
 *
 * Tests the HTML generation logic to ensure all meta tags are correctly
 * replaced for individual blog post pages.
 */

import { describe, it, expect } from 'vitest';
import { buildPostHtml, generateMetaDescription } from '../scripts/prerender-meta.mjs';

/** Minimal HTML template mimicking dist/index.html */
const TEMPLATE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Insights Pro | Future of Tech</title>
  <meta name="description" content="Automated daily tech insights and analysis powered by Google Gemini AI." />
  <meta name="keywords" content="AI, Technology, News, Automation, Future Tech, Gemini AI" />
  <meta name="author" content="AI Insights Pro" />
  <meta property="og:title" content="AI Insights Pro" />
  <meta property="og:description" content="Automated daily tech insights and analysis powered by Google Gemini AI." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://xavi-003.github.io/blog/" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="AI Insights Pro" />
  <meta name="twitter:description" content="Automated daily tech insights and analysis powered by Google Gemini AI." />
  <link rel="canonical" href="https://xavi-003.github.io/blog/" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;

const MOCK_POST = {
    id: 'test-123',
    title: 'AI Revolution 2026: The Next Frontier',
    slug: 'ai-revolution-2026-the-next-frontier',
    content:
        '## Executive Summary\n\nThis is a **comprehensive** analysis of the AI revolution in 2026. The *implications* are far-reaching.',
    date: '2026-02-19 11:43:21',
    original_link: 'https://techcrunch.com/2026/ai-revolution',
    image: 'https://example.com/ai-image.jpg',
    category: 'AI',
    source: 'techcrunch.com',
    reading_time: '7 min',
    color: '#10b981',
};

const MOCK_POST_NO_IMAGE = {
    ...MOCK_POST,
    id: 'test-456',
    slug: 'no-image-post',
    image: null,
};

describe('prerender-meta: generateMetaDescription', () => {
    it('should strip markdown and truncate', () => {
        const result = generateMetaDescription(MOCK_POST.content);
        expect(result).not.toContain('##');
        expect(result).not.toContain('**');
        expect(result).not.toContain('*');
        expect(result).toContain('comprehensive');
        expect(result).toContain('implications');
    });
});

describe('prerender-meta: buildPostHtml', () => {
    it('should replace <title> with post-specific title', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('<title>AI Revolution 2026: The Next Frontier | AI Insights Pro</title>');
        expect(html).not.toContain('<title>AI Insights Pro | Future of Tech</title>');
    });

    it('should replace meta description with post content summary', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('name="description" content="Executive Summary');
        expect(html).not.toContain('content="Automated daily tech insights');
    });

    it('should replace meta keywords with category and source', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('name="keywords" content="AI, AI, Technology, techcrunch.com"');
    });

    it('should replace meta author with source attribution', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('name="author" content="AI Insights Pro');
        expect(html).toContain('techcrunch.com');
    });

    it('should set og:title to the post title', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('property="og:title" content="AI Revolution 2026: The Next Frontier"');
    });

    it('should set og:description to post content summary', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('property="og:description" content="Executive Summary');
    });

    it('should set og:type to "article"', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('property="og:type" content="article"');
        expect(html).not.toContain('content="website"');
    });

    it('should set og:url to the post URL', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain(
            'property="og:url" content="https://xavi-003.github.io/blog/blog/ai-revolution-2026-the-next-frontier"'
        );
    });

    it('should add og:image when post has an image', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('property="og:image" content="https://example.com/ai-image.jpg"');
    });

    it('should NOT add og:image when post has no image', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST_NO_IMAGE);
        expect(html).not.toContain('property="og:image"');
    });

    it('should set twitter:card to "summary_large_image" when post has image', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('name="twitter:card" content="summary_large_image"');
    });

    it('should set twitter:card to "summary" when post has no image', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST_NO_IMAGE);
        expect(html).toContain('name="twitter:card" content="summary"');
    });

    it('should set twitter:title to the post title', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('name="twitter:title" content="AI Revolution 2026: The Next Frontier"');
    });

    it('should set twitter:description to post content summary', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('name="twitter:description" content="Executive Summary');
    });

    it('should add twitter:image when post has image', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('name="twitter:image" content="https://example.com/ai-image.jpg"');
    });

    it('should NOT add twitter:image when post has no image', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST_NO_IMAGE);
        expect(html).not.toContain('name="twitter:image"');
    });

    it('should add article:published_time meta tag in ISO format', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('property="article:published_time" content="');
        // Should be ISO 8601
        expect(html).toMatch(/article:published_time" content="\d{4}-\d{2}-\d{2}T/);
    });

    it('should set canonical link to the post URL', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain(
            'rel="canonical" href="https://xavi-003.github.io/blog/blog/ai-revolution-2026-the-next-frontier"'
        );
        expect(html).not.toContain('href="https://xavi-003.github.io/blog/"');
    });

    it('should escape HTML special characters in title', () => {
        const post = {
            ...MOCK_POST,
            title: 'Apple\'s "M4 Max" & Google\'s <Chip>',
        };
        const html = buildPostHtml(TEMPLATE, post);
        expect(html).toContain('&amp;');
        expect(html).toContain('&lt;Chip&gt;');
        expect(html).not.toContain('& Google');
    });

    it('should still contain the SPA root div and script', () => {
        const html = buildPostHtml(TEMPLATE, MOCK_POST);
        expect(html).toContain('<div id="root"></div>');
        expect(html).toContain('src="/src/main.tsx"');
    });
});
