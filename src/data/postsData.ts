import rawPosts from './posts.json';
import { b2bAnalystPosts } from './b2bAnalystPosts';
import type { Post } from '../types';

/**
 * Normalizes raw posts from posts.json and combines with high-value B2B intelligence posts.
 */
function normalizePost(raw: any): Post {
  // Infer target role if missing
  const inferredRoles: ('CTO' | 'CFO' | 'Founders' | 'Security' | 'Operations' | 'Marketing')[] = [];
  const lowerCat = (raw.category || '').toLowerCase();
  const lowerTitle = (raw.title || '').toLowerCase();

  if (lowerCat.includes('security') || lowerTitle.includes('protection') || lowerTitle.includes('security')) {
    inferredRoles.push('Security', 'CTO');
  } else if (lowerCat.includes('future') || lowerTitle.includes('ai') || lowerTitle.includes('cloud')) {
    inferredRoles.push('CTO', 'Founders');
  } else if (lowerCat.includes('robotics') || lowerCat.includes('mobile')) {
    inferredRoles.push('Operations', 'Founders');
  } else {
    inferredRoles.push('CTO', 'CFO');
  }

  // Derive quick 3-bullet takeaway if missing
  const takeaways = raw.executiveTakeaways || [
    {
      tag: "STRATEGY",
      label: "Executive Briefing",
      text: (raw.content || '').substring(0, 140).replace(/^[#\s]+/, '') + "..."
    },
    {
      tag: "IMPACT",
      label: "Market Trajectory",
      text: "Strategic engineering implications affecting baseline enterprise architecture, cost governance, and implementation timelines."
    },
    {
      tag: "ACTION",
      label: "Recommended Stance",
      text: "Review current infrastructure dependencies against these findings to optimize capital efficiency and risk exposure."
    }
  ];

  return {
    id: raw.id || `post-${Math.random().toString(36).substr(2, 9)}`,
    slug: raw.slug || (raw.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title: raw.title || 'Untitled Report',
    subtitle: raw.subtitle || undefined,
    content: raw.content || '',
    date: raw.date || new Date().toISOString(),
    original_link: raw.original_link || '',
    image: raw.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200&h=630',
    category: raw.category || 'Tech Intel',
    industry: raw.industry || 'Technology & Innovation',
    style: raw.style || 'Deep Dive',
    format: raw.format || 'Executive Report',
    color: raw.color || '#4285f4',
    source: raw.source || 'Industry Intelligence',
    reading_time: raw.reading_time || '6 min',
    targetRole: raw.targetRole || inferredRoles,
    threatLevel: raw.threatLevel || (lowerTitle.includes('security') || lowerTitle.includes('vulnerability') ? 'High' : 'Opportunity'),
    roiPotential: raw.roiPotential || 'Strategic Alignment',
    author: raw.author || {
      name: "Antony Xavier",
      role: "Lead Tech & Systems Analyst",
      affiliation: "AI Insights Pro Research Guild",
      credentials: "B2B Software Architect & Intelligence Strategist",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
      linkedin: "https://www.linkedin.com/in/antony-xavier-4b5019333",
      portfolio: "https://xavi-003.github.io/portfolio/",
      github: "https://github.com/Xavi-003"
    },
    executiveTakeaways: takeaways,
    keyMetrics: raw.keyMetrics,
    faqs: raw.faqs,
    comparisonMatrix: raw.comparisonMatrix,
    implementationRoadmap: raw.implementationRoadmap,
    expertInterview: raw.expertInterview
  };
}

const rawNormalized: Post[] = (rawPosts as any[]).map(normalizePost);

// Deduplicate by slug, placing the flagship B2B analyst posts at the top
const slugSet = new Set<string>();
const allPostsCombined: Post[] = [];

// First add flagship B2B analyst posts
for (const post of b2bAnalystPosts) {
  if (!slugSet.has(post.slug)) {
    slugSet.add(post.slug);
    allPostsCombined.push(post);
  }
}

// Then add normalized raw posts
for (const post of rawNormalized) {
  if (!slugSet.has(post.slug)) {
    slugSet.add(post.slug);
    allPostsCombined.push(post);
  }
}

export const postsData: Post[] = allPostsCombined;
export default postsData;
