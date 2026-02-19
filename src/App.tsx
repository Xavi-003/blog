import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, ArrowRight, ChevronDown, X, Calendar, LayoutGrid,
  ArrowLeft, Zap, ChevronUp, Settings, Sun, Moon, Clock, Globe, Info
} from 'lucide-react'
import './App.css'
import postsDataRaw from './data/posts.json'

interface Post {
  id: string; slug: string; title: string; content: string; date: string; 
  original_link: string; image: string | null; category: string;
  source: string; reading_time: string;
}

const postsData = postsDataRaw as Post[];

const COLORS = [
  { name: 'Google Blue', value: '#4285f4' },
  { name: 'Cyber Purple', value: '#a855f7' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Sunset', value: '#ef4444' },
  { name: 'Amber', value: '#f59e0b' }
]

// --- SETTINGS PANEL ---
const SettingsPanel = ({ isOpen, onClose, theme, setTheme, accent, setAccent }: any) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 3999, backdropFilter: 'blur(2px)' }} />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="settings-panel">
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
                <div key={c.value} onClick={() => setAccent(c.value)} className={`color-option ${accent === c.value ? 'active' : ''}`} style={{ background: c.value }} title={c.name} />
              ))}
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

// --- HOME LIST PAGE ---
const Home = ({ onOpenSettings }: any) => {
  const navigate = useNavigate();
  const [posts] = useState<Post[]>(postsData)
  const [displayPosts, setDisplayPosts] = useState<Post[]>(postsData)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  
  // Filtering Logic
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSource, setActiveSource] = useState<string | null>(null)
  const [activeTime, setActiveTime] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150)
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
  }, [posts, searchQuery, activeCategory, activeSource, activeTime, sortOrder])

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  
  const categories = Array.from(new Set(posts.map(p => p.category)))
  const sources = Array.from(new Set(posts.map(p => p.source)))
  const times = Array.from(new Set(posts.map(p => p.reading_time))).sort()

  const clearFilters = () => {
    setActiveCategory(null); setActiveSource(null); setActiveTime(null); setSearchQuery('');
  }

  return (
    <div className="app-shell" ref={dropdownRef}>
      <header className={`home-sticky-header ${isScrolled ? 'visible' : ''}`}>
        <div className="logo" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} style={{cursor: 'pointer', marginRight: '2rem'}}>
          <Zap fill="var(--primary-color)" color="var(--primary-color)" size={20} />
          <b style={{fontSize: '0.8rem', letterSpacing: '0.05em'}}>AI<span>BLOG</span></b>
        </div>
        <div className="compact-search">
          <Search style={{position: 'absolute', left: '0.8rem', color: 'var(--text-muted)'}} size={18} />
          <input type="text" className="compact-input" placeholder="Search AI insights..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </header>

      <section className={`search-section ${isScrolled ? 'hidden' : ''}`}>
        <div className="search-pill-container">
          <Search className="search-icon-large" size={24} />
          <input type="text" className="main-search-bar" placeholder="Search the AI Library" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button className="search-button-blue">Search <ArrowRight size={18} /></button>
        </div>

        <AnimatePresence>
          {(searchQuery || activeCategory || activeSource || activeTime) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="filter-tags" style={{marginTop: '1.5rem', justifyContent: 'center'}}>
              <div style={{display: 'flex', gap: '0.8rem', flexWrap: 'wrap'}}>
                {activeCategory && <div className="tag-pill" onClick={() => setActiveCategory(null)}>{activeCategory} <X size={14} /></div>}
                {activeSource && <div className="tag-pill" onClick={() => setActiveSource(null)} style={{borderColor: '#10b981'}}>{activeSource} <X size={14} /></div>}
                {activeTime && <div className="tag-pill" onClick={() => setActiveTime(null)} style={{borderColor: '#f59e0b'}}>{activeTime} <X size={14} /></div>}
                <div className="clear-all" onClick={clearFilters}>Clear all <X size={14} /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className={`blue-filter-bar ${isScrolled ? 'hidden' : ''}`}>
        <div className="filter-item" onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}>
          <Calendar size={16} /> Date: {sortOrder === 'newest' ? 'Newest' : 'Oldest'} <ChevronDown size={14} />
          {openDropdown === 'date' && <div className="dropdown-menu"><div onClick={() => {setSortOrder('newest'); setOpenDropdown(null);}}>Newest</div><div onClick={() => {setSortOrder('oldest'); setOpenDropdown(null);}}>Oldest</div></div>}
        </div>
        
        <div className="filter-item" onClick={() => setOpenDropdown(openDropdown === 'topic' ? null : 'topic')}>
          <LayoutGrid size={16} /> Topic: {activeCategory || 'All'} <ChevronDown size={14} />
          {openDropdown === 'topic' && <div className="dropdown-menu"><div onClick={() => {setActiveCategory(null); setOpenDropdown(null);}}>All</div>{categories.map(c => <div key={c} onClick={() => {setActiveCategory(c); setOpenDropdown(null);}}>{c}</div>)}</div>}
        </div>

        <div className="filter-item" onClick={() => setOpenDropdown(openDropdown === 'source' ? null : 'source')}>
          <Globe size={16} /> Source: {activeSource || 'All'} <ChevronDown size={14} />
          {openDropdown === 'source' && <div className="dropdown-menu"><div onClick={() => {setActiveSource(null); setOpenDropdown(null);}}>All</div>{sources.map(s => <div key={s} onClick={() => {setActiveSource(s); setOpenDropdown(null);}}>{s}</div>)}</div>}
        </div>

        <div className="filter-item" onClick={() => setOpenDropdown(openDropdown === 'time' ? null : 'time')}>
          <Clock size={16} /> Reading: {activeTime || 'Any'} <ChevronDown size={14} />
          {openDropdown === 'time' && <div className="dropdown-menu"><div onClick={() => {setActiveTime(null); setOpenDropdown(null);}}>Any Time</div>{times.map(t => <div key={t} onClick={() => {setActiveTime(t); setOpenDropdown(null);}}>{t}</div>)}</div>}
        </div>

        <div className="filter-item" style={{borderRight: 'none', background: 'rgba(255,255,255,0.1)'}}>
          <Info size={16} /> 2026 AI Library
        </div>
      </div>

      <main className="container">
        <div className="doodle-grid">
          {displayPosts.map(post => (
            <motion.div key={post.id} className="doodle-card" whileHover={{y:-4}} onClick={() => navigate(`/blog/${post.slug}`)}>
              <div className="doodle-image-box">{post.image ? <img src={post.image} alt="" /> : <div style={{fontSize: '4rem', opacity: 0.05}}>🤖</div>}</div>
              <div className="doodle-info">
                <div className="doodle-date">{formatDate(post.date)} • {post.category}</div>
                <h2 className="doodle-title">{post.title}</h2>
                <div style={{marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                   <span style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><Globe size={12}/> {post.source}</span>
                   <span style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><Clock size={12}/> {post.reading_time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <div className="floating-ui">
        {showScrollTop && <div className="fab" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ChevronUp size={24} /></div>}
        <div className="fab fab-settings" onClick={onOpenSettings}><Settings size={24} /></div>
      </div>
    </div>
  )
}

const EditorialPage = () => {
  const { slug } = useParams();
  const post = postsData.find(p => p.slug === slug);
  useEffect(() => { window.scrollTo(0, 0); if (post) document.title = post.title; }, [post]);
  if (!post) return <div style={{ padding: '5rem', textAlign: 'center' }}>Post not found.</div>;
  return (
    <div className="editorial-page">
      <nav className="editorial-nav">
        <Link to="/" className="editorial-back-btn"><ArrowLeft size={18} /> BACK</Link>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}><Zap fill="var(--primary-color)" color="var(--primary-color)" size={18} /><span style={{fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-color)'}}>AI INSIGHTS</span></div>
      </nav>
      <header className="editorial-header"><span className="editorial-category">{post.category}</span><h1 className="editorial-title">{post.title}</h1></header>
      {post.image && <div className="editorial-hero-frame"><img src={post.image} alt="" /></div>}
      <article className="editorial-body"><ReactMarkdown>{post.content}</ReactMarkdown></article>
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [accent, setAccent] = useState(localStorage.getItem('accent') || '#4285f4')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', accent)
    localStorage.setItem('accent', accent)
  }, [accent])

  return (
    <Router basename="/blog">
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent} />
      <Routes>
        <Route path="/" element={<Home onOpenSettings={() => setIsSettingsOpen(true)} />} />
        <Route path="/blog/:slug" element={<EditorialPage />} />
      </Routes>
    </Router>
  )
}

export default App
