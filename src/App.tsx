import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ChevronDown, X, Calendar, LayoutGrid,
  ArrowLeft, Zap, ChevronUp, Settings, Sun, Moon, Clock, Globe, Info,
  Github, Linkedin, ExternalLink, Sparkles, TrendingUp, BookOpen
} from 'lucide-react'
import './App.css'
import postsDataRaw from './data/posts.json'

interface Post {
  id: string; slug: string; title: string; content: string; date: string;
  original_link: string; image: string | null; category: string;
  source: string; reading_time: string; color: string;
}

const postsData = postsDataRaw as Post[];

const COLORS = [
  { name: 'Google Blue', value: '#4285f4' },
  { name: 'Cyber Purple', value: '#a855f7' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Sunset', value: '#ef4444' },
  { name: 'Amber', value: '#f59e0b' }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
}

const cardVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 15 } as any }
}

const fadeUpVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } as any }
}

// --- LOADING SCREEN ---
const LoadingScreen = () => (
  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="loading-screen">
    <motion.div
      animate={{ rotate: 360, scale: [1, 1.2, 1] }}
      transition={{ rotate: { repeat: Infinity, duration: 1.5, ease: "linear" }, scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } } as any}
      className="loading-icon"
    >
      <Zap size={48} fill="var(--primary-color)" color="var(--primary-color)" />
    </motion.div>
    <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="loading-title">
      AI<span>INSIGHTS</span> PRO
    </motion.h2>
    <motion.div initial={{ width: 0 }} animate={{ width: '200px' }} transition={{ duration: 1.2, ease: 'easeInOut' }} className="loading-bar" />
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="loading-subtitle">
      Synthesizing latest tech insights...
    </motion.p>
  </motion.div>
)

// --- SETTINGS PANEL ---
const SettingsPanel = ({ isOpen, onClose, theme, setTheme, accent, setAccent }: any) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 3999, backdropFilter: 'blur(4px)' }} />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 } as any} className="settings-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Customization</h2>
            <X onClick={onClose} style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.2rem', color: 'var(--text-muted)' }}>Theme Mode</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setTheme('light')} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: theme === 'light' ? '2px solid var(--primary-color)' : '1px solid var(--card-border)', background: 'var(--bg-white)', color: 'var(--text-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Sun size={18} /> Light
              </button>
              <button onClick={() => setTheme('dark')} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: theme === 'dark' ? '2px solid var(--primary-color)' : '1px solid var(--card-border)', background: 'var(--bg-white)', color: 'var(--text-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Moon size={18} /> Dark
              </button>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.2rem', color: 'var(--text-muted)' }}>Accent Color</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {COLORS.map(c => (
                <motion.div key={c.value} onClick={() => setAccent(c.value)} className={`color-option ${accent === c.value ? 'active' : ''}`} style={{ background: c.value }} title={c.name} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} />
              ))}
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

// --- HERO SECTION ---
const HeroSection = ({ postCount }: { postCount: number }) => (
  <motion.div className="hero-section" initial="hidden" animate="visible" variants={containerVariants}>
    <motion.div className="hero-badge" variants={fadeUpVariants}>
      <Sparkles size={14} /> AI-Powered Intelligence
    </motion.div>
    <motion.h1 className="hero-title" variants={fadeUpVariants}>
      Future of <span className="hero-gradient-text">Technology</span>
    </motion.h1>
    <motion.p className="hero-subtitle" variants={fadeUpVariants}>
      Curated insights from the cutting edge of AI, computing, and innovation
    </motion.p>
    <motion.div className="hero-stats" variants={fadeUpVariants}>
      <div className="hero-stat"><BookOpen size={16} /><span><strong>{postCount}</strong> Articles</span></div>
      <div className="hero-stat-divider" />
      <div className="hero-stat"><TrendingUp size={16} /><span>Updated <strong>Daily</strong></span></div>
      <div className="hero-stat-divider" />
      <div className="hero-stat"><Zap size={16} /><span><strong>AI</strong> Generated</span></div>
    </motion.div>
  </motion.div>
)

// --- HOME PAGE ---
const Home = ({ onOpenSettings, accent }: any) => {
  const navigate = useNavigate();
  const [posts] = useState<Post[]>(postsData)
  const [displayPosts, setDisplayPosts] = useState<Post[]>(postsData)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSource, setActiveSource] = useState<string | null>(null)
  const [activeTime, setActiveTime] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = 9;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200)
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let filtered = [...posts]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q))
    }
    if (activeCategory) filtered = filtered.filter(p => p.category === activeCategory)
    if (activeSource) filtered = filtered.filter(p => p.source === activeSource)
    if (activeTime) filtered = filtered.filter(p => p.reading_time === activeTime)
    filtered.sort((a, b) => sortOrder === 'newest' ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime())
    setDisplayPosts(filtered)
    setPage(1)
  }, [posts, searchQuery, activeCategory, activeSource, activeTime, sortOrder])

  const paginatedPosts = displayPosts.slice(0, page * POSTS_PER_PAGE);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const categories = Array.from(new Set(posts.map(p => p.category)))
  const sources = Array.from(new Set(posts.map(p => p.source)))
  const times = Array.from(new Set(posts.map(p => p.reading_time))).sort()
  const clearFilters = () => { setActiveCategory(null); setActiveSource(null); setActiveTime(null); setSearchQuery(''); }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="app-shell" ref={dropdownRef} style={{ '--primary-color': accent } as any}>

      {/* Sticky Header */}
      <motion.header className={`home-sticky-header ${isScrolled ? 'visible' : ''}`} initial={{ y: -70 }} animate={{ y: isScrolled ? 0 : -70 }} transition={{ type: 'spring', stiffness: 300, damping: 30 } as any}>
        <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer', marginRight: '2rem' }}>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" } as any}>
            <Zap fill="var(--primary-color)" color="var(--primary-color)" size={20} />
          </motion.div>
          <b className="logo-text">AI<span>INSIGHTS</span></b>
        </div>
        <div className="compact-search">
          <input type="text" className="compact-input" placeholder="Search AI insights..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="header-connect-icons">
          <a href="https://github.com/Xavi-003" target="_blank" rel="noopener noreferrer" title="GitHub"><Github size={18} /></a>
          <a href="https://www.linkedin.com/in/antony-xavier-4b5019333" target="_blank" rel="noopener noreferrer" title="LinkedIn"><Linkedin size={18} /></a>
          <a href="https://xavi-003.github.io/portfolio/" target="_blank" rel="noopener noreferrer" title="Portfolio"><ExternalLink size={18} /></a>
        </div>
      </motion.header>

      {/* Hero */}
      <HeroSection postCount={posts.length} />

      {/* Search */}
      <section className="search-section">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="search-pill-container">
          <input type="text" className="main-search-bar" placeholder="Search the AI Library..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button className="search-button-blue">Search <ArrowRight size={18} /></button>
        </motion.div>
        <div className="search-connect-icons-far-right">
          <a href="https://github.com/Xavi-003" target="_blank" rel="noopener noreferrer" title="GitHub"><Github size={20} /></a>
          <a href="https://www.linkedin.com/in/antony-xavier-4b5019333" target="_blank" rel="noopener noreferrer" title="LinkedIn"><Linkedin size={20} /></a>
          <a href="https://xavi-003.github.io/portfolio/" target="_blank" rel="noopener noreferrer" title="Portfolio"><ExternalLink size={20} /></a>
        </div>
        <AnimatePresence>
          {(searchQuery || activeCategory || activeSource || activeTime) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="filter-tags" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                {activeCategory && <div className="tag-pill" onClick={() => setActiveCategory(null)}>{activeCategory} <X size={14} /></div>}
                {activeSource && <div className="tag-pill" onClick={() => setActiveSource(null)} style={{ borderColor: '#10b981' }}>{activeSource} <X size={14} /></div>}
                {activeTime && <div className="tag-pill" onClick={() => setActiveTime(null)} style={{ borderColor: '#f59e0b' }}>{activeTime} <X size={14} /></div>}
                <div className="clear-all" onClick={clearFilters}>Clear all <X size={14} /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Filter Bar */}
      <motion.div className="blue-filter-bar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="filter-item" onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}>
          <Calendar size={16} /> Date: {sortOrder === 'newest' ? 'Newest' : 'Oldest'} <ChevronDown size={14} />
          {openDropdown === 'date' && <div className="dropdown-menu"><div onClick={() => { setSortOrder('newest'); setOpenDropdown(null); }}>Newest</div><div onClick={() => { setSortOrder('oldest'); setOpenDropdown(null); }}>Oldest</div></div>}
        </div>
        <div className="filter-item" onClick={() => setOpenDropdown(openDropdown === 'topic' ? null : 'topic')}>
          <LayoutGrid size={16} /> Topic: {activeCategory || 'All'} <ChevronDown size={14} />
          {openDropdown === 'topic' && <div className="dropdown-menu"><div onClick={() => { setActiveCategory(null); setOpenDropdown(null); }}>All</div>{categories.map(c => <div key={c} onClick={() => { setActiveCategory(c); setOpenDropdown(null); }}>{c}</div>)}</div>}
        </div>
        <div className="filter-item" onClick={() => setOpenDropdown(openDropdown === 'source' ? null : 'source')}>
          <Globe size={16} /> Source: {activeSource || 'All'} <ChevronDown size={14} />
          {openDropdown === 'source' && <div className="dropdown-menu"><div onClick={() => { setActiveSource(null); setOpenDropdown(null); }}>All</div>{sources.map(s => <div key={s} onClick={() => { setActiveSource(s); setOpenDropdown(null); }}>{s}</div>)}</div>}
        </div>
        <div className="filter-item" onClick={() => setOpenDropdown(openDropdown === 'time' ? null : 'time')}>
          <Clock size={16} /> Reading: {activeTime || 'Any'} <ChevronDown size={14} />
          {openDropdown === 'time' && <div className="dropdown-menu"><div onClick={() => { setActiveTime(null); setOpenDropdown(null); }}>Any Time</div>{times.map(t => <div key={t} onClick={() => { setActiveTime(t); setOpenDropdown(null); }}>{t}</div>)}</div>}
        </div>
        <div className="filter-item" style={{ borderRight: 'none', background: 'rgba(255,255,255,0.1)' }}>
          <Info size={16} /> 2026 AI Library
        </div>
      </motion.div>

      {/* Posts Grid */}
      <main className="container">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="doodle-grid">
          {paginatedPosts.map((post, index) => (
            <motion.div key={post.id} variants={cardVariants} className="doodle-card" whileHover={{ y: -8, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' }} whileTap={{ scale: 0.98 }} onClick={() => navigate(`/blog/${post.slug}`)}>
              <div className="doodle-image-box">
                {index === 0 && sortOrder === 'newest' && page === 1 && (
                  <motion.div className="new-badge" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 } as any}>NEW</motion.div>
                )}
                {post.image ? <img src={post.image} alt="" loading="lazy" /> : <div style={{ fontSize: '4rem', opacity: 0.05 }}>🤖</div>}
              </div>
              <div className="doodle-info">
                <div className="doodle-date" style={{ color: post.color }}>{formatDate(post.date)} • {post.category}</div>
                <h2 className="doodle-title">{post.title}</h2>
                <div className="card-meta">
                  <span><Globe size={12} /> {post.source}</span>
                  <span><Clock size={12} /> {post.reading_time}</span>
                </div>
              </div>
            </motion.div>
          ))}
          {displayPosts.length > paginatedPosts.length && (
            <motion.div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', marginTop: '2rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.button onClick={() => setPage(p => p + 1)} className="load-more-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Load More <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          )}
          {displayPosts.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <h3>No insights found. Try a different search or filter.</h3>
            </motion.div>
          )}
        </motion.div>
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
    </motion.div>
  )
}

// --- EDITORIAL PAGE ---
const EditorialPage = ({ accent }: any) => {
  const { slug } = useParams();
  const post = postsData.find(p => p.slug === slug);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (post) document.title = `${post.title} | AI Insights Pro`;
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress((window.scrollY / totalHeight) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  if (!post) return <div style={{ padding: '5rem', textAlign: 'center' }}>Post not found.</div>;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="editorial-page" style={{ '--primary-color': accent } as any}>
      <motion.div className="reading-progress-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <motion.div className="reading-progress-bar" style={{ width: `${readingProgress}%` }} />
      </motion.div>

      <nav className="editorial-nav">
        <Link to="/" className="editorial-back-btn">
          <motion.div whileHover={{ x: -4 }} transition={{ type: 'spring', stiffness: 400 } as any}><ArrowLeft size={16} /></motion.div>
          BACK TO LIBRARY
        </Link>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 } as any}>
            <Zap fill="var(--primary-color)" color="var(--primary-color)" size={18} />
          </motion.div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '0.1em' }}>AI INSIGHTS PRO</span>
        </div>
      </nav>

      <header className="editorial-header-redesign">
        <motion.span initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="editorial-category">{post.category}</motion.span>
        <motion.h1 initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] } as any} className="editorial-title-xl">{post.title}</motion.h1>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="editorial-meta-wrap">
          <div className="meta-item"><Calendar size={16} /> {formatDate(post.date)}</div>
          <div className="meta-item"><Clock size={16} /> {post.reading_time} Read</div>
          <div className="meta-item"><Globe size={16} /> {post.source}</div>
        </motion.div>
      </header>

      {post.image && (
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] } as any} className="editorial-hero-frame">
          <img src={post.image} alt="" />
        </motion.div>
      )}

      <motion.article initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="editorial-body">
        <div className="editorial-lead-text">
          This comprehensive briefing provides a deep dive into {post.title}, analyzing the technical specifications, market implications, and future outlook.
        </div>
        <ReactMarkdown>{post.content}</ReactMarkdown>
        <motion.div className="source-highlight-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="source-label">Primary Intelligence Source</div>
          <div className="source-name">{post.source.toUpperCase()}</div>
          <p style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>This technical briefing was synthesized from verified reports and real-time data provided by {post.source}.</p>
          <motion.a href={post.original_link} target="_blank" rel="noopener noreferrer" className="source-link-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            EXPLORE ORIGINAL SOURCE <ArrowRight size={20} />
          </motion.a>
        </motion.div>
      </motion.article>
    </motion.div>
  )
}

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [accent, setAccent] = useState(localStorage.getItem('accent') || '#4285f4')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', accent, 'important')
    localStorage.setItem('accent', accent)
    const styleId = 'dynamic-accent-vars';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleTag) { styleTag = document.createElement('style'); styleTag.id = styleId; document.head.appendChild(styleTag); }
    styleTag.innerHTML = `:root { --primary-color: ${accent} !important; }`;
  }, [accent])

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home onOpenSettings={() => setIsSettingsOpen(true)} accent={accent} />} />
          <Route path="/blog/:slug" element={<EditorialPage accent={accent} />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default function Root() {
  return (
    <Router basename="/blog">
      <App />
    </Router>
  )
}
