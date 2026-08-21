/**
 * useDocumentMeta — A custom React hook for dynamic enterprise-grade SEO and Schema.org metadata management.
 *
 * Dynamically updates document.title, meta tags (description, keywords, og:*, twitter:*, article:*),
 * crawler directives (robots, googlebot, bingbot), canonical links, and multi-entity JSON-LD Schema graphs
 * when a component mounts. Restores defaults on cleanup (unmount).
 */

import { useEffect } from 'react';

/** Shape of meta tag configuration passed to the hook */
export interface DocumentMeta {
    title: string;
    description: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogType?: 'website' | 'article' | 'profile' | string;
    ogImage?: string;
    ogImageAlt?: string;
    ogImageWidth?: number | string;
    ogImageHeight?: number | string;
    ogImageType?: string;
    ogUrl?: string;
    ogSiteName?: string;
    ogLocale?: string;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player' | string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    twitterImageAlt?: string;
    twitterSite?: string;
    twitterCreator?: string;
    author?: string;
    articlePublishedTime?: string;
    articleModifiedTime?: string;
    articleSection?: string;
    articleTags?: string[];
    canonicalUrl?: string;
    jsonLd?: Record<string, any> | Record<string, any>[];
    robots?: string;
}

/** Default homepage SEO values */
export const DEFAULT_META: DocumentMeta = {
    title: 'AI Insights Pro | B2B Tech Intelligence, Blockchain Architecture & Enterprise AI Analysis',
    description: 'Executive-grade tech intelligence, enterprise blockchain architecture, AI integration ROI, and data governance analysis for B2B decision-makers and CTOs.',
    keywords: 'Blockchain Development, Enterprise AI, B2B Tech Intelligence, Crypto Infrastructure, AI Governance, Technology ROI, CTO Insights, Decision Maker Briefing',
    ogTitle: 'AI Insights Pro | Enterprise Tech Intelligence & Blockchain Architecture',
    ogDescription: 'Automated daily tech insights, executive decision matrixes, and ROI benchmarks for investors, founders, and CTOs.',
    ogType: 'website',
    ogImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200&h=630',
    ogImageAlt: 'AI Insights Pro - Executive Tech Intelligence Platform',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageType: 'image/jpeg',
    ogUrl: 'https://xavi-003.github.io/blog/',
    ogSiteName: 'AI Insights Pro',
    ogLocale: 'en_US',
    twitterCard: 'summary_large_image',
    twitterTitle: 'AI Insights Pro | Enterprise Tech Intelligence & Blockchain Architecture',
    twitterDescription: 'Automated daily tech insights, executive decision matrixes, and ROI benchmarks for investors, founders, and CTOs.',
    twitterImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200&h=630',
    twitterImageAlt: 'AI Insights Pro Banner',
    twitterSite: '@AIInsightsPro',
    twitterCreator: '@XavierAntony',
    author: 'AI Insights Pro Analyst Bureau',
    articlePublishedTime: '',
    canonicalUrl: 'https://xavi-003.github.io/blog/',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://xavi-003.github.io/blog/#organization",
                "name": "AI Insights Pro",
                "url": "https://xavi-003.github.io/blog/",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://fav.farm/⚡️",
                    "width": 512,
                    "height": 512,
                    "caption": "AI Insights Pro Logo"
                },
                "description": "Executive tech intelligence platform delivering actionable insights on enterprise blockchain development, AI infrastructure, and cybersecurity.",
                "sameAs": [
                    "https://github.com/Xavi-003",
                    "https://www.linkedin.com/in/antony-xavier-4b5019333",
                    "https://xavi-003.github.io/portfolio/"
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "Analyst Inquiries & Research",
                    "url": "https://xavi-003.github.io/portfolio/"
                }
            },
            {
                "@type": "WebSite",
                "@id": "https://xavi-003.github.io/blog/#website",
                "name": "AI Insights Pro",
                "url": "https://xavi-003.github.io/blog/",
                "publisher": {
                    "@id": "https://xavi-003.github.io/blog/#organization"
                },
                "description": "Executive-grade tech intelligence, enterprise blockchain architecture, and AI integration cost analysis.",
                "inLanguage": "en-US",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://xavi-003.github.io/blog/?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@type": "FAQPage",
                "@id": "https://xavi-003.github.io/blog/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "What is AI Insights Pro?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "AI Insights Pro is an executive-grade tech intelligence portal providing enterprise analysis, blockchain architecture benchmarks, AI ROI estimations, and strategic decision frameworks for CTOs, CFOs, and tech leaders."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "How are executive takeaways and ROI estimates calculated?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Our research incorporates real-world benchmark data from verified engineering reports, cloud telemetry, white-label infrastructure costs, and primary industry sources (Gartner, MIT Tech Review, TechCrunch, GitHub)."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Can leadership teams repurpose this intelligence for board decks?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, every briefing includes one-click export tools to generate LinkedIn executive carousels, 2-minute executive email briefs, audio summaries, and structured FAQ snippets."
                        }
                    }
                ]
            }
        ]
    }
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

/** Helper to remove multiple meta tags matching a selector pattern */
function removeMetaTags(selector: string): void {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => el.remove());
}

/** Helper to set or create JSON-LD structured data script tag */
function setJsonLd(data: Record<string, any> | Record<string, any>[] | undefined): void {
    const id = 'dynamic-json-ld';
    let script = document.getElementById(id) as HTMLScriptElement | null;
    
    if (data) {
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = id;
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(data, null, 2);
    } else if (script) {
        script.remove();
    }
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

        // --- Crawler directives ---
        const robotsDirective = meta.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
        setMetaTag('name', 'robots', robotsDirective);
        setMetaTag('name', 'googlebot', robotsDirective);
        setMetaTag('name', 'bingbot', robotsDirective);

        // --- Open Graph tags ---
        setMetaTag('property', 'og:site_name', meta.ogSiteName || 'AI Insights Pro');
        setMetaTag('property', 'og:locale', meta.ogLocale || 'en_US');
        setMetaTag('property', 'og:title', meta.ogTitle || meta.title);
        setMetaTag('property', 'og:description', meta.ogDescription || meta.description);
        setMetaTag('property', 'og:type', meta.ogType || 'website');
        if (meta.ogUrl) setMetaTag('property', 'og:url', meta.ogUrl);
        if (meta.ogImage) {
            setMetaTag('property', 'og:image', meta.ogImage);
            setMetaTag('property', 'og:image:secure_url', meta.ogImage);
            if (meta.ogImageAlt) setMetaTag('property', 'og:image:alt', meta.ogImageAlt);
            if (meta.ogImageWidth) setMetaTag('property', 'og:image:width', String(meta.ogImageWidth));
            if (meta.ogImageHeight) setMetaTag('property', 'og:image:height', String(meta.ogImageHeight));
            if (meta.ogImageType) setMetaTag('property', 'og:image:type', meta.ogImageType);
        }

        // --- Twitter Card tags ---
        setMetaTag('name', 'twitter:card', meta.twitterCard || 'summary_large_image');
        setMetaTag('name', 'twitter:title', meta.twitterTitle || meta.title);
        setMetaTag('name', 'twitter:description', meta.twitterDescription || meta.description);
        if (meta.twitterImage) setMetaTag('name', 'twitter:image', meta.twitterImage);
        if (meta.twitterImageAlt || meta.ogImageAlt) setMetaTag('name', 'twitter:image:alt', meta.twitterImageAlt || meta.ogImageAlt || meta.title);
        if (meta.twitterSite) setMetaTag('name', 'twitter:site', meta.twitterSite);
        if (meta.twitterCreator) setMetaTag('name', 'twitter:creator', meta.twitterCreator);

        // --- Article-specific Open Graph tags ---
        if (meta.articlePublishedTime) {
            setMetaTag('property', 'article:published_time', meta.articlePublishedTime);
        }
        if (meta.articleModifiedTime) {
            setMetaTag('property', 'article:modified_time', meta.articleModifiedTime);
        }
        if (meta.author) {
            setMetaTag('property', 'article:author', meta.author);
        }
        if (meta.articleSection) {
            setMetaTag('property', 'article:section', meta.articleSection);
        }
        if (meta.articleTags && meta.articleTags.length > 0) {
            removeMetaTags('meta[property="article:tag"]');
            meta.articleTags.forEach(tag => {
                const tagEl = document.createElement('meta');
                tagEl.setAttribute('property', 'article:tag');
                tagEl.setAttribute('content', tag);
                document.head.appendChild(tagEl);
            });
        }

        // --- Canonical URL ---
        if (meta.canonicalUrl) setCanonicalLink(meta.canonicalUrl);

        // --- Structured Data (JSON-LD) ---
        setJsonLd(meta.jsonLd);

        // --- Cleanup: restore defaults on unmount ---
        return () => {
            document.title = DEFAULT_META.title;
            setMetaTag('name', 'description', DEFAULT_META.description);
            setMetaTag('name', 'keywords', DEFAULT_META.keywords || '');
            setMetaTag('name', 'author', DEFAULT_META.author || '');
            setMetaTag('name', 'robots', DEFAULT_META.robots || 'index, follow');
            setMetaTag('name', 'googlebot', DEFAULT_META.robots || 'index, follow');
            setMetaTag('name', 'bingbot', DEFAULT_META.robots || 'index, follow');
            setMetaTag('property', 'og:site_name', DEFAULT_META.ogSiteName || 'AI Insights Pro');
            setMetaTag('property', 'og:locale', DEFAULT_META.ogLocale || 'en_US');
            setMetaTag('property', 'og:title', DEFAULT_META.ogTitle || '');
            setMetaTag('property', 'og:description', DEFAULT_META.ogDescription || '');
            setMetaTag('property', 'og:type', DEFAULT_META.ogType || 'website');
            setMetaTag('property', 'og:image', DEFAULT_META.ogImage || '');
            setMetaTag('property', 'og:url', DEFAULT_META.ogUrl || '');
            setMetaTag('name', 'twitter:card', DEFAULT_META.twitterCard || 'summary_large_image');
            setMetaTag('name', 'twitter:title', DEFAULT_META.twitterTitle || '');
            setMetaTag('name', 'twitter:description', DEFAULT_META.twitterDescription || '');
            setMetaTag('name', 'twitter:image', DEFAULT_META.twitterImage || '');
            removeMetaTags('meta[property="article:published_time"]');
            removeMetaTags('meta[property="article:modified_time"]');
            removeMetaTags('meta[property="article:author"]');
            removeMetaTags('meta[property="article:section"]');
            removeMetaTags('meta[property="article:tag"]');
            setJsonLd(DEFAULT_META.jsonLd);
        };
    }, [
        meta.title, meta.description, meta.keywords, meta.ogTitle, meta.ogDescription,
        meta.ogType, meta.ogImage, meta.ogImageAlt, meta.ogImageWidth, meta.ogImageHeight,
        meta.ogImageType, meta.ogUrl, meta.ogSiteName, meta.ogLocale, meta.twitterCard,
        meta.twitterTitle, meta.twitterDescription, meta.twitterImage, meta.twitterImageAlt,
        meta.twitterSite, meta.twitterCreator, meta.author, meta.articlePublishedTime,
        meta.articleModifiedTime, meta.articleSection, meta.articleTags, meta.canonicalUrl,
        meta.jsonLd, meta.robots,
    ]);
}

