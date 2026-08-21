import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  DollarSign,
  Share2,
  Table as TableIcon
} from 'lucide-react';
import type { Post } from '../types';

interface AnalystMatrixViewProps {
  posts: Post[];
  onOpenDistribution?: (post: Post) => void;
}

export const AnalystMatrixView = ({ posts, onOpenDistribution }: AnalystMatrixViewProps) => {
  const navigate = useNavigate();

  const getThreatBadge = (level?: string) => {
    switch (level) {
      case 'High':
        return <span className="matrix-pill threat-high"><AlertTriangle size={12} /> Critical Threat</span>;
      case 'Medium':
        return <span className="matrix-pill threat-med"><AlertTriangle size={12} /> Moderate</span>;
      case 'Opportunity':
      default:
        return <span className="matrix-pill threat-opp"><Sparkles size={12} /> Strategic Opp</span>;
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="analyst-matrix-wrapper">
        <div className="matrix-header-info">
          <div className="matrix-title-badge">
            <TableIcon size={14} />
            <span>EXECUTIVE INTELLIGENCE MATRIX</span>
          </div>
          <p className="matrix-subtitle">
            Scannable cross-industry decision index sorted by strategic impact, estimated ROI horizon, and architecture priority.
          </p>
        </div>
        <div className="matrix-empty-state">
          <p>No intelligence briefings match your filter criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analyst-matrix-wrapper">
      <div className="matrix-header-info">
        <div className="matrix-title-badge">
          <TableIcon size={14} />
          <span>EXECUTIVE INTELLIGENCE MATRIX</span>
          <span className="matrix-count-chip">{posts.length} Reports</span>
        </div>
        <p className="matrix-subtitle">
          Scannable cross-industry decision index sorted by strategic impact, estimated ROI horizon, and architecture priority.
        </p>
        <div className="matrix-mobile-hint">
          <span>↔ Scroll horizontally to view full metrics matrix</span>
        </div>
      </div>

      <div className="matrix-table-scroll">
        <table className="analyst-table">
          <thead>
            <tr>
              <th className="col-title">Intelligence Topic & Briefing</th>
              <th className="col-category">Category / Sector</th>
              <th className="col-role">Target Decision-Maker</th>
              <th className="col-threat">Strategic Impact</th>
              <th className="col-roi">ROI / Payback</th>
              <th className="col-time">Skim Time</th>
              <th className="col-action">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr 
                key={post.id} 
                className="matrix-tr"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <td className="col-title">
                  <div className="table-post-title">{post.title}</div>
                  <div className="table-post-source">Source: {post.source}</div>
                </td>

                <td className="col-category">
                  <span className="category-tag-small" style={{ borderColor: post.color, color: post.color }}>
                    {post.category}
                  </span>
                </td>

                <td className="col-role">
                  <div className="matrix-roles-list">
                    {(post.targetRole || ['CTO', 'CFO']).slice(0, 2).map((role) => (
                      <span key={role} className="matrix-role-pill">{role}</span>
                    ))}
                  </div>
                </td>

                <td className="col-threat">
                  {getThreatBadge(post.threatLevel)}
                </td>

                <td className="col-roi">
                  <span className="matrix-roi-text">
                    <DollarSign size={13} />
                    {post.roiPotential || '3-6 Months'}
                  </span>
                </td>

                <td className="col-time">
                  <span className="matrix-time-text">
                    <Clock size={13} />
                    {post.reading_time}
                  </span>
                </td>

                <td className="col-action" onClick={(e) => e.stopPropagation()}>
                  <div className="matrix-action-buttons">
                    <button
                      type="button"
                      className="matrix-read-btn"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                      title="Read Executive Briefing"
                    >
                      <span>Read</span>
                      <ArrowRight size={13} />
                    </button>

                    {onOpenDistribution && (
                      <button
                        type="button"
                        className="matrix-share-btn"
                        onClick={() => onOpenDistribution(post)}
                        title="Open Repurposing & Distribution Toolkit"
                      >
                        <Share2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
