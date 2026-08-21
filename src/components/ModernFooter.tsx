import React from 'react';
import { 
  Zap, 
  Linkedin, 
  Github, 
  ExternalLink, 
  Scale, 
  ShieldCheck, 
  Mail, 
  Sparkles,
  Lock
} from 'lucide-react';
import { AuthorProfileBadge } from './AuthorProfileBadge';

interface ModernFooterProps {
  onOpenLegalModal: () => void;
  onOpenSettings?: () => void;
}

export const ModernFooter: React.FC<ModernFooterProps> = ({ onOpenLegalModal, onOpenSettings }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="modern-footer-container">
      <div className="modern-footer-top">
        {/* Column 1: Brand & Independent Research Mission */}
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <div className="footer-logo-icon">
              <Zap fill="var(--primary-color)" color="var(--primary-color)" size={22} />
            </div>
            <div className="footer-brand-text">
              <span className="brand-title">AI<span>INSIGHTS</span> PRO</span>
              <span className="brand-badge">EXECUTIVE INTEL</span>
            </div>
          </div>

          <p className="footer-mission-text">
            Decision-grade intelligence briefings on enterprise AI integration costs, white-label fintech architectures, and regulatory risk mitigation for CTOs, CFOs, and technology leaders.
          </p>

          <div className="footer-legal-seal" onClick={onOpenLegalModal}>
            <ShieldCheck size={16} className="seal-icon" />
            <div>
              <div className="seal-title">Audited & Verified Research</div>
              <div className="seal-desc">Nominative Fair Use & Zero Telemetry Compliant</div>
            </div>
          </div>
        </div>

        {/* Column 2: Lead Analyst & Portfolio Card */}
        <div className="footer-author-col">
          <div className="footer-col-header">
            <Sparkles size={16} />
            <span>Lead Systems Architect</span>
          </div>

          <div className="footer-author-profile-box">
            <AuthorProfileBadge variant="card" showBio={true} />
          </div>
        </div>

        {/* Column 3: Legal Governance & Compliance Links */}
        <div className="footer-compliance-col">
          <div className="footer-col-header">
            <Scale size={16} />
            <span>Legal & Governance</span>
          </div>

          <ul className="footer-links-list">
            <li>
              <button type="button" className="footer-link-btn" onClick={onOpenLegalModal}>
                <Scale size={14} />
                <span>Editorial Independence Policy</span>
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={onOpenLegalModal}>
                <ShieldCheck size={14} />
                <span>Trademark Fair Use Statement</span>
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={onOpenLegalModal}>
                <Lock size={14} />
                <span>Zero-Telemetry Privacy Notice</span>
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={onOpenLegalModal}>
                <ExternalLink size={14} />
                <span>Engineering Advisory Disclaimer</span>
              </button>
            </li>
            {onOpenSettings && (
              <li>
                <button type="button" className="footer-link-btn" onClick={onOpenSettings}>
                  <span>Customize Theme & Colors</span>
                </button>
              </li>
            )}
          </ul>

          <div className="footer-contact-box">
            <Mail size={14} />
            <span>Research Inquiries: </span>
            <a href="mailto:xavier.developer03@gmail.com" className="footer-email-link">
              xavier.developer03@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="modern-footer-bottom">
        <div className="footer-copyright">
          © {currentYear} <strong>AI Insights Pro</strong>. Research authored by{' '}
          <a
            href="https://xavi-003.github.io/portfolio/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-author-highlight"
          >
            Antony Xavier
          </a>
          . All rights reserved.
        </div>

        <div className="footer-bottom-badges">
          <a
            href="https://www.linkedin.com/in/antony-xavier-4b5019333"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-badge linkedin"
            title="Antony Xavier LinkedIn Profile"
          >
            <Linkedin size={14} />
            <span>LinkedIn</span>
          </a>

          <a
            href="https://github.com/Xavi-003"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-badge github"
            title="Xavi-003 GitHub Profile"
          >
            <Github size={14} />
            <span>GitHub</span>
          </a>

          <a
            href="https://xavi-003.github.io/portfolio/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-badge portfolio"
            title="Antony Xavier Portfolio"
          >
            <ExternalLink size={14} />
            <span>Portfolio</span>
          </a>

          <button
            type="button"
            className="footer-legal-quick-btn"
            onClick={onOpenLegalModal}
          >
            Legal Notices
          </button>
        </div>
      </div>
    </footer>
  );
};
