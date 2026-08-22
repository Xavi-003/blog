import { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ChevronDown, X, Calendar, LayoutGrid,
  ArrowLeft, Zap, ChevronUp, Settings, Sun, Moon, Clock, Globe,
  Github, Linkedin, ExternalLink, Sparkles, TrendingUp, BookOpen,
  Share2, ShieldAlert, Table, Monitor
} from 'lucide-react';

import './App.css';
import { postsData } from './data/postsData';
import type { Post, ExecutiveRole, ThreatLevel } from './types';
import { useDocumentMeta, generateMetaDescription, DEFAULT_META } from './hooks/useDocumentMeta';

// B2B Executive Components
import { TableOfContents } from './components/TableOfContents';
import { slugifyText, extractNodeText } from './tocUtils';
import { ExecutiveSummaryCard } from './components/ExecutiveSummaryCard';
import { B2BInteractiveWidgets } from './components/B2BInteractiveWidgets';
import { FaqAccordion } from './components/FaqAccordion';
import { DistributionToolsModal } from './components/DistributionToolsModal';
import { RoleFilterBar } from './components/RoleFilterBar';
import { AnalystMatrixView } from './components/AnalystMatrixView';
import { PostCard } from './components/PostCard';
import { ModernNavbar } from './components/ModernNavbar';
import { ModernFooter } from './components/ModernFooter';
import { AuthorProfileBadge } from './components/AuthorProfileBadge';
import { LegalComplianceModal } from './components/LegalComplianceModal';
import { DesktopReleaseModal } from './components/DesktopReleaseModal';

const COLORS = [
  { name: 'Google Blue', value: '#4285f4' },
  { name: 'Cyber Purple', value: '#a855f7' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Sunset', value: '#ef4444' },
  { name: 'Amber', value: '#f59e0b' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
};

const fadeUpVariants = {
  hidden: { y: 25, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } as any }
};

// --- LOADING SCREEN ---
const LoadingScreen = () => (
  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="loading-screen">
    <motion.div
      animate={{ rotate: 360, scale: [1, 1.15, 1] }}
      transition={{ rotate: { repeat: Infinity, duration: 1.5, ease: "linear" }, scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } } as any}
      className="loading-icon"
    >
      <Zap size={48} fill="var(--primary-color)" color="var(--primary-color)" />
    </motion.div>
    <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="loading-title">
      AI<span>INSIGHTS</span> PRO
    </motion.h2>
    <motion.div initial={{ width: 0 }} animate={{ width: '200px' }} transition={{ duration: 1.0, ease: 'easeInOut' }} className="loading-bar" />
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="loading-subtitle">
      Synthesizing executive intelligence & B2B tech analysis...
    </motion.p>
  </motion.div>
);

// --- SETTINGS PANEL ---
const SettingsPanel = ({ isOpen, onClose, theme, setTheme, accent, setAccent }: any) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 3999, backdropFilter: 'blur(4px)' }} 
        />
        <motion.div 
          initial={{ x: '100%' }} 
          animate={{ x: 0 }} 
          exit={{ x: '100%' }} 
          transition={{ type: 'spring', damping: 25, stiffness: 200 } as any} 
          className="settings-panel"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Workspace Customization</h2>
            <X onClick={onClose} style={{ cursor: 'pointer' }} />
          </div>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-muted)' }}>Appearance Mode</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setTheme('light')} 
                style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', border: theme === 'light' ? '2px solid var(--primary-color)' : '1px solid var(--card-border)', background: 'var(--bg-white)', color: 'var(--text-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600 }}
              >
                <Sun size={18} /> Light
              </button>
              <button 
                onClick={() => setTheme('dark')} 
                style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', border: theme === 'dark' ? '2px solid var(--primary-color)' : '1px solid var(--card-border)', background: 'var(--bg-white)', color: 'var(--text-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600 }}
              >
                <Moon size={18} /> Dark
              </button>
            </div>
          </div>

          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-muted)' }}>Brand Accent Color</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
              {COLORS.map(c => (
                <motion.div 
                  key={c.value} 
                  onClick={() => setAccent(c.value)} 
                  className={`color-option ${accent === c.value ? 'active' : ''}`} 
                  style={{ background: c.value }} 
                  title={c.name} 
                  whileHover={{ scale: 1.15 }} 
                  whileTap={{ scale: 0.9 }} 
                />
              ))}
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// --- HERO SECTION ---
const HeroSection = ({ postCount }: { postCount: number }) => (
  <motion.div className="hero-section" initial="hidden" animate="visible" variants={containerVariants}>
    <motion.div className="hero-badge" variants={fadeUpVariants}>
      <Sparkles size={14} /> Executive Tech Intelligence & Analysis
    </motion.div>
    <motion.h1 className="hero-title" variants={fadeUpVariants}>
      Strategic <span className="hero-gradient-text">B2B Intelligence</span>
    </motion.h1>
    <motion.p className="hero-subtitle" variants={fadeUpVariants}>
      Decision-grade briefings on enterprise AI integration costs, white-label crypto architectures, and risk mitigation for C-suite leaders and investors.
    </motion.p>
    <motion.div className="hero-stats" variants={fadeUpVariants}>
      <div className="hero-stat"><BookOpen size={16} /><span><strong>{postCount}</strong> Intelligence Reports</span></div>
      <div className="hero-stat-divider" />
      <div className="hero-stat"><TrendingUp size={16} /><span>Audited <strong>ROI Benchmarks</strong></span></div>
      <div className="hero-stat-divider" />
      <div className="hero-stat"><Zap size={16} /><span><strong>AEO & Answer-Engine</strong> Ready</span></div>
    </motion.div>
  </motion.div>
);

// --- HOME PAGE ---
const Home = ({ onOpenSettings, onOpenLegalModal, onOpenDesktopModal, theme, onThemeToggle, accent }: any) => {
  const [posts] = useState<Post[]>(postsData);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<ExecutiveRole | 'All'>('All');
  const [activeThreat, setActiveThreat] = useState<ThreatLevel | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'matrix'>('grid');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [distributionPost, setDistributionPost] = useState<Post | null>(null);
  const POSTS_PER_PAGE = 9;

  // Restore homepage SEO defaults when Home mounts
  useDocumentMeta(DEFAULT_META);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter posts
  const displayPosts = useMemo(() => {
    let filtered = [...posts];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.industry && p.industry.toLowerCase().includes(q))
      );
    }

    // Category
    if (activeCategory) {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    // Role filter
    if (activeRole !== 'All') {
      filtered = filtered.filter(p => p.targetRole?.includes(activeRole));
    }

    // Threat level filter
    if (activeThreat !== 'All') {
      filtered = filtered.filter(p => p.threatLevel === activeThreat);
    }

    // Sort order
    filtered.sort((a, b) => 
      sortOrder === 'newest' 
        ? new Date(b.date).getTime() - new Date(a.date).getTime() 
        : new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return filtered;
  }, [posts, searchQuery, activeCategory, activeRole, activeThreat, sortOrder]);

  const paginatedPosts = displayPosts.slice(0, page * POSTS_PER_PAGE);
  const categories = Array.from(new Set(posts.map(p => p.category)));

  const clearFilters = () => { 
    setActiveCategory(null); 
    setActiveRole('All');
    setActiveThreat('All');
    setSearchQuery(''); 
    setPage(1); 
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="app-shell" 
      ref={dropdownRef} 
      style={{ '--primary-color': accent } as any}
    >
      {/* Modern Floating Glassmorphism Navbar */}
      <ModernNavbar 
        isEditorial={false}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        theme={theme}
        onThemeToggle={onThemeToggle}
        onOpenSettings={onOpenSettings}
        onOpenLegalModal={onOpenLegalModal}
        onOpenDesktopModal={onOpenDesktopModal}
        accent={accent}
      />

      {/* Hero */}
      <HeroSection postCount={posts.length} />

      {/* Search & Executive Navigation Section */}
      <section className="search-section">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="search-pill-container">
          <input 
            type="text" 
            className="main-search-bar" 
            placeholder="Search topics (e.g., Enterprise AI Cost, White-Label Crypto, EU AI Act)..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
          <button className="search-button-blue">Search <ArrowRight size={18} /></button>
        </motion.div>

        <div className="search-connect-icons-far-right">
          {onOpenDesktopModal && (
            <button
              type="button"
              className="search-connect-desktop-btn"
              onClick={onOpenDesktopModal}
              title="Download Desktop App (Windows, Linux, macOS) Releases"
            >
              <Monitor size={18} />
              <span className="desktop-tag">App</span>
            </button>
          )}
          <a href="https://github.com/Xavi-003" target="_blank" rel="noopener noreferrer" title="GitHub"><Github size={20} /></a>
          <a href="https://www.linkedin.com/in/antony-xavier-4b5019333" target="_blank" rel="noopener noreferrer" title="LinkedIn"><Linkedin size={20} /></a>
          <a href="https://xavi-003.github.io/portfolio/" target="_blank" rel="noopener noreferrer" title="Portfolio"><ExternalLink size={20} /></a>
        </div>

        {/* Role Filter Pills */}
        <RoleFilterBar 
          activeRole={activeRole} 
          onSelectRole={(r) => { setActiveRole(r); setPage(1); }} 
        />

        {/* Active Filter Tags */}
        <AnimatePresence>
          {(searchQuery || activeCategory || activeRole !== 'All' || activeThreat !== 'All') && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="filter-tags" style={{ marginTop: '1rem', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {activeRole !== 'All' && <div className="tag-pill" onClick={() => setActiveRole('All')}>Role: {activeRole} <X size={14} /></div>}
                {activeCategory && <div className="tag-pill" onClick={() => setActiveCategory(null)}>Category: {activeCategory} <X size={14} /></div>}
                {activeThreat !== 'All' && <div className="tag-pill" onClick={() => setActiveThreat('All')}>Status: {activeThreat} <X size={14} /></div>}
                {searchQuery && <div className="tag-pill" onClick={() => setSearchQuery('')}>Query: "{searchQuery}" <X size={14} /></div>}
                <div className="clear-all" onClick={clearFilters}>Reset Filters <X size={14} /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Filter & View Switcher Bar */}
      <motion.div className="blue-filter-bar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="filter-item" onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}>
          <Calendar size={16} /> Date: {sortOrder === 'newest' ? 'Newest' : 'Oldest'} <ChevronDown size={14} />
          {openDropdown === 'date' && (
            <div className="dropdown-menu">
              <div onClick={() => { setSortOrder('newest'); setOpenDropdown(null); }}>Newest First</div>
              <div onClick={() => { setSortOrder('oldest'); setOpenDropdown(null); }}>Oldest First</div>
            </div>
          )}
        </div>

        <div className="filter-item" onClick={() => setOpenDropdown(openDropdown === 'topic' ? null : 'topic')}>
          <LayoutGrid size={16} /> Category: {activeCategory || 'All'} <ChevronDown size={14} />
          {openDropdown === 'topic' && (
            <div className="dropdown-menu">
              <div onClick={() => { setActiveCategory(null); setOpenDropdown(null); }}>All Categories</div>
              {categories.map(c => <div key={c} onClick={() => { setActiveCategory(c); setOpenDropdown(null); }}>{c}</div>)}
            </div>
          )}
        </div>

        <div className="filter-item" onClick={() => setOpenDropdown(openDropdown === 'threat' ? null : 'threat')}>
          <ShieldAlert size={16} /> Threat/Opportunity: {activeThreat} <ChevronDown size={14} />
          {openDropdown === 'threat' && (
            <div className="dropdown-menu">
              <div onClick={() => { setActiveThreat('All'); setOpenDropdown(null); }}>All Signals</div>
              <div onClick={() => { setActiveThreat('High'); setOpenDropdown(null); }}>🔴 High Threat</div>
              <div onClick={() => { setActiveThreat('Medium'); setOpenDropdown(null); }}>🟡 Moderate Risk</div>
              <div onClick={() => { setActiveThreat('Opportunity'); setOpenDropdown(null); }}>🟢 Opportunity</div>
            </div>
          )}
        </div>

        {/* View Mode Toggle Button */}
        <div className="filter-item-view-toggle">
          <button 
            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Analyst Card View"
          >
            <LayoutGrid size={15} />
            <span>Cards</span>
          </button>
          <button 
            className={`view-mode-btn ${viewMode === 'matrix' ? 'active' : ''}`}
            onClick={() => setViewMode('matrix')}
            title="Executive Intelligence Matrix View"
          >
            <Table size={15} />
            <span>Matrix</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <main className="container">
        {viewMode === 'grid' ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="doodle-grid">
            {paginatedPosts.map((post, index) => (
              <PostCard 
                key={post.id} 
                post={post} 
                index={index} 
                onOpenDistributionModal={(p) => setDistributionPost(p)}
              />
            ))}

            {displayPosts.length > paginatedPosts.length && (
              <motion.div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', marginTop: '2rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.button onClick={() => setPage(p => p + 1)} className="load-more-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Load More Reports <ArrowRight size={18} />
                </motion.button>
              </motion.div>
            )}

            {displayPosts.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                <h3>No intelligence reports match your filter criteria.</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Try clearing the role filter or searching for a broader technology topic.</p>
                <button className="clear-filter-btn" onClick={clearFilters} style={{ marginTop: '1rem' }}>Reset All Filters</button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <AnalystMatrixView 
            posts={displayPosts} 
            onOpenDistribution={(p) => setDistributionPost(p)}
          />
        )}
      </main>

      {/* Floating Actions */}
      <div className="floating-ui">
        <AnimatePresence>
          {showScrollTop && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="fab" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} whileHover={{ scale: 1.15 }}>
              <ChevronUp size={24} />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div className="fab fab-settings" onClick={onOpenSettings} whileHover={{ scale: 1.1, rotate: 90 }} transition={{ type: 'spring', stiffness: 300 } as any}>
          <Settings size={22} />
        </motion.div>
      </div>

      {/* Distribution Repurposing Modal */}
      <DistributionToolsModal 
        post={distributionPost} 
        isOpen={Boolean(distributionPost)} 
        onClose={() => setDistributionPost(null)} 
      />

      {/* Modern High-End Executive Footer */}
      <ModernFooter 
        onOpenLegalModal={onOpenLegalModal} 
        onOpenSettings={onOpenSettings} 
        onOpenDesktopModal={onOpenDesktopModal}
      />
    </motion.div>
  );
};

// --- EDITORIAL ARTICLE PAGE ---
const EditorialPage = ({ accent, onOpenSettings, onOpenLegalModal, onOpenDesktopModal, theme, onThemeToggle }: any) => {
  const { slug } = useParams();
  const post = postsData.find(p => p.slug === slug);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isDistributionOpen, setIsDistributionOpen] = useState(false);

  const BASE_URL = 'https://xavi-003.github.io/blog';

  // Dynamic SEO meta tags for the individual blog post
  const postDescription = post ? (post.subtitle || generateMetaDescription(post.content)) : '';
  
  // Format FAQs for AEO JSON-LD
  const defaultFaqs = [
    {
      question: `What are the key executive takeaways of "${post?.title}"?`,
      answer: post?.executiveTakeaways?.map(t => `${t.label}: ${t.text}`).join(' ') || postDescription
    },
    {
      question: `What is the projected ROI timeline?`,
      answer: post?.roiPotential 
        ? `The projected ROI potential is ${post.roiPotential} with an estimated payback window of 3 to 6 months based on standard enterprise deployment benchmarks.`
        : `Payback is projected within 3 to 6 months depending on existing team competency and migration scope.`
    },
    {
      question: `Who should read this report?`,
      answer: `This intelligence brief is targeted toward ${post?.targetRole?.join(', ') || 'CTOs, CFOs, and tech leaders'} in the ${post?.industry || 'Enterprise Technology'} sector.`
    }
  ];

  const faqsForSchema = (post?.faqs && post.faqs.length > 0) ? post.faqs : defaultFaqs;
  const postUrl = post ? `${BASE_URL}/blog/${post.slug}` : BASE_URL;
  const approxWordCount = post ? post.content.split(/\s+/).length : 800;

  useDocumentMeta(
    post
      ? {
        title: `${post.title} | AI Insights Pro`,
        description: postDescription,
        keywords: `${post.category}, Blockchain Development, Enterprise AI, B2B Tech Intelligence, Technology ROI, ${post.targetRole?.join(', ')}, ${post.source}, ${post.industry || 'Technology'}`,
        ogTitle: post.title,
        ogDescription: postDescription,
        ogType: 'article',
        ogImage: post.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200&h=630',
        ogImageAlt: post.title,
        ogImageWidth: 1200,
        ogImageHeight: 630,
        ogImageType: 'image/jpeg',
        ogUrl: postUrl,
        ogSiteName: 'AI Insights Pro',
        ogLocale: 'en_US',
        twitterCard: 'summary_large_image',
        twitterTitle: post.title,
        twitterDescription: postDescription,
        twitterImage: post.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200&h=630',
        twitterImageAlt: post.title,
        twitterSite: '@AIInsightsPro',
        twitterCreator: '@XavierAntony',
        author: post.author?.name || 'Antony Xavier',
        articlePublishedTime: new Date(post.date).toISOString(),
        articleModifiedTime: new Date(post.date).toISOString(),
        articleSection: post.category,
        articleTags: [post.category, ...(post.targetRole || []), post.source, post.industry || 'Enterprise Tech'],
        canonicalUrl: postUrl,
        robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        jsonLd: {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${BASE_URL}/#organization`,
              "name": "AI Insights Pro",
              "url": `${BASE_URL}/`,
              "logo": {
                "@type": "ImageObject",
                "url": "https://fav.farm/⚡️",
                "width": 512,
                "height": 512,
                "caption": "AI Insights Pro"
              },
              "sameAs": [
                "https://github.com/Xavi-003",
                "https://www.linkedin.com/in/antony-xavier-4b5019333",
                "https://xavi-003.github.io/portfolio/"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Analyst Research & Inquiries",
                "url": "https://xavi-003.github.io/portfolio/"
              }
            },
            {
              "@type": "WebSite",
              "@id": `${BASE_URL}/#website`,
              "name": "AI Insights Pro",
              "url": `${BASE_URL}/`,
              "publisher": {
                "@id": `${BASE_URL}/#organization`
              },
              "description": "Executive tech intelligence platform delivering actionable insights on enterprise blockchain development, AI infrastructure, and cybersecurity.",
              "inLanguage": "en-US"
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${postUrl}#breadcrumb`,
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": `${BASE_URL}/`
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": post.category,
                  "item": `${BASE_URL}/?category=${encodeURIComponent(post.category)}`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": post.title,
                  "item": postUrl
                }
              ]
            },
            {
              "@type": "TechArticle",
              "@id": `${postUrl}#article`,
              "isPartOf": {
                "@id": `${BASE_URL}/#website`
              },
              "headline": post.title,
              "alternativeHeadline": post.subtitle || post.title,
              "description": postDescription,
              "mainEntityOfPage": postUrl,
              "inLanguage": "en-US",
              "datePublished": new Date(post.date).toISOString(),
              "dateModified": new Date(post.date).toISOString(),
              "wordCount": approxWordCount,
              "proficiencyLevel": "Expert",
              "timeRequired": `PT${parseInt(post.reading_time, 10) || 5}M`,
              "articleSection": post.category,
              "keywords": `${post.category}, Blockchain, AI, ROI, ${post.targetRole?.join(', ')}`,
              "image": {
                "@type": "ImageObject",
                "url": post.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200&h=630',
                "width": 1200,
                "height": 630
              },
              "author": {
                "@type": "Person",
                "name": post.author?.name || "Antony Xavier",
                "jobTitle": post.author?.role || "Principal Technology Analyst",
                "worksFor": {
                  "@type": "Organization",
                  "name": post.author?.affiliation || "AI Insights Pro"
                },
                "url": "https://xavi-003.github.io/portfolio/"
              },
              "publisher": {
                "@id": `${BASE_URL}/#organization`
              },
              "about": [
                {
                  "@type": "Thing",
                  "name": post.category
                },
                {
                  "@type": "Thing",
                  "name": post.industry || "Enterprise Technology"
                }
              ]
            },
            {
              "@type": "FAQPage",
              "@id": `${postUrl}#faq`,
              "mainEntity": faqsForSchema.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            },
            ...(post.roiCalculator?.enabled || post.comparisonMatrix ? [
              {
                "@type": "Service",
                "@id": `${postUrl}#service`,
                "name": `${post.category} Technical Evaluation & Architecture`,
                "serviceType": post.category,
                "provider": {
                  "@id": `${BASE_URL}/#organization`
                },
                "audience": {
                  "@type": "Audience",
                  "audienceType": post.targetRole?.join(', ') || "CTOs, CFOs and Technology Leaders"
                },
                "description": postDescription
              }
            ] : [])
          ]
        }
      }
      : DEFAULT_META
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setReadingProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  const markdownHeadingComponents = useMemo(() => ({
    h1: ({ children, ...props }: any) => {
      const text = extractNodeText(children);
      const id = slugifyText(text);
      return <h1 id={id} className="scroll-target" {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }: any) => {
      const text = extractNodeText(children);
      const id = slugifyText(text);
      return <h2 id={id} className="scroll-target" {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
      const text = extractNodeText(children);
      const id = slugifyText(text);
      return <h3 id={id} className="scroll-target" {...props}>{children}</h3>;
    },
    h4: ({ children, ...props }: any) => {
      const text = extractNodeText(children);
      const id = slugifyText(text);
      return <h4 id={id} className="scroll-target" {...props}>{children}</h4>;
    },
  }), []);

  if (!post) return <NotFoundPage accent={accent} />;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="editorial-page" 
      style={{ '--primary-color': accent } as any}
    >
      {/* Top Reading Progress Bar */}
      <motion.div className="reading-progress-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="reading-progress-bar" style={{ width: `${readingProgress}%` }} />
      </motion.div>

      {/* Modern Top Navigation Bar */}
      <ModernNavbar 
        isEditorial={true}
        theme={theme}
        onThemeToggle={onThemeToggle}
        onOpenSettings={onOpenSettings}
        onOpenLegalModal={onOpenLegalModal}
        onOpenDistribution={() => setIsDistributionOpen(true)}
        onOpenDesktopModal={onOpenDesktopModal}
        accent={accent}
      />

      {/* Header Container */}
      <header className="editorial-header-redesign">
        <div className="editorial-header-top-row">
          <motion.span 
            initial={{ y: 15, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.1 }} 
            className="editorial-category"
            style={{ backgroundColor: `${post.color}15`, color: post.color, borderColor: post.color }}
          >
            {post.category}
          </motion.span>

          {post.threatLevel && (
            <span className="editorial-threat-badge">
              Status: <strong>{post.threatLevel === 'High' ? '🔴 High Risk' : '🟢 Opportunity'}</strong>
            </span>
          )}
        </div>

        <motion.h1 
          initial={{ y: 25, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] } as any} 
          className="editorial-title-xl"
        >
          {post.title}
        </motion.h1>

        {post.subtitle && (
          <p className="editorial-subtitle-banner">{post.subtitle}</p>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="editorial-meta-wrap">
          <div className="meta-item"><Calendar size={16} /> {formatDate(post.date)}</div>
          <div className="meta-item"><Clock size={16} /> {post.reading_time} Read</div>
          <div className="meta-item"><Globe size={16} /> {post.source}</div>
          {post.targetRole && post.targetRole.length > 0 && (
            <div className="meta-item">
              <span className="meta-roles-label">Target:</span>
              {post.targetRole.map(r => (
                <span key={r} className="meta-role-tag">{r}</span>
              ))}
            </div>
          )}
        </motion.div>
      </header>

      {/* Hero Media Banner */}
      {post.image && (
        <motion.div initial={{ scale: 0.96, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 } as any} className="editorial-hero-frame">
          <img src={post.image} alt={post.title} />
        </motion.div>
      )}

      {/* Main 2-Column Layout (Article + Sticky TOC) */}
      <div className="editorial-two-col-layout">
        {/* Left Column: Article Content & Executive Widgets */}
        <main className="editorial-main-content">
          {/* Executive Summary Card (3-Bullet 3-Minute Skim) */}
          <ExecutiveSummaryCard 
            post={post} 
            onOpenDistributionModal={() => setIsDistributionOpen(true)}
          />

          {/* Core Markdown Body */}
          <motion.article 
            initial={{ y: 25, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.5, duration: 0.6 }} 
            className="editorial-body"
          >
            <ReactMarkdown components={markdownHeadingComponents}>{post.content}</ReactMarkdown>
          </motion.article>

          {/* Interactive B2B Intelligence Widgets (ROI Calculator, Comparison Matrix, Implementation Roadmap, Expert Interview) */}
          <B2BInteractiveWidgets post={post} />

          {/* Answer Engine Optimization FAQ Section */}
          {post.faqs && post.faqs.length > 0 && (
            <FaqAccordion 
              faqs={post.faqs} 
              postTitle={post.title} 
            />
          )}

          {/* E-E-A-T Author Credentials Box with Boy Icon, LinkedIn & Portfolio */}
          {post.author && (
            <div style={{ margin: '2.5rem 0 1.5rem 0' }}>
              <AuthorProfileBadge variant="card" author={post.author} showBio={true} />
            </div>
          )}

          {/* Primary Intelligence Source Attribution */}
          <motion.div 
            id="source-intelligence" 
            className="source-highlight-card" 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.5 }}
          >
            <div className="source-label">Primary Verified Source</div>
            <div className="source-name">{post.source.toUpperCase()}</div>
            <p style={{ marginBottom: '1.2rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              This technical intelligence brief was synthesized according to rigorous industry research standards based on data from {post.source}.
            </p>
            <motion.a href={post.original_link} target="_blank" rel="noopener noreferrer" className="source-link-btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              EXPLORE PRIMARY SOURCE <ArrowRight size={18} />
            </motion.a>
          </motion.div>
        </main>

        {/* Right Column: Sticky Table of Contents & Skim Navigator */}
        <aside className="editorial-sidebar">
          <TableOfContents 
            content={post.content} 
            hasExecutiveSummary={true}
            hasRoiCalculator={Boolean(post.roiCalculator?.enabled)}
            hasComparisonMatrix={Boolean(post.comparisonMatrix)}
            hasRoadmap={Boolean((post.roadmapPhases || post.implementationRoadmap)?.length)}
            hasExpertInterview={Boolean(post.expertInterview)}
            hasFaqs={Boolean(post.faqs && post.faqs.length > 0)}
          />
          
          <div className="sidebar-distribution-widget">
            <h4>C-Suite Repurposing</h4>
            <p>Generate one-click LinkedIn carousels or executive email summaries for your team.</p>
            <button 
              type="button" 
              className="sidebar-share-action-btn"
              onClick={() => setIsDistributionOpen(true)}
            >
              <Share2 size={14} /> Open Distribution Kit
            </button>
          </div>
        </aside>
      </div>

      {/* Distribution Modal */}
      <DistributionToolsModal 
        post={post} 
        isOpen={isDistributionOpen} 
        onClose={() => setIsDistributionOpen(false)} 
      />

      {/* Modern Executive Footer */}
      <ModernFooter 
        onOpenLegalModal={onOpenLegalModal} 
        onOpenSettings={onOpenSettings} 
        onOpenDesktopModal={onOpenDesktopModal}
      />
    </motion.div>
  );
};

// --- NOT FOUND PAGE ---
const NotFoundPage = ({ accent }: { accent: string }) => {
  useDocumentMeta({
    title: '404 Intelligence Not Found | AI Insights Pro',
    description: 'The requested intelligence briefing does not exist or has been archived.',
    robots: 'noindex, follow',
  });

  return (
    <div className="not-found-container" style={{ '--primary-color': accent } as any}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="not-found-icon-box">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" } as any}
            style={{ fontSize: '5rem' }}
          >
            ⚡
          </motion.div>
        </div>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Intelligence Report Not Found</h2>
        <p className="not-found-text">
          The research note or tech briefing you are looking for has either been moved, updated, or archived.
        </p>
        <Link to="/" className="not-found-btn">
          <ArrowLeft size={16} /> Return to Intelligence Library
        </Link>
      </motion.div>
    </div>
  );
};

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [accent, setAccent] = useState(localStorage.getItem('accent') || '#4285f4');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', accent, 'important');
    localStorage.setItem('accent', accent);
    const styleId = 'dynamic-accent-vars';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleTag) { 
      styleTag = document.createElement('style'); 
      styleTag.id = styleId; 
      document.head.appendChild(styleTag); 
    }
    styleTag.innerHTML = `:root { --primary-color: ${accent} !important; }`;
  }, [accent]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>
      
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        theme={theme} 
        setTheme={setTheme} 
        accent={accent} 
        setAccent={setAccent} 
      />

      <LegalComplianceModal 
        isOpen={isLegalModalOpen} 
        onClose={() => setIsLegalModalOpen(false)} 
      />

      <DesktopReleaseModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route 
            path="/" 
            element={
              <Home 
                onOpenSettings={() => setIsSettingsOpen(true)} 
                onOpenLegalModal={() => setIsLegalModalOpen(true)}
                onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
                theme={theme}
                onThemeToggle={toggleTheme}
                accent={accent} 
              />
            } 
          />
          <Route 
            path="/blog/:slug" 
            element={
              <EditorialPage 
                accent={accent} 
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenLegalModal={() => setIsLegalModalOpen(true)}
                onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
                theme={theme}
                onThemeToggle={toggleTheme}
              />
            } 
          />
          <Route path="/404" element={<NotFoundPage accent={accent} />} />
          <Route path="*" element={<NotFoundPage accent={accent} />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function Root() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <App />
    </Router>
  );
}
