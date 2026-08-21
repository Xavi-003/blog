import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Linkedin, 
  Mail, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Layers,
  FileText,
  Code2,
  ExternalLink
} from 'lucide-react';
import type { Post } from '../types';

interface DistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: Post | null;
}

export const DistributionToolsModal = ({ isOpen, onClose, post }: DistributionModalProps) => {
  const [activeTab, setActiveTab] = useState<'linkedin' | 'email' | 'carousel' | 'seo'>('carousel');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const takeaways = post.executiveTakeaways || [
    { tag: 'STRATEGY', label: 'Core Strategic Shift', text: 'Enterprise integration offers defensible margin advantage and speeds rollout by 3.5x.' },
    { tag: 'FINANCIAL', label: 'CapEx vs OpEx Model', text: 'Pre-built modular stacks eliminate 60% of custom R&D overhead.' },
    { tag: 'RISK', label: 'Security & Compliance', text: 'Hardened zero-trust and governance layers eliminate liability in regulated markets.' }
  ];

  // Carousel slides generator
  const slides = [
    {
      type: 'COVER',
      tag: 'B2B TECH INTELLIGENCE',
      title: post.title,
      subtitle: 'The Executive Decision-Maker Guide (Architecture, Costs & Strategy)',
      footer: 'Swipe for Key Takeaways & Data Benchmarks →',
      color: '#4285f4'
    },
    {
      type: 'THREAT',
      tag: '01 / STRATEGIC IMPERATIVE',
      title: takeaways[0]?.label || 'Strategic Opportunity',
      subtitle: takeaways[0]?.text || 'Why proactive architecture is the key margin driver in 2026.',
      footer: 'Slide 2 of 5',
      color: '#ef4444'
    },
    {
      type: 'FINANCIAL',
      tag: '02 / FINANCIAL METRICS & TCO',
      title: takeaways[1]?.label || 'CapEx & OpEx Impact',
      subtitle: takeaways[1]?.text || 'Projected payback period and cost reduction benchmarks.',
      footer: 'Slide 3 of 5',
      color: '#10b981'
    },
    {
      type: 'SECURITY',
      tag: '03 / GOVERNANCE & RISK',
      title: takeaways[2]?.label || 'Risk Mitigation',
      subtitle: takeaways[2]?.text || 'Compliance verification and enterprise-grade safeguards.',
      footer: 'Slide 4 of 5',
      color: '#a855f7'
    },
    {
      type: 'CONCLUSION',
      tag: '04 / THE BOTTOM LINE',
      title: 'Actionable Executive Directive',
      subtitle: `Read the full technical breakdown and decision matrix on AI Insights Pro.`,
      footer: `🔗 Full report link: ${window.location.href}`,
      color: '#4285f4'
    }
  ];

  const linkedInPostText = `🚨 For CTOs, CFOs & Tech Decision Makers:

${post.title}

If you're evaluating architecture, budget, and implementation roadmaps for this quarter, here are 3 quick takeaways from our latest analyst briefing:

1️⃣ ${takeaways[0]?.label}: ${takeaways[0]?.text}
2️⃣ ${takeaways[1]?.label}: ${takeaways[1]?.text}
3️⃣ ${takeaways[2]?.label}: ${takeaways[2]?.text}

🔍 What are your team's thoughts on this transition?

👇 Link to the full technical briefing, cost matrix & interactive ROI estimator in the first comment!

#EnterpriseTech #CTO #B2BStrategy #TechnologyLeadership #ROI #FinTech`;

  const emailBriefText = `Subject: Executive Briefing: ${post.title}

Hi Team / [Executive Name],

Sharing a quick 2-minute synthesis on ${post.title} that is relevant for our current quarter tech roadmap and budgeting:

EXECUTIVE SUMMARY:
• ${takeaways[0]?.label}: ${takeaways[0]?.text}
• ${takeaways[1]?.label}: ${takeaways[1]?.text}
• ${takeaways[2]?.label}: ${takeaways[2]?.text}

KEY TAKEAWAYS FOR OUR STACK:
- Estimated Time-to-Value: ${post.reading_time || '4-6 weeks'}
- Key Risk Factor: Security compliance & data governance

You can review the full interactive decision matrix and architectural breakdown here:
${window.location.href}

Best,
[Your Name]`;

  const BASE_URL = 'https://xavi-003.github.io/blog';
  const postUrl = `${BASE_URL}/blog/${post.slug}`;

  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        "name": "AI Insights Pro",
        "url": `${BASE_URL}/`,
        "logo": "https://fav.farm/⚡️"
      },
      {
        "@type": "TechArticle",
        "@id": `${postUrl}#article`,
        "headline": post.title,
        "description": post.subtitle || takeaways[0]?.text,
        "datePublished": new Date(post.date).toISOString(),
        "dateModified": new Date(post.date).toISOString(),
        "author": {
          "@type": "Person",
          "name": post.author?.name || "Antony Xavier",
          "jobTitle": post.author?.role || "Principal Technology Analyst"
        },
        "publisher": { "@id": `${BASE_URL}/#organization` },
        "mainEntityOfPage": postUrl
      },
      {
        "@type": "FAQPage",
        "@id": `${postUrl}#faq`,
        "mainEntity": (post.faqs && post.faqs.length > 0 ? post.faqs : [
          { question: `What is the core takeaway for ${post.title}?`, answer: takeaways[0]?.text }
        ]).map(f => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        }))
      }
    ]
  };

  const schemaFormattedString = JSON.stringify(schemaJsonLd, null, 2);

  const copyContent = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const generateSlideDeckMarkdown = () => {
    return slides.map((s, i) => `--- Slide ${i + 1}: ${s.tag} ---\n# ${s.title}\n${s.subtitle}\n[${s.footer}]`).join('\n\n');
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="distribution-modal-card"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-wrap">
              <div className="modal-badge">
                <Share2 size={14} />
                <span>EXECUTIVE DISTRIBUTION & REPURPOSING</span>
              </div>
              <h2 className="modal-title">Multi-Channel Distribution Toolkit</h2>
            </div>
            <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="modal-tabs">
            <button
              type="button"
              className={`modal-tab ${activeTab === 'carousel' ? 'active' : ''}`}
              onClick={() => setActiveTab('carousel')}
            >
              <Layers size={16} />
              <span>LinkedIn Carousel ({slides.length} Slides)</span>
            </button>

            <button
              type="button"
              className={`modal-tab ${activeTab === 'linkedin' ? 'active' : ''}`}
              onClick={() => setActiveTab('linkedin')}
            >
              <Linkedin size={16} />
              <span>LinkedIn Post Copy</span>
            </button>

            <button
              type="button"
              className={`modal-tab ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              <Mail size={16} />
              <span>CFO/CTO Email Brief</span>
            </button>

            <button
              type="button"
              className={`modal-tab ${activeTab === 'seo' ? 'active' : ''}`}
              onClick={() => setActiveTab('seo')}
            >
              <Code2 size={16} />
              <span>SEO & Schema (JSON-LD)</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="modal-tab-content">
            {/* CAROUSEL PREVIEW */}
            {activeTab === 'carousel' && (
              <div className="carousel-builder-wrap">
                <div className="carousel-viewport">
                  <div 
                    className="carousel-slide" 
                    style={{ borderTopColor: slides[currentSlide].color }}
                  >
                    <div className="slide-top-bar">
                      <span className="slide-tag" style={{ color: slides[currentSlide].color }}>
                        {slides[currentSlide].tag}
                      </span>
                      <span className="slide-brand">AI INSIGHTS PRO</span>
                    </div>

                    <div className="slide-body">
                      <h3 className="slide-heading">{slides[currentSlide].title}</h3>
                      <p className="slide-subheading">{slides[currentSlide].subtitle}</p>
                    </div>

                    <div className="slide-footer">
                      <span className="slide-footer-text">{slides[currentSlide].footer}</span>
                      <div className="slide-dots">
                        {slides.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`slide-dot ${idx === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="carousel-nav-controls">
                  <button 
                    type="button" 
                    className="carousel-nav-btn" 
                    disabled={currentSlide === 0}
                    onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                  >
                    <ChevronLeft size={18} /> Previous
                  </button>
                  <span className="slide-counter">Slide {currentSlide + 1} of {slides.length}</span>
                  <button 
                    type="button" 
                    className="carousel-nav-btn" 
                    disabled={currentSlide === slides.length - 1}
                    onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>

                <div className="carousel-actions">
                  <button 
                    type="button" 
                    className="export-btn"
                    onClick={() => copyContent(generateSlideDeckMarkdown(), 'slides-markdown')}
                  >
                    {copiedType === 'slides-markdown' ? <Check size={16} /> : <FileText size={16} />}
                    <span>{copiedType === 'slides-markdown' ? 'Copied Slide Deck Text!' : 'Copy Slide Text (Markdown)'}</span>
                  </button>
                  <button 
                    type="button" 
                    className="export-btn secondary"
                    onClick={() => copyContent(JSON.stringify(slides, null, 2), 'slides-json')}
                  >
                    {copiedType === 'slides-json' ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedType === 'slides-json' ? 'Copied JSON!' : 'Copy JSON Deck Data'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* LINKEDIN POST COPY */}
            {activeTab === 'linkedin' && (
              <div className="copy-template-wrap">
                <div className="template-desc">
                  Optimized for executive engagement on LinkedIn. Post this alongside the carousel slide deck and place the full report URL in the top comment.
                </div>
                <textarea 
                  className="template-textarea" 
                  value={linkedInPostText} 
                  readOnly 
                  rows={10} 
                />
                <div className="template-footer">
                  <button
                    type="button"
                    className="export-btn"
                    onClick={() => copyContent(linkedInPostText, 'linkedin-post')}
                  >
                    {copiedType === 'linkedin-post' ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedType === 'linkedin-post' ? 'Copied Formatted Post!' : 'Copy Formatted LinkedIn Post'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* EMAIL BRIEF */}
            {activeTab === 'email' && (
              <div className="copy-template-wrap">
                <div className="template-desc">
                  Punchy, scannable internal executive memorandum for forwarding to founders, CTOs, CFOs, and tech committees.
                </div>
                <textarea 
                  className="template-textarea" 
                  value={emailBriefText} 
                  readOnly 
                  rows={10} 
                />
                <div className="template-footer">
                  <button
                    type="button"
                    className="export-btn"
                    onClick={() => copyContent(emailBriefText, 'email-brief')}
                  >
                    {copiedType === 'email-brief' ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedType === 'email-brief' ? 'Copied Email Memo!' : 'Copy Executive Email Memo'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SEO & SCHEMA (JSON-LD) INSPECTOR */}
            {activeTab === 'seo' && (
              <div className="copy-template-wrap">
                <div className="template-desc" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span>
                    Enterprise multi-entity JSON-LD Schema (TechArticle, FAQPage, Organization) and Open Graph tags modeled for search indexing.
                  </span>
                  <a 
                    href="https://search.google.com/test/rich-results" 
                    target="_blank" 
                    rel="noreferrer noopener"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}
                  >
                    <span>Google Rich Results Validator</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
                <textarea 
                  className="template-textarea" 
                  value={schemaFormattedString} 
                  readOnly 
                  rows={10} 
                  style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
                />
                <div className="template-footer">
                  <button
                    type="button"
                    className="export-btn"
                    onClick={() => copyContent(schemaFormattedString, 'schema-jsonld')}
                  >
                    {copiedType === 'schema-jsonld' ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedType === 'schema-jsonld' ? 'Copied Schema.org JSON-LD!' : 'Copy Schema.org JSON-LD Graph'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
