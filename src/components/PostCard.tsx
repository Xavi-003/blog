import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  Share2,
  ChevronDown
} from 'lucide-react';
import type { Post } from '../types';
import { AuthorProfileBadge } from './AuthorProfileBadge';

interface PostCardProps {
  post: Post;
  index: number;
  onOpenDistributionModal?: (post: Post) => void;
}

export const PostCard = ({ post, index, onOpenDistributionModal }: PostCardProps) => {
  const navigate = useNavigate();
  const [showTakeawaysPreview, setShowTakeawaysPreview] = useState(false);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getThreatBadge = () => {
    switch (post.threatLevel) {
      case 'High':
        return { label: 'High Threat', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: AlertTriangle };
      case 'Medium':
        return { label: 'Moderate Risk', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', icon: AlertTriangle };
      case 'Opportunity':
      default:
        return { label: 'Strategic Opportunity', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: Sparkles };
    }
  };

  const threatBadge = getThreatBadge();
  const takeaways = post.executiveTakeaways || [];

  return (
    <motion.article
      className="b2b-post-card"
      initial={{ y: 25, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      onClick={() => navigate(`/blog/${post.slug}`)}
    >
      {/* Thumbnail Banner */}
      <div className="card-media-wrap">
        {index === 0 && (
          <div className="badge-featured-analyst">
            <Sparkles size={12} />
            <span>EXECUTIVE LEAD REPORT</span>
          </div>
        )}

        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title} 
            loading="lazy" 
            className="card-image"
          />
        ) : (
          <div className="card-image-placeholder">
            <span>📊</span>
          </div>
        )}

        <div className="card-overlay-badges">
          <span 
            className="card-threat-badge"
            style={{ color: threatBadge.color, backgroundColor: threatBadge.bg }}
          >
            <threatBadge.icon size={12} />
            {threatBadge.label}
          </span>

          <span className="card-read-time">
            <Clock size={12} />
            {post.reading_time}
          </span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="card-body">
        <div className="card-meta-top">
          <span className="card-category-pill" style={{ color: post.color, borderColor: post.color }}>
            {post.category}
          </span>
          <span className="card-date">{formatDate(post.date)}</span>
        </div>

        <h3 className="card-headline">{post.title}</h3>

        {post.subtitle && (
          <p className="card-subtitle-text">{post.subtitle}</p>
        )}

        {/* Target Roles */}
        <div className="card-roles-row">
          <span className="roles-prefix">Target:</span>
          {(post.targetRole || ['CTO', 'CFO']).slice(0, 3).map((role) => (
            <span key={role} className="card-role-chip">{role}</span>
          ))}
        </div>

        {/* 3-Minute Skim Preview Drawer */}
        {takeaways.length > 0 && (
          <div className="card-takeaways-quick" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="quick-takeaways-toggle"
              onClick={() => setShowTakeawaysPreview(!showTakeawaysPreview)}
            >
              <span>⚡ 3-Bullet Executive Takeaways</span>
              <ChevronDown size={14} className={`transform transition-transform ${showTakeawaysPreview ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showTakeawaysPreview && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="quick-takeaways-body"
                >
                  {takeaways.map((item, idx) => (
                    <div key={idx} className="quick-item">
                      <strong className="quick-tag">[{item.label}]:</strong> {item.text}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Footer info */}
        <div className="card-footer-meta">
          <div className="card-author-wrap">
            {post.author ? (
              <AuthorProfileBadge author={post.author} variant="compact" />
            ) : (
              <div className="card-source-tag" title={`Verified Source: ${post.source}`}>
                <span className="card-source-dot" style={{ backgroundColor: post.color || 'var(--primary-color)' }} />
                <span className="card-source-name">{post.source}</span>
              </div>
            )}
          </div>

          <div className="card-action-links" onClick={(e) => e.stopPropagation()}>
            {onOpenDistributionModal && (
              <button
                type="button"
                className="card-share-btn"
                title="Distribute to LinkedIn / Email"
                onClick={() => onOpenDistributionModal(post)}
              >
                <Share2 size={14} />
              </button>
            )}

            <button
              type="button"
              className="card-read-action"
              onClick={() => navigate(`/blog/${post.slug}`)}
            >
              <span>Read</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};
