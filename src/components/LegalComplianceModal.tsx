import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, FileText, AlertCircle, Check, Copy, ExternalLink, Lock, Scale } from 'lucide-react';

interface LegalComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalComplianceModal: React.FC<LegalComplianceModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<'overview' | 'trademarks' | 'disclaimer' | 'privacy'>('overview');

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const copyLegalTerms = () => {
    const text = `AI INSIGHTS PRO — LEGAL GOVERNANCE & EDITORIAL COMPLIANCE NOTICE
Published by Antony Xavier (https://xavi-003.github.io/portfolio/)

1. RESEARCH & EDUCATIONAL PURPOSE: All technical briefings, financial cost benchmarks, ROI models, architecture diagrams, and comparison matrices are published solely for educational, technical evaluation, and independent architectural research. They do not constitute formal legal, investment, financial, tax, or accounting advice.

2. NOMINATIVE FAIR USE & TRADEMARK POLICY: All product names, logos, trademarks, and registered brand identities referenced (including Google Cloud, Google Gemini, OpenAI ChatGPT, Anthropic Claude, Meta Llama, Solana, Ethereum, AWS, ISO 27001, SOC2, etc.) remain the exclusive intellectual property of their respective holders. Mention on this platform is strictly nominative for fair use commentary, comparative evaluation, and technical interoperability analysis.

3. INDEPENDENT EDITORIAL INTEGRITY: AI Insights Pro operates with strict editorial independence. We do not accept undisclosed vendor sponsorships or paid benchmark adjustments.

4. LIMITATION OF LIABILITY & ZERO WARRANTIES: Software architectures and regulatory frameworks evolve rapidly. All implementations should be verified by certified enterprise legal and engineering counsel prior to production rollout.

5. ZERO TELEMETRY & PRIVACY: No personal identifiable data (PII) is sold, traded, or harvested. 100% GDPR/CCPA compliant static client application.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="legal-modal-container"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 } as any}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="legal-modal-header">
              <div className="legal-header-title-wrap">
                <div className="legal-shield-icon">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="legal-modal-title">Legal Governance & Compliance</h3>
                  <p className="legal-modal-subtitle">Editorial standards, trademark fair use, and non-liability disclosures</p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={onClose} title="Close Legal Notice">
                <X size={20} />
              </button>
            </div>

            {/* Legal Navigation Tabs */}
            <div className="legal-nav-tabs">
              <button
                type="button"
                className={`legal-tab-btn ${activeLegalTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveLegalTab('overview')}
              >
                <ShieldCheck size={15} />
                <span>Executive Summary</span>
              </button>
              <button
                type="button"
                className={`legal-tab-btn ${activeLegalTab === 'trademarks' ? 'active' : ''}`}
                onClick={() => setActiveLegalTab('trademarks')}
              >
                <FileText size={15} />
                <span>Trademark Fair Use</span>
              </button>
              <button
                type="button"
                className={`legal-tab-btn ${activeLegalTab === 'disclaimer' ? 'active' : ''}`}
                onClick={() => setActiveLegalTab('disclaimer')}
              >
                <AlertCircle size={15} />
                <span>Non-Liability Disclaimer</span>
              </button>
              <button
                type="button"
                className={`legal-tab-btn ${activeLegalTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveLegalTab('privacy')}
              >
                <Lock size={15} />
                <span>Privacy & Data Rights</span>
              </button>
            </div>

            {/* Legal Content Body */}
            <div className="legal-modal-body">
              {activeLegalTab === 'overview' && (
                <div className="legal-section-block">
                  <div className="legal-callout-box success">
                    <ShieldCheck size={18} className="callout-icon" />
                    <div>
                      <strong>Full Legal & Ethical Compliance Verified</strong>
                      <p>
                        This intelligence platform is published by <strong>Antony Xavier</strong> as an independent technology evaluation and systems architecture research resource.
                      </p>
                    </div>
                  </div>

                  <h4 className="legal-subheading">Core Principles of Operation</h4>
                  <ul className="legal-bullet-list">
                    <li>
                      <strong>1. Strictly Educational & Evaluative:</strong> All ROI calculators, token cost models, and architectural blueprints are conceptual analytical tools intended for enterprise evaluation.
                    </li>
                    <li>
                      <strong>2. No Undisclosed Commercial Bias:</strong> Comparisons between proprietary platforms and open-source models are conducted objectively based on public engineering benchmarks and SLA documentation.
                    </li>
                    <li>
                      <strong>3. Fair Use Citation Standards:</strong> All external research papers, regulatory texts (e.g., EU AI Act, MiCA), and whitepapers are cited with full canonical attribution.
                    </li>
                  </ul>
                </div>
              )}

              {activeLegalTab === 'trademarks' && (
                <div className="legal-section-block">
                  <h4 className="legal-subheading">Nominative Fair Use & Intellectual Property</h4>
                  <p className="legal-text">
                    All trademarks, service marks, trade names, trade dress, product names, and logos appearing on <em>AI Insights Pro</em> are the property of their respective owners.
                  </p>
                  <div className="legal-disclaimer-card">
                    <p className="legal-quote">
                      "References to proprietary technologies, including Google Gemini, Anthropic Claude, OpenAI, Ethereum, Solana, Amazon Web Services (AWS), Microsoft Azure, Linux Foundation, or ISO standards, are made strictly under the doctrine of <strong>Nominative Fair Use</strong> for descriptive identification, critical commentary, and comparative architectural analysis."
                    </p>
                  </div>
                  <p className="legal-text small">
                    AI Insights Pro is not affiliated with, endorsed by, or sponsored by any third-party corporate entities unless explicitly identified in a specific audited case study.
                  </p>
                </div>
              )}

              {activeLegalTab === 'disclaimer' && (
                <div className="legal-section-block">
                  <h4 className="legal-subheading">Non-Financial, Non-Legal Engineering Advisory Disclaimer</h4>
                  <div className="legal-callout-box warning">
                    <AlertCircle size={18} className="callout-icon" />
                    <div>
                      <strong>Important Notice for C-Suite Decision Makers</strong>
                      <p>
                        The analyses published here do not constitute formal investment advice, tax counseling, or legal compliance guarantees.
                      </p>
                    </div>
                  </div>
                  <p className="legal-text">
                    Because cloud provider pricing, API rate limits, model weights, and regulatory statutes evolve continuously, technical figures (such as inference token costs, payback months, and hardware requirements) reflect estimated industry averages at the time of publication.
                  </p>
                  <p className="legal-text">
                    Enterprises must perform their own security audits, load-testing, and compliance assessments with certified legal and systems architects prior to production deployment.
                  </p>
                </div>
              )}

              {activeLegalTab === 'privacy' && (
                <div className="legal-section-block">
                  <h4 className="legal-subheading">Zero-Telemetry Privacy & Data Security</h4>
                  <p className="legal-text">
                    We believe in strict enterprise-grade privacy by design:
                  </p>
                  <ul className="legal-bullet-list">
                    <li>
                      <strong>Zero Tracking Cookies:</strong> This application does not inject third-party advertising trackers or sell browsing data to data brokers.
                    </li>
                    <li>
                      <strong>Client-Side Processing:</strong> All ROI calculator computations and repurposing previews execute locally within your browser sandbox.
                    </li>
                    <li>
                      <strong>GDPR & CCPA Aligned:</strong> Full compliance with global privacy regulations without unnecessary data retention.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="legal-modal-footer">
              <div className="legal-footer-author">
                <span>Researcher & Publisher: </span>
                <a
                  href="https://xavi-003.github.io/portfolio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="legal-author-link"
                >
                  Antony Xavier
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="legal-footer-actions">
                <button
                  type="button"
                  className="legal-copy-btn"
                  onClick={copyLegalTerms}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Terms Copied!' : 'Copy Legal Notice'}</span>
                </button>
                <button
                  type="button"
                  className="legal-accept-btn"
                  onClick={onClose}
                >
                  <span>Understood & Close</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
