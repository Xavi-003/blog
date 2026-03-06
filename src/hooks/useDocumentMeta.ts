/**
 * useDocumentMeta — A custom React hook for dynamic SEO meta tag management.
 *
 * Dynamically updates document.title, meta tags (description, keywords, og:*, twitter:*),
 * canonical link, and article metadata when a component mounts.
 * Restores defaults on cleanup (unmount).
 */

import { useEffect } from 'react';

/** Shape of meta tag configuration passed to the hook */
export interface DocumentMeta {
    title: string;
    description: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogType?: string;
    ogImage?: string;
    ogUrl?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    author?: string;
    articlePublishedTime?: string;
    canonicalUrl?: string;
}

/** Default homepage SEO values */
export const DEFAULT_META: DocumentMeta = {
    title: 'AI Insights Pro | Future of Tech',
    description: 'Automated daily tech insights and analysis powered by Google Gemini AI.',
    keywords: 'AI, Technology, News, Automation, Future Tech, Gemini AI',
    ogTitle: 'AI Insights Pro',
    ogDescription: 'Automated daily tech insights and analysis powered by Google Gemini AI.',
    ogType: 'website',
    ogImage: '',
    ogUrl: '',
    twitterCard: 'summary',
    twitterTitle: 'AI Insights Pro',
    twitterDescription: 'Automated daily tech insights and analysis powered by Google Gemini AI.',
    twitterImage: '',
    author: 'AI Insights Pro',
    articlePublishedTime: '',
    canonicalUrl: '',
};

/**
 * Truncates a raw content string to a max character length,
 * stripping markdown syntax for a clean meta description.
 */
export function generateMetaDescription(content: string, maxLength: number = 160): string {
    // Strip markdown: headers, bold, italic, links, images, lists, horizontal rules
    const stripped = content
        .replace(/#{1,6}\s+/g, '')          // headers
        .replace(/\*\*(.+?)\*\*/g, '$1')    // bold
        .replace(/\*(.+?)\*/g, '$1')        // italic
        .replace(/!\[.*?\]\(.*?\)/g, '')    // images
        .replace(/\[(.+?)\]\(.*?\)/g, '$1') // links
        .replace(/^\s*[-*+]\s+/gm, '')      // list items
        .replace(/---+/g, '')               // horizontal rules
        .replace(/\n+/g, ' ')              // newlines → spaces
        .replace(/\s+/g, ' ')             // collapse whitespace
        .trim();

    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength - 3).trimEnd() + '...';
}

/** Helper to set or create a <meta> tag */
function setMetaTag(attribute: string, key: string, content: string): void {
    const selector = `meta[${attribute}="${key}"]`;
    let element = document.querySelector(selector) as HTMLMetaElement | null;

    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }

    element.setAttribute('content', content);
}

/** Helper to set or create the <link rel="canonical"> tag */
function setCanonicalLink(url: string): void {
    let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        document.head.appendChild(element);
    }

    element.setAttribute('href', url);
}

/**
 * useDocumentMeta — Sets document meta tags based on the provided config.
 * On unmount, restores the default homepage meta tags.
 */
export function useDocumentMeta(meta: DocumentMeta): void {
    useEffect(() => {
        // --- Set title ---
        document.title = meta.title;

        // --- Standard meta tags ---
        setMetaTag('name', 'description', meta.description);
        if (meta.keywords) setMetaTag('name', 'keywords', meta.keywords);
        if (meta.author) setMetaTag('name', 'author', meta.author);

        // --- Open Graph tags ---
        setMetaTag('property', 'og:title', meta.ogTitle || meta.title);
        setMetaTag('property', 'og:description', meta.ogDescription || meta.description);
        setMetaTag('property', 'og:type', meta.ogType || 'website');
        if (meta.ogImage) setMetaTag('property', 'og:image', meta.ogImage);
        if (meta.ogUrl) setMetaTag('property', 'og:url', meta.ogUrl);

        // --- Twitter Card tags ---
        setMetaTag('name', 'twitter:card', meta.twitterCard || 'summary');
        setMetaTag('name', 'twitter:title', meta.twitterTitle || meta.title);
        setMetaTag('name', 'twitter:description', meta.twitterDescription || meta.description);
        if (meta.twitterImage) setMetaTag('name', 'twitter:image', meta.twitterImage);

        // --- Article-specific ---
        if (meta.articlePublishedTime) {
            setMetaTag('property', 'article:published_time', meta.articlePublishedTime);
        }

        // --- Canonical URL ---
        if (meta.canonicalUrl) setCanonicalLink(meta.canonicalUrl);

        // --- Cleanup: restore defaults on unmount ---
        return () => {
            document.title = DEFAULT_META.title;
            setMetaTag('name', 'description', DEFAULT_META.description);
            setMetaTag('name', 'keywords', DEFAULT_META.keywords || '');
            setMetaTag('name', 'author', DEFAULT_META.author || '');
            setMetaTag('property', 'og:title', DEFAULT_META.ogTitle || '');
            setMetaTag('property', 'og:description', DEFAULT_META.ogDescription || '');
            setMetaTag('property', 'og:type', DEFAULT_META.ogType || 'website');
            setMetaTag('property', 'og:image', DEFAULT_META.ogImage || '');
            setMetaTag('property', 'og:url', DEFAULT_META.ogUrl || '');
            setMetaTag('name', 'twitter:card', DEFAULT_META.twitterCard || 'summary');
            setMetaTag('name', 'twitter:title', DEFAULT_META.twitterTitle || '');
            setMetaTag('name', 'twitter:description', DEFAULT_META.twitterDescription || '');
            setMetaTag('name', 'twitter:image', DEFAULT_META.twitterImage || '');
        };
    }, [
        meta.title, meta.description, meta.keywords, meta.ogTitle, meta.ogDescription,
        meta.ogType, meta.ogImage, meta.ogUrl, meta.twitterCard, meta.twitterTitle,
        meta.twitterDescription, meta.twitterImage, meta.author, meta.articlePublishedTime,
        meta.canonicalUrl,
    ]);
}
