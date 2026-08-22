import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Github,
  Monitor,
  ExternalLink,
  CheckCircle2,
  Terminal,
  Layers,
  Zap,
  ShieldCheck,
  HardDrive,
  Copy,
  Check
} from 'lucide-react';

interface DesktopReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopReleaseModal: React.FC<DesktopReleaseModalProps> = ({ isOpen, onClose }) => {
  const [selectedOS, setSelectedOS] = useState<'windows' | 'linux' | 'macos'>('windows');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const RELEASES_URL = 'https://github.com/Xavi-003/portfolio/releases';
  const BLOG_RELEASES_URL = 'https://github.com/Xavi-003/blog/releases';
  const LATEST_VERSION = 'v2.4.0';

  const linuxInstallCommand = 'curl -sSL https://raw.githubusercontent.com/Xavi-003/portfolio/main/install-desktop.sh | bash';

  const handleCopyLinuxCmd = () => {
    navigator.clipboard.writeText(linuxInstallCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDownload = (platform: string, filename: string) => {
    // Open GitHub releases with direct asset context
    window.open(`${RELEASES_URL}/latest`, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="desktop-modal-backdrop" onClick={onClose}>
          <motion.div
            className="desktop-modal-card"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="desktop-modal-header">
              <div className="desktop-header-left">
                <div className="desktop-logo-icon">
                  <Monitor size={22} className="desktop-icon-glow" />
                </div>
                <div>
                  <div className="desktop-header-title-row">
                    <h3 className="desktop-title">AI Insights Pro Workstation</h3>
                    <span className="desktop-version-badge">{LATEST_VERSION} Latest</span>
                  </div>
                  <p className="desktop-subtitle">
                    Native desktop client for Windows, Linux & macOS with offline research caching
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="desktop-close-btn"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* OS Selector Tabs */}
            <div className="desktop-os-tabs">
              <button
                type="button"
                className={`desktop-os-tab ${selectedOS === 'windows' ? 'active' : ''}`}
                onClick={() => setSelectedOS('windows')}
              >
                <span className="os-icon">🪟</span>
                <div className="os-tab-text">
                  <span className="os-name">Windows</span>
                  <span className="os-desc">10 / 11 (x64, ARM64)</span>
                </div>
              </button>

              <button
                type="button"
                className={`desktop-os-tab ${selectedOS === 'linux' ? 'active' : ''}`}
                onClick={() => setSelectedOS('linux')}
              >
                <span className="os-icon">🐧</span>
                <div className="os-tab-text">
                  <span className="os-name">Linux</span>
                  <span className="os-desc">AppImage, DEB, RPM</span>
                </div>
              </button>

              <button
                type="button"
                className={`desktop-os-tab ${selectedOS === 'macos' ? 'active' : ''}`}
                onClick={() => setSelectedOS('macos')}
              >
                <span className="os-icon">🍏</span>
                <div className="os-tab-text">
                  <span className="os-name">macOS</span>
                  <span className="os-desc">Apple Silicon & Intel</span>
                </div>
              </button>
            </div>

            {/* Main Content Area based on OS */}
            <div className="desktop-modal-body">
              {selectedOS === 'windows' && (
                <div className="os-details-panel">
                  <div className="os-hero-box">
                    <div className="os-hero-info">
                      <h4>Windows Desktop Workstation</h4>
                      <p>Single-click Windows installer with hardware GPU acceleration & system tray sync.</p>
                      <ul className="os-feature-list">
                        <li><CheckCircle2 size={15} /> Instant Global Hotkey (<code>Alt + Space</code> / <code>Ctrl + K</code>)</li>
                        <li><CheckCircle2 size={15} /> Offline B2B Article Library & ROI Models</li>
                        <li><CheckCircle2 size={15} /> Zero-Telemetry sandboxed local execution</li>
                      </ul>
                    </div>
                  </div>

                  <div className="os-downloads-grid">
                    <button
                      type="button"
                      className="download-action-btn primary"
                      onClick={() => handleDownload('windows', 'ai-insights-setup.exe')}
                    >
                      <Download size={16} />
                      <div className="download-btn-text">
                        <span className="btn-main-label">Download .EXE Installer</span>
                        <span className="btn-sub-label">64-bit Windows (Recommended)</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="download-action-btn secondary"
                      onClick={() => handleDownload('windows', 'ai-insights-portable.zip')}
                    >
                      <HardDrive size={16} />
                      <div className="download-btn-text">
                        <span className="btn-main-label">Portable .ZIP Release</span>
                        <span className="btn-sub-label">No Installation Required</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {selectedOS === 'linux' && (
                <div className="os-details-panel">
                  <div className="os-hero-box">
                    <div className="os-hero-info">
                      <h4>Linux Universal Packages</h4>
                      <p>Full support for Ubuntu, Debian, Fedora, Arch Linux, and immutable distros.</p>
                      <ul className="os-feature-list">
                        <li><CheckCircle2 size={15} /> Portable standalone universal <code>.AppImage</code></li>
                        <li><CheckCircle2 size={15} /> Native Debian/Ubuntu <code>.deb</code> package</li>
                        <li><CheckCircle2 size={15} /> Wayland and X11 native windowing support</li>
                      </ul>
                    </div>
                  </div>

                  <div className="os-downloads-grid">
                    <button
                      type="button"
                      className="download-action-btn primary"
                      onClick={() => handleDownload('linux', 'ai-insights-linux.AppImage')}
                    >
                      <Download size={16} />
                      <div className="download-btn-text">
                        <span className="btn-main-label">Download .AppImage</span>
                        <span className="btn-sub-label">Universal Linux (All Distros)</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="download-action-btn secondary"
                      onClick={() => handleDownload('linux', 'ai-insights_amd64.deb')}
                    >
                      <Layers size={16} />
                      <div className="download-btn-text">
                        <span className="btn-main-label">Download .DEB Package</span>
                        <span className="btn-sub-label">Ubuntu / Debian / Mint</span>
                      </div>
                    </button>
                  </div>

                  {/* Terminal Command Box */}
                  <div className="terminal-quick-install">
                    <div className="terminal-header">
                      <Terminal size={14} />
                      <span>Quick CLI Install</span>
                    </div>
                    <div className="terminal-code-row">
                      <code>{linuxInstallCommand}</code>
                      <button
                        type="button"
                        className="copy-terminal-btn"
                        onClick={handleCopyLinuxCmd}
                        title="Copy command"
                      >
                        {copiedCmd ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedOS === 'macos' && (
                <div className="os-details-panel">
                  <div className="os-hero-box">
                    <div className="os-hero-info">
                      <h4>macOS Executive Edition</h4>
                      <p>Native macOS app with Retina display optimization and dark mode auto-switching.</p>
                      <ul className="os-feature-list">
                        <li><CheckCircle2 size={15} /> Native Apple Silicon (M1/M2/M3/M4) & Intel support</li>
                        <li><CheckCircle2 size={15} /> Spotlight-style Quick Search widget (<code>⌘ + K</code>)</li>
                        <li><CheckCircle2 size={15} /> Local intelligence export to PDF, JSON & Markdown</li>
                      </ul>
                    </div>
                  </div>

                  <div className="os-downloads-grid">
                    <button
                      type="button"
                      className="download-action-btn primary"
                      onClick={() => handleDownload('macos', 'ai-insights-arm64.dmg')}
                    >
                      <Download size={16} />
                      <div className="download-btn-text">
                        <span className="btn-main-label">Download .DMG (Apple Silicon)</span>
                        <span className="btn-sub-label">M1, M2, M3, M4 Macs</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="download-action-btn secondary"
                      onClick={() => handleDownload('macos', 'ai-insights-x64.dmg')}
                    >
                      <HardDrive size={16} />
                      <div className="download-btn-text">
                        <span className="btn-main-label">Download .DMG (Intel)</span>
                        <span className="btn-sub-label">Legacy Intel x64 Macs</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* GitHub Releases Direct Link Banner */}
              <div className="desktop-github-banner">
                <div className="github-banner-left">
                  <Github size={20} className="github-banner-icon" />
                  <div>
                    <strong>View all 38+ GitHub Releases & Changelog</strong>
                    <p>Access automated CI/CD builds, SHA256 checksums, and source tags directly on GitHub.</p>
                  </div>
                </div>
                <div className="github-banner-actions">
                  <a
                    href={RELEASES_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-releases-link-btn"
                  >
                    <span>GitHub Releases</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="desktop-modal-footer">
              <div className="desktop-footer-note">
                <ShieldCheck size={14} className="security-icon" />
                <span>Open Source • Built with automated GitHub Actions CI/CD • Verified Signatures</span>
              </div>
              <button type="button" className="desktop-dismiss-btn" onClick={onClose}>
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
