/**
 * Comprehensive unit tests for useDocumentMeta hook and SEO utilities.
 *
 * Covers:
 * 1. Homepage default meta tags
 * 2. Blog post dynamic meta tags (title, description, og:*, twitter:*, article:*, canonical)
 * 3. Cleanup/restore on unmount
 * 4. Missing image handling
 * 5. Description truncation from long content
 * 6. Special characters in titles/descriptions
 * 7. Keywords from category
 * 8. Canonical URL generation
 * 9. Twitter card type based on image presence
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
    useDocumentMeta,
    generateMetaDescription,
    DEFAULT_META,
    type DocumentMeta,
} from './useDocumentMeta';

/** Helper to read a meta tag's content attribute */
function getMetaContent(attribute: string, key: string): string | null {
    const el = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
    return el ? el.getAttribute('content') : null;
}

/** Helper to read the canonical link href */
function getCanonicalHref(): string | null {
    const el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    return el ? el.getAttribute('href') : null;
}

/** Clear all meta tags and canonical links between tests */
function clearHead(): void {
    document.querySelectorAll('meta[name], meta[property]').forEach(el => el.remove());
    document.querySelectorAll('link[rel="canonical"]').forEach(el => el.remove());
    document.title = '';
}

describe('generateMetaDescription', () => {
    it('should strip markdown headers and return plain text', () => {
        const markdown = '## Executive Summary\n\nThis is a great post about AI.';
        const result = generateMetaDescription(markdown);
        expect(result).toBe('Executive Summary This is a great post about AI.');
        expect(result).not.toContain('##');
    });

    it('should strip bold and italic markdown syntax', () => {
        const md = 'This has **bold text** and *italic text* inside.';
        const result = generateMetaDescription(md);
        expect(result).toBe('This has bold text and italic text inside.');
    });

    it('should strip markdown links but keep link text', () => {
        const md = 'Check out [this link](https://example.com) for more info.';
        const result = generateMetaDescription(md);
        expect(result).toBe('Check out this link for more info.');
    });

    it('should truncate to default max length (160 chars) with ellipsis', () => {
        const longText = 'A'.repeat(200);
        const result = generateMetaDescription(longText);
        expect(result.length).toBeLessThanOrEqual(160);
        expect(result).toMatch(/\.\.\.$/);
    });

    it('should truncate to a custom max length', () => {
        const longText = 'A'.repeat(100);
        const result = generateMetaDescription(longText, 50);
        expect(result.length).toBeLessThanOrEqual(50);
        expect(result).toMatch(/\.\.\.$/);
    });

    it('should not add ellipsis when content is shorter than max length', () => {
        const shortText = 'Short description here.';
        const result = generateMetaDescription(shortText);
        expect(result).toBe('Short description here.');
        expect(result).not.toMatch(/\.\.\.$/);
    });

    it('should strip list item markers', () => {
        const md = '- Item one\n* Item two\n+ Item three';
        const result = generateMetaDescription(md);
        expect(result).toBe('Item one Item two Item three');
    });

    it('should strip horizontal rules', () => {
        const md = 'Before rule\n\n---\n\nAfter rule';
        const result = generateMetaDescription(md);
        expect(result).toBe('Before rule After rule');
    });

    it('should handle special characters (quotes, ampersands) correctly', () => {
        const md = 'Apple\'s "AI Revolution" & Google\'s $5B bet on chips.';
        const result = generateMetaDescription(md);
        expect(result).toBe('Apple\'s "AI Revolution" & Google\'s $5B bet on chips.');
    });
});

describe('useDocumentMeta — Homepage Defaults (DEFAULT_META)', () => {
    beforeEach(clearHead);
    afterEach(clearHead);

    it('should set correct document title for homepage', () => {
        renderHook(() => useDocumentMeta(DEFAULT_META));
        expect(document.title).toBe('AI Insights Pro | Future of Tech');
    });

    it('should set correct meta description for homepage', () => {
        renderHook(() => useDocumentMeta(DEFAULT_META));
        expect(getMetaContent('name', 'description')).toBe(
            'Automated daily tech insights and analysis powered by Google Gemini AI.'
        );
    });

    it('should set correct meta keywords for homepage', () => {
        renderHook(() => useDocumentMeta(DEFAULT_META));
        expect(getMetaContent('name', 'keywords')).toBe(
            'AI, Technology, News, Automation, Future Tech, Gemini AI'
        );
    });

    it('should set og:type to "website" for homepage', () => {
        renderHook(() => useDocumentMeta(DEFAULT_META));
        expect(getMetaContent('property', 'og:type')).toBe('website');
    });

    it('should set og:title for homepage', () => {
        renderHook(() => useDocumentMeta(DEFAULT_META));
        expect(getMetaContent('property', 'og:title')).toBe('AI Insights Pro');
    });

    it('should set og:description for homepage', () => {
        renderHook(() => useDocumentMeta(DEFAULT_META));
        expect(getMetaContent('property', 'og:description')).toBe(
            'Automated daily tech insights and analysis powered by Google Gemini AI.'
        );
    });

    it('should set twitter:card to "summary" for homepage', () => {
        renderHook(() => useDocumentMeta(DEFAULT_META));
        expect(getMetaContent('name', 'twitter:card')).toBe('summary');
    });

    it('should set twitter:title for homepage', () => {
        renderHook(() => useDocumentMeta(DEFAULT_META));
        expect(getMetaContent('name', 'twitter:title')).toBe('AI Insights Pro');
    });

    it('should set twitter:description for homepage', () => {
        renderHook(() => useDocumentMeta(DEFAULT_META));
        expect(getMetaContent('name', 'twitter:description')).toBe(
            'Automated daily tech insights and analysis powered by Google Gemini AI.'
        );
    });

    it('should set author meta tag for homepage', () => {
        renderHook(() => useDocumentMeta(DEFAULT_META));
        expect(getMetaContent('name', 'author')).toBe('AI Insights Pro');
    });
});

describe('useDocumentMeta — Blog Post Meta Tags', () => {
    beforeEach(clearHead);
    afterEach(clearHead);

    const POST_META: DocumentMeta = {
        title: 'AI Revolution 2026 | AI Insights Pro',
        description: 'A deep dive into the AI revolution of 2026 and what it means for tech.',
        keywords: 'AI, Technology, Revolution, techcrunch.com',
        ogTitle: 'AI Revolution 2026',
        ogDescription: 'A deep dive into the AI revolution of 2026 and what it means for tech.',
        ogType: 'article',
        ogImage: 'https://example.com/image.jpg',
        ogUrl: 'https://xavi-003.github.io/blog/blog/ai-revolution-2026',
        twitterCard: 'summary_large_image',
        twitterTitle: 'AI Revolution 2026',
        twitterDescription: 'A deep dive into the AI revolution of 2026 and what it means for tech.',
        twitterImage: 'https://example.com/image.jpg',
        author: 'AI Insights Pro — via techcrunch.com',
        articlePublishedTime: '2026-02-19T11:43:21.000Z',
        canonicalUrl: 'https://xavi-003.github.io/blog/blog/ai-revolution-2026',
    };

    it('should set post-specific document title', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(document.title).toBe('AI Revolution 2026 | AI Insights Pro');
    });

    it('should set post-specific meta description', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getMetaContent('name', 'description')).toBe(
            'A deep dive into the AI revolution of 2026 and what it means for tech.'
        );
    });

    it('should set post-specific keywords including category and source', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getMetaContent('name', 'keywords')).toBe(
            'AI, Technology, Revolution, techcrunch.com'
        );
    });

    it('should set og:type to "article" for blog posts', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getMetaContent('property', 'og:type')).toBe('article');
    });

    it('should set og:title to the post title', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getMetaContent('property', 'og:title')).toBe('AI Revolution 2026');
    });

    it('should set og:description to the post description', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getMetaContent('property', 'og:description')).toBe(
            'A deep dive into the AI revolution of 2026 and what it means for tech.'
        );
    });

    it('should set og:image to the post image URL', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getMetaContent('property', 'og:image')).toBe('https://example.com/image.jpg');
    });

    it('should set og:url to the post canonical URL', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getMetaContent('property', 'og:url')).toBe(
            'https://xavi-003.github.io/blog/blog/ai-revolution-2026'
        );
    });

    it('should set twitter:card to "summary_large_image" when post has an image', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getMetaContent('name', 'twitter:card')).toBe('summary_large_image');
    });

    it('should set twitter:title to the post title', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getMetaContent('name', 'twitter:title')).toBe('AI Revolution 2026');
    });

    it('should set twitter:description to the post description', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getMetaContent('name', 'twitter:description')).toBe(
            'A deep dive into the AI revolution of 2026 and what it means for tech.'
        );
    });

    it('should set twitter:image to the post image URL', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getMetaContent('name', 'twitter:image')).toBe('https://example.com/image.jpg');
    });

    it('should set author meta tag for blog post', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getMetaContent('name', 'author')).toBe('AI Insights Pro — via techcrunch.com');
    });

    it('should set article:published_time meta tag', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getMetaContent('property', 'article:published_time')).toBe(
            '2026-02-19T11:43:21.000Z'
        );
    });

    it('should set canonical link href for blog post', () => {
        renderHook(() => useDocumentMeta(POST_META));
        expect(getCanonicalHref()).toBe(
            'https://xavi-003.github.io/blog/blog/ai-revolution-2026'
        );
    });
});

describe('useDocumentMeta — Cleanup/Restore on Unmount', () => {
    beforeEach(clearHead);
    afterEach(clearHead);

    it('should restore homepage title when unmounted', () => {
        const postMeta: DocumentMeta = {
            title: 'Some Post | AI Insights Pro',
            description: 'Post description.',
            ogType: 'article',
        };

        const { unmount } = renderHook(() => useDocumentMeta(postMeta));
        expect(document.title).toBe('Some Post | AI Insights Pro');

        unmount();
        expect(document.title).toBe('AI Insights Pro | Future of Tech');
    });

    it('should restore homepage meta description when unmounted', () => {
        const postMeta: DocumentMeta = {
            title: 'Test',
            description: 'Custom post description.',
        };

        const { unmount } = renderHook(() => useDocumentMeta(postMeta));
        expect(getMetaContent('name', 'description')).toBe('Custom post description.');

        unmount();
        expect(getMetaContent('name', 'description')).toBe(
            'Automated daily tech insights and analysis powered by Google Gemini AI.'
        );
    });

    it('should restore og:type to "website" when unmounted', () => {
        const postMeta: DocumentMeta = {
            title: 'Test',
            description: 'Test desc',
            ogType: 'article',
        };

        const { unmount } = renderHook(() => useDocumentMeta(postMeta));
        expect(getMetaContent('property', 'og:type')).toBe('article');

        unmount();
        expect(getMetaContent('property', 'og:type')).toBe('website');
    });

    it('should restore twitter:card to "summary" when unmounted', () => {
        const postMeta: DocumentMeta = {
            title: 'Test',
            description: 'Test desc',
            twitterCard: 'summary_large_image',
        };

        const { unmount } = renderHook(() => useDocumentMeta(postMeta));
        expect(getMetaContent('name', 'twitter:card')).toBe('summary_large_image');

        unmount();
        expect(getMetaContent('name', 'twitter:card')).toBe('summary');
    });

    it('should restore og:title to homepage default when unmounted', () => {
        const postMeta: DocumentMeta = {
            title: 'Test',
            description: 'Test desc',
            ogTitle: 'My Custom OG Title',
        };

        const { unmount } = renderHook(() => useDocumentMeta(postMeta));
        expect(getMetaContent('property', 'og:title')).toBe('My Custom OG Title');

        unmount();
        expect(getMetaContent('property', 'og:title')).toBe('AI Insights Pro');
    });
});

describe('useDocumentMeta — Edge Cases', () => {
    beforeEach(clearHead);
    afterEach(clearHead);

    it('should handle missing image gracefully (no og:image set)', () => {
        const meta: DocumentMeta = {
            title: 'No Image Post | AI Insights Pro',
            description: 'A post without an image.',
            ogImage: '',
            twitterImage: '',
        };

        renderHook(() => useDocumentMeta(meta));
        // og:image should not be set when empty string
        // The meta element may exist but with empty content
        const ogImage = getMetaContent('property', 'og:image');
        // We do NOT set the tag when value is empty, it is a falsy check
        expect(ogImage).toBeNull();
    });

    it('should set twitter:card to "summary" when post has no image', () => {
        const meta: DocumentMeta = {
            title: 'No Image Post',
            description: 'No image here.',
            twitterCard: 'summary',
            twitterImage: '',
        };

        renderHook(() => useDocumentMeta(meta));
        expect(getMetaContent('name', 'twitter:card')).toBe('summary');
    });

    it('should handle special characters in title without corruption', () => {
        const meta: DocumentMeta = {
            title: 'Apple\'s "M4 Max" & Google\'s $5B Chip — Analysis',
            description: 'Special chars: <script>alert("xss")</script>',
        };

        renderHook(() => useDocumentMeta(meta));
        expect(document.title).toBe('Apple\'s "M4 Max" & Google\'s $5B Chip — Analysis');
        expect(getMetaContent('name', 'description')).toBe(
            'Special chars: <script>alert("xss")</script>'
        );
    });

    it('should create meta tags that do not yet exist in the DOM', () => {
        // Verify no meta tags exist before
        expect(getMetaContent('property', 'article:published_time')).toBeNull();

        const meta: DocumentMeta = {
            title: 'Test',
            description: 'Test',
            articlePublishedTime: '2026-01-01T00:00:00.000Z',
        };

        renderHook(() => useDocumentMeta(meta));
        expect(getMetaContent('property', 'article:published_time')).toBe(
            '2026-01-01T00:00:00.000Z'
        );
    });

    it('should update existing meta tags when re-rendered with new values', () => {
        const meta1: DocumentMeta = {
            title: 'First Title',
            description: 'First description.',
        };
        const meta2: DocumentMeta = {
            title: 'Second Title',
            description: 'Second description.',
        };

        const { rerender } = renderHook(
            ({ meta }) => useDocumentMeta(meta),
            { initialProps: { meta: meta1 } }
        );

        expect(document.title).toBe('First Title');
        expect(getMetaContent('name', 'description')).toBe('First description.');

        rerender({ meta: meta2 });

        expect(document.title).toBe('Second Title');
        expect(getMetaContent('name', 'description')).toBe('Second description.');
    });

    it('should set canonical link tag correctly', () => {
        const meta: DocumentMeta = {
            title: 'Test',
            description: 'Test',
            canonicalUrl: 'https://xavi-003.github.io/blog/blog/my-cool-post',
        };

        renderHook(() => useDocumentMeta(meta));
        expect(getCanonicalHref()).toBe('https://xavi-003.github.io/blog/blog/my-cool-post');
    });

    it('should not create canonical link tag when canonicalUrl is empty', () => {
        const meta: DocumentMeta = {
            title: 'Test',
            description: 'Test',
            canonicalUrl: '',
        };

        renderHook(() => useDocumentMeta(meta));
        expect(getCanonicalHref()).toBeNull();
    });
});
