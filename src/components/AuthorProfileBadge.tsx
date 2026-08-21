import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import type { AuthorInfo } from '../types';

interface AuthorProfileBadgeProps {
  author?: AuthorInfo;
  variant?: 'compact' | 'card' | 'navbar' | 'footer';
  showBio?: boolean;
}

// Boy Avatar / Tech Analyst Icon SVG Illustration
export const BoyAvatarIcon: React.FC<{ authorName?: string }> = ({ authorName = 'Author' }) => (
  <div className="boy-avatar-container" title={`${authorName} — Click to visit Portfolio`}>
    <svg
      viewBox="0 0 64 64"
      className="boy-avatar-svg"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="30" fill="var(--primary-color)" fillOpacity="0.15" stroke="var(--primary-color)" strokeWidth="2" />
      {/* Hair */}
      <path d="M19 28C19 20 24 14 32 14C40 14 45 20 45 28C43 25 39 24 35 24C28 24 22 26 19 28Z" fill="#1e293b" />
      {/* Face */}
      <ellipse cx="32" cy="32" rx="13" ry="14" fill="#fed7aa" />
      {/* Eyes */}
      <circle cx="28" cy="31" r="1.8" fill="#0f172a" />
      <circle cx="36" cy="31" r="1.8" fill="#0f172a" />
      {/* Smile */}
      <path d="M29 37C30.5 39 33.5 39 35 37" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
      {/* Glasses (Tech Analyst Style) */}
      <rect x="24" y="27" width="7" height="7" rx="2" stroke="var(--primary-color)" strokeWidth="1.6" fill="none" />
      <rect x="33" y="27" width="7" height="7" rx="2" stroke="var(--primary-color)" strokeWidth="1.6" fill="none" />
      <line x1="31" y1="30" x2="33" y2="30" stroke="var(--primary-color)" strokeWidth="1.6" />
      {/* Suit / Tech Hoodie Collar */}
      <path d="M21 54C21 44 26 43 32 43C38 43 43 44 43 54" fill="#334155" />
      <path d="M28 43L32 49L36 43" fill="#f8fafc" />
    </svg>
    <span className="live-status-dot" title="Available for Architect Consulting" />
  </div>
);

// Helper to check if a URL is valid and non-placeholder
const isValidExternalUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  // Exclude placeholder homepages
  const lower = trimmed.toLowerCase();
  if (lower === 'https://linkedin.com' || lower === 'https://www.linkedin.com' || lower === 'https://linkedin.com/' || lower === 'https://www.linkedin.com/') {
    return false;
  }
  if (lower === 'https://github.com' || lower === 'https://www.github.com' || lower === 'https://github.com/') {
    return false;
  }
  return true;
};

export const AuthorProfileBadge: React.FC<AuthorProfileBadgeProps> = ({
  author,
  variant = 'compact',
  showBio = false
}) => {
  // Check if this represents the primary verified site architect (Antony Xavier)
  const isPrimaryAnalyst = !author || 
    author.isOfficial === true ||
    (author.name ? (author.name.toLowerCase().includes('antony') || author.name.toLowerCase().includes('xavier')) : false);

  const authorName = isPrimaryAnalyst ? (author?.name || "Antony Xavier") : (author?.name || "Contributing Analyst");
  const authorRole = author?.role || (isPrimaryAnalyst ? "Lead Tech & Systems Analyst" : "Industry Research Specialist");
  const authorAffiliation = author?.affiliation || (isPrimaryAnalyst ? "AI Insights Pro Research Guild" : "Contributing Research Network");
  const credentials = author?.credentials || (isPrimaryAnalyst ? "B2B Software Architect & Enterprise Systems Strategist" : undefined);

  // Strictly isolate URLs: never attribute Antony's personal portfolio or github to another third-party analyst
  const portfolioUrl = isPrimaryAnalyst
    ? (author?.portfolio || "https://xavi-003.github.io/portfolio/")
    : (author?.portfolio && isValidExternalUrl(author.portfolio) && !author.portfolio.includes('xavi-003') ? author.portfolio : undefined);

  const linkedinUrl = isPrimaryAnalyst
    ? (author?.linkedin || "https://www.linkedin.com/in/antony-xavier-4b5019333")
    : (author?.linkedin && isValidExternalUrl(author.linkedin) && !author.linkedin.includes('antony-xavier') ? author.linkedin : undefined);

  const githubUrl = isPrimaryAnalyst
    ? (author?.github || "https://github.com/Xavi-003")
    : (author?.github && isValidExternalUrl(author.github) && !author.github.includes('Xavi-003') ? author.github : undefined);

  const hasPortfolio = Boolean(portfolioUrl);
  const hasLinkedin = Boolean(linkedinUrl);
  const hasGithub = Boolean(githubUrl);
  const hasAnySocialActions = hasPortfolio || hasLinkedin || hasGithub;

  const badgeText = isPrimaryAnalyst
    ? "VERIFIED LEAD ANALYST & ARCHITECT"
    : (author?.isVerified ? "VERIFIED CONTRIBUTING ANALYST" : "CONTRIBUTING INDUSTRY ANALYST");

  const handlePortfolioClick = (e: React.MouseEvent) => {
    if (!portfolioUrl) return;
    e.stopPropagation();
    window.open(portfolioUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedinClick = (e: React.MouseEvent) => {
    if (!linkedinUrl) return;
    e.stopPropagation();
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  const handleGithubClick = (e: React.MouseEvent) => {
    if (!githubUrl) return;
    e.stopPropagation();
    window.open(githubUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'navbar') {
    return (
      <div 
        className="navbar-author-pill" 
        onClick={hasPortfolio ? handlePortfolioClick : undefined}
        style={{ cursor: hasPortfolio ? 'pointer' : 'default' }}
      >
        <BoyAvatarIcon authorName={authorName} />
        <div className="navbar-author-text">
          <div className="navbar-author-name-row">
            <span className="navbar-author-name">{authorName}</span>
            <span className="navbar-verified-check" title="Verified Tech Analyst & Architect">✓</span>
          </div>
          <span className="navbar-author-cta">Portfolio & Research ↗</span>
        </div>
        {hasLinkedin && (
          <div className="navbar-author-socials" onClick={(e) => e.stopPropagation()}>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-social-link linkedin-link"
              title={`${authorName} on LinkedIn`}
              onClick={handleLinkedinClick}
            >
              <Linkedin size={13} />
            </a>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div 
        className="author-credentials-card"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onClick={hasPortfolio ? handlePortfolioClick : undefined}
        style={{ cursor: hasPortfolio ? 'pointer' : 'default' }}
        title={hasPortfolio ? `Click to view ${authorName}'s Portfolio` : authorName}
      >
        <div className="author-card-avatar-wrap">
          <BoyAvatarIcon authorName={authorName} />
          {hasLinkedin && (
            <a 
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="author-linkedin-badge"
              title="Connect on LinkedIn"
              onClick={handleLinkedinClick}
            >
              <Linkedin size={14} />
            </a>
          )}
        </div>

        <div className="author-card-body">
          <div className="author-verified-tag">
            <ShieldCheck size={14} />
            <span>{badgeText}</span>
          </div>
          
          <div className="author-card-title-row">
            <h4 className="author-card-name">{authorName}</h4>
            {hasPortfolio && (
              <span className="author-portfolio-indicator">
                <span>View Portfolio</span>
                <ExternalLink size={14} />
              </span>
            )}
          </div>

          <p className="author-card-role">
            {authorRole} • <strong>{authorAffiliation}</strong>
          </p>
          
          {showBio && credentials && (
            <p className="author-card-bio">{credentials}</p>
          )}

          {hasAnySocialActions && (
            <div className="author-actions-row" onClick={(e) => e.stopPropagation()}>
              {hasPortfolio && (
                <button 
                  type="button" 
                  className="author-action-btn primary"
                  onClick={handlePortfolioClick}
                >
                  <Sparkles size={14} />
                  <span>Explore Portfolio & Projects</span>
                  <ExternalLink size={13} />
                </button>
              )}
              {hasLinkedin && (
                <a 
                  href={linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="author-action-btn secondary linkedin"
                  onClick={handleLinkedinClick}
                >
                  <Linkedin size={14} />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {hasGithub && (
                <a 
                  href={githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="author-action-btn secondary github"
                  onClick={handleGithubClick}
                >
                  <span>GitHub</span>
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Compact variant (used inside PostCard or sidebar)
  return (
    <div 
      className="author-compact-badge" 
      onClick={hasPortfolio ? handlePortfolioClick : undefined} 
      style={{ cursor: hasPortfolio ? 'pointer' : 'default' }}
      title={hasPortfolio ? `Authored by ${authorName} • Click to visit Portfolio` : `Authored by ${authorName}`}
    >
      <div className="author-compact-avatar">
        <BoyAvatarIcon authorName={authorName} />
      </div>
      <div className="author-compact-info">
        <span className="author-compact-name">{authorName}</span>
        <span className="author-compact-role">{authorRole.split('&')[0]}</span>
      </div>
      {hasLinkedin && (
        <div className="author-compact-links" onClick={(e) => e.stopPropagation()}>
          <a 
            href={linkedinUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="author-mini-icon-link" 
            title={`${authorName} on LinkedIn`}
            onClick={handleLinkedinClick}
          >
            <Linkedin size={12} />
          </a>
        </div>
      )}
    </div>
  );
};
