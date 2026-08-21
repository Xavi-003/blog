import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Share2, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  ShieldAlert, 
  Clock, 
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';
import type { ExecutiveTakeaway, KeyMetric, Post } from '../types';

interface ExecutiveSummaryCardProps {
  post?: Post;
  title?: string;
  takeaways?: ExecutiveTakeaway[];
  keyMetrics?: KeyMetric[];
  threatLevel?: 'High' | 'Medium' | 'Low' | 'Opportunity';
  roiPotential?: string;
  readingTime?: string;
  targetRoles?: string[];
  onOpenDistributionModal?: () => void;
}

export const ExecutiveSummaryCard = ({
  post,
  title: propTitle,
  takeaways: propTakeaways,
  keyMetrics: propKeyMetrics,
  threatLevel: propThreatLevel,
  roiPotential: propRoiPotential,
  readingTime: propReadingTime,
  targetRoles: propTargetRoles,
  onOpenDistributionModal,
}: ExecutiveSummaryCardProps) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const title = propTitle || post?.title || 'Executive Intelligence Briefing';
  const takeaways = propTakeaways || post?.executiveTakeaways || [];
  const keyMetrics = propKeyMetrics || post?.keyMetrics || [];
  const threatLevel = propThreatLevel || post?.threatLevel || 'Opportunity';
  const roiPotential = propRoiPotential || post?.roiPotential;
  const readingTime = propReadingTime || post?.reading_time || '5 min';
  const targetRoles = propTargetRoles || post?.targetRole || ['CTO', 'CFO', 'Product Leaders'];

  const defaultTakeaways: ExecutiveTakeaway[] = takeaways.length > 0 ? takeaways : [
    {
      tag: 'STRATEGY',
      label: 'Strategic Advantage',
      text: 'Enterprise adoption delivers critical competitive defensibility and 3-5x accelerated product cycle times.',
    },
    {
      tag: 'FINANCIAL',
      label: 'Cost & TCO Impact',
      text: 'Pre-packaged architectures cut initial R&D expenditure by 60% compared to scratch in-house builds.',
    },
    {
      tag: 'RISK',
      label: 'Governance & Security',
      text: 'Early integration of audit-verified protocols and air-gapped data layers mitigates regulatory non-compliance fines.',
    },
  ];

  const handleCopySummary = () => {
    const textToCopy = `📋 EXECUTIVE BRIEF: ${title}\n\nKey Takeaways:\n` +
      defaultTakeaways.map((t, idx) => `${idx + 1}. [${t.label}] ${t.text}`).join('\n\n') +
      `\n\nTarget Decision Makers: ${targetRoles.join(', ')} | Skim Time: ${readingTime}\nSource: AI Insights Pro (Analyst Intelligence)`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleAudioBrief = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text to speech is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const speechText = `Executive brief for: ${title}. ` +
        defaultTakeaways.map(t => `${t.label}: ${t.text}`).join('. ');
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'FINANCIAL':
      case 'ROI':
        return { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)', icon: DollarSign };
      case 'RISK':
        return { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', icon: ShieldAlert };
      case 'STRATEGY':
      default:
        return { bg: 'rgba(66, 133, 244, 0.12)', text: '#4285f4', border: 'rgba(66, 133, 244, 0.3)', icon: TrendingUp };
    }
  };

  const getThreatBadge = () => {
    switch (threatLevel) {
      case 'High':
        return { label: 'High Priority Threat', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: AlertTriangle };
      case 'Medium':
        return { label: 'Moderate Impact', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', icon: AlertTriangle };
      case 'Opportunity':
      default:
        return { label: 'Strategic Opportunity', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: Sparkles };
    }
  };

  const threatBadge = getThreatBadge();

  return (
    <section id="executive-summary" className="executive-summary-wrapper">
      <div className="executive-summary-card">
        {/* Top bar header */}
        <div className="exec-header-bar">
          <div className="exec-title-group">
            <div className="exec-pill">
              <Sparkles size={14} />
              <span>3-MINUTE EXECUTIVE BRIEF</span>
            </div>
            <h2 className="exec-heading">Key Decision-Maker Takeaways</h2>
          </div>

          <div className="exec-actions-group">
            <button
              type="button"
              onClick={toggleAudioBrief}
              className={`exec-action-btn ${isPlayingAudio ? 'active-audio' : ''}`}
              title={isPlayingAudio ? 'Stop Audio Briefing' : 'Listen to 60-Second Audio Brief'}
            >
              {isPlayingAudio ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isPlayingAudio ? 'Stop Brief' : 'Audio Brief'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="exec-action-btn"
              title="Copy Summary to Clipboard"
            >
              {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
              <span>{copied ? 'Copied Brief' : 'Copy Takeaways'}</span>
            </button>

            {onOpenDistributionModal && (
              <button
                type="button"
                onClick={onOpenDistributionModal}
                className="exec-action-btn primary-action"
                title="Repurpose for LinkedIn or Email Newsletter"
              >
                <Share2 size={15} />
                <span>Distribute Brief</span>
              </button>
            )}
          </div>
        </div>

        {/* Executive Meta Tags */}
        <div className="exec-meta-grid">
          <div className="exec-meta-item">
            <span className="meta-label">TARGET AUDIENCE</span>
            <div className="roles-tags-list">
              {targetRoles.map(role => (
                <span key={role} className="role-tag">{role}</span>
              ))}
            </div>
          </div>

          <div className="exec-meta-item">
            <span className="meta-label">STRATEGIC CLASSIFICATION</span>
            <span 
              className="threat-pill"
              style={{ color: threatBadge.color, backgroundColor: threatBadge.bg }}
            >
              <threatBadge.icon size={13} />
              {threatBadge.label}
            </span>
          </div>

          {roiPotential && (
            <div className="exec-meta-item">
              <span className="meta-label">EXPECTED ROI HORIZON</span>
              <span className="roi-pill">
                <DollarSign size={13} />
                {roiPotential}
              </span>
            </div>
          )}

          <div className="exec-meta-item">
            <span className="meta-label">EXECUTIVE SKIM TIME</span>
            <span className="time-pill">
              <Clock size={13} />
              {readingTime}
            </span>
          </div>
        </div>

        {/* 3-Bullet Executive Takeaways */}
        <div className="takeaways-list">
          {defaultTakeaways.map((item, idx) => {
            const style = getTagColor(item.tag);
            const Icon = style.icon;

            return (
              <motion.div 
                key={idx}
                className="takeaway-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div 
                  className="takeaway-badge"
                  style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </div>
                <p className="takeaway-text">{item.text}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Key Metrics Quick Dashboard if available */}
        {keyMetrics.length > 0 && (
          <div className="exec-metrics-row">
            {keyMetrics.map((metric, idx) => (
              <div key={idx} className="metric-box">
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
                <div className="metric-subtext">{metric.subtext}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
