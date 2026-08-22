import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Search, 
  X, 
  Linkedin, 
  ExternalLink, 
  Sun, 
  Moon, 
  Palette, 
  Table, 
  LayoutGrid, 
  Scale, 
  Menu, 
  Share2, 
  ArrowLeft,
  Monitor
} from 'lucide-react';
import { AuthorProfileBadge } from './AuthorProfileBadge';

interface ModernNavbarProps {
  isEditorial?: boolean;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  viewMode?: 'grid' | 'matrix';
  onViewModeChange?: (mode: 'grid' | 'matrix') => void;
  theme?: string;
  onThemeToggle?: () => void;
  onOpenSettings?: () => void;
  onOpenLegalModal?: () => void;
  onOpenDistribution?: () => void;
  onOpenDesktopModal?: () => void;
  accent?: string;
}

export const ModernNavbar: React.FC<ModernNavbarProps> = ({
  isEditorial = false,
  searchQuery = '',
  onSearchChange,
  viewMode = 'grid',
  onViewModeChange,
  theme = 'light',
  onThemeToggle,
  onOpenSettings,
  onOpenLegalModal,
  onOpenDistribution,
  onOpenDesktopModal
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global keyboard shortcut: Cmd+K or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isEditorial) {
          navigate('/');
          setTimeout(() => searchInputRef.current?.focus(), 150);
        } else {
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditorial, navigate]);

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handlePortfolioRedirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://xavi-003.github.io/portfolio/', '_blank', 'noopener,noreferrer');
  };

  const handleLinkedinRedirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://www.linkedin.com/in/antony-xavier-4b5019333', '_blank', 'noopener,noreferrer');
  };

  return (
    <header className={`modern-navbar-wrapper ${isScrolled ? 'is-docked' : ''} ${isEditorial ? 'is-editorial' : ''}`}>
      <div className="modern-navbar-glass">
        {/* Left: Brand Identity */}
        <div className="navbar-left-brand">
          {isEditorial ? (
            <Link to="/" className="navbar-back-btn" title="Back to Intelligence Library">
              <ArrowLeft size={16} />
              <span className="navbar-back-text">LIBRARY</span>
            </Link>
          ) : null}

          <div className="modern-logo-unit" onClick={handleLogoClick} title="AI Insights Pro — Intelligence Hub">
            <div className="modern-logo-icon-glow">
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" } as any}
              >
                <Zap fill="var(--primary-color)" color="var(--primary-color)" size={19} />
              </motion.div>
            </div>
            <div className="modern-logo-text-group">
              <span className="modern-brand-name">AI<span>INSIGHTS</span></span>
              <span className="modern-brand-badge">B2B INTEL</span>
            </div>
          </div>
        </div>

        {/* Center: Search & Navigation */}
        <div className="navbar-center-area">
          {!isEditorial && onSearchChange && (
            <div className={`navbar-search-pill ${isSearchFocused ? 'focused' : ''}`}>
              <Search size={15} className="navbar-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="navbar-search-input"
                placeholder="Search AI costs, crypto arch, ROI..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchQuery ? (
                <button
                  type="button"
                  className="navbar-search-clear"
                  onClick={() => { onSearchChange(''); searchInputRef.current?.focus(); }}
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              ) : (
                <kbd className="navbar-shortcut-key" title="Press ⌘K or Ctrl+K to search">⌘K</kbd>
              )}
            </div>
          )}

          {/* Quick View Mode Switcher (on Home) */}
          {!isEditorial && onViewModeChange && (
            <div className="navbar-mode-switch">
              <button
                type="button"
                className={`navbar-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => onViewModeChange('grid')}
                title="Analyst Card Grid"
              >
                <LayoutGrid size={14} />
                <span className="mode-btn-text">Cards</span>
              </button>
              <button
                type="button"
                className={`navbar-mode-btn ${viewMode === 'matrix' ? 'active' : ''}`}
                onClick={() => onViewModeChange('matrix')}
                title="Executive Intelligence Matrix"
              >
                <Table size={14} />
                <span className="mode-btn-text">Matrix</span>
              </button>
            </div>
          )}

          {isEditorial && (
            <div className="navbar-editorial-center-tag">
              <span className="editorial-live-pulse" />
              <span>DECISION-GRADE BRIEFING</span>
            </div>
          )}
        </div>

        {/* Right: Author details & Actions */}
        <div className="navbar-right-controls">
          {/* Author Badge with Boy Icon & Portfolio click */}
          <div className="navbar-author-direct-wrap">
            <AuthorProfileBadge variant="navbar" />
          </div>

          {/* Desktop App & GitHub Releases Trigger */}
          {onOpenDesktopModal && (
            <button
              type="button"
              className="navbar-desktop-btn"
              onClick={onOpenDesktopModal}
              title="Download Desktop App (Windows, Linux, macOS) — GitHub Releases"
              aria-label="Desktop App Releases"
            >
              <Monitor size={14} />
              <span className="desktop-btn-label">Desktop App</span>
              <span className="desktop-release-dot" />
            </button>
          )}

          {/* Distribution Action (on editorial page) */}
          {isEditorial && onOpenDistribution && (
            <button
              type="button"
              className="navbar-repurpose-btn"
              onClick={onOpenDistribution}
              title="Open C-Suite Repurposing Kit"
            >
              <Share2 size={14} />
              <span className="repurpose-text">Repurpose</span>
            </button>
          )}

          {/* Legal Compliance Trigger */}
          {onOpenLegalModal && (
            <button
              type="button"
              className="navbar-icon-btn legal-btn"
              onClick={onOpenLegalModal}
              title="Legal Governance, Trademarks & Disclaimers"
              aria-label="Legal & Disclaimers"
            >
              <Scale size={16} />
            </button>
          )}

          {/* Theme Toggle Button */}
          {onThemeToggle && (
            <button
              type="button"
              className="navbar-icon-btn theme-toggle-btn"
              onClick={onThemeToggle}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </motion.div>
            </button>
          )}

          {/* Settings / Accent Picker Trigger */}
          {onOpenSettings && (
            <button
              type="button"
              className="navbar-icon-btn settings-btn"
              onClick={onOpenSettings}
              title="Customize Brand Colors & Workspace"
            >
              <Palette size={16} />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="navbar-mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mobile-drawer-inner">
              {/* Author & Portfolio Section in Mobile Drawer */}
              <div className="mobile-author-section" onClick={handlePortfolioRedirect}>
                <div className="mobile-author-badge">
                  <div className="boy-avatar-mini">👦</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-dark)' }}>Antony Xavier</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                      Lead Systems Architect & Analyst
                    </div>
                  </div>
                </div>
                <div className="mobile-author-links">
                  <button type="button" className="mobile-portfolio-link" onClick={handlePortfolioRedirect}>
                    <span>Portfolio</span>
                    <ExternalLink size={13} />
                  </button>
                  <button type="button" className="mobile-linkedin-link" onClick={handleLinkedinRedirect}>
                    <Linkedin size={14} />
                    <span>LinkedIn</span>
                  </button>
                </div>
              </div>

              <div className="mobile-drawer-divider" />

              {/* Mobile Search Bar (on Home Page) */}
              {!isEditorial && onSearchChange && (
                <div className="mobile-search-wrapper">
                  <div className="mobile-search-pill">
                    <Search size={15} className="navbar-search-icon" />
                    <input
                      type="text"
                      className="navbar-search-input"
                      placeholder="Search AI costs, crypto arch, ROI..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="navbar-search-clear"
                        onClick={() => onSearchChange('')}
                        title="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* View Switcher in Mobile */}
              {!isEditorial && onViewModeChange && (
                <div className="mobile-drawer-row">
                  <span className="mobile-row-label">View Format:</span>
                  <div className="mobile-view-buttons">
                    <button
                      type="button"
                      className={`mobile-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => { onViewModeChange('grid'); setMobileMenuOpen(false); }}
                    >
                      <LayoutGrid size={14} /> Cards
                    </button>
                    <button
                      type="button"
                      className={`mobile-view-btn ${viewMode === 'matrix' ? 'active' : ''}`}
                      onClick={() => { onViewModeChange('matrix'); setMobileMenuOpen(false); }}
                    >
                      <Table size={14} /> Matrix
                    </button>
                  </div>
                </div>
              )}

              {/* Desktop App Download Button in Mobile */}
              {onOpenDesktopModal && (
                <button
                  type="button"
                  className="mobile-drawer-btn desktop-app-mobile-btn"
                  onClick={() => { onOpenDesktopModal(); setMobileMenuOpen(false); }}
                >
                  <Monitor size={16} />
                  <span>Download Desktop App (Win / Linux / Mac)</span>
                </button>
              )}

              {/* Legal Governance Button in Mobile */}
              {onOpenLegalModal && (
                <button
                  type="button"
                  className="mobile-drawer-btn"
                  onClick={() => { onOpenLegalModal(); setMobileMenuOpen(false); }}
                >
                  <Scale size={16} />
                  <span>Legal, Trademark & Disclaimers</span>
                </button>
              )}

              {/* Workspace Settings in Mobile */}
              {onOpenSettings && (
                <button
                  type="button"
                  className="mobile-drawer-btn"
                  onClick={() => { onOpenSettings(); setMobileMenuOpen(false); }}
                >
                  <Palette size={16} />
                  <span>Customize Theme & Colors</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
