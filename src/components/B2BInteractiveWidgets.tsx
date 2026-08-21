import { useState, useMemo } from 'react';
import { 
  Calculator, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  UserCheck, 
  Layers,
  ChevronRight
} from 'lucide-react';
import type { ComparisonMatrix, ImplementationPhase, ExpertInterview, Post } from '../types';

// ==========================================
// 1. ROI & IMPLEMENTATION COST CALCULATOR
// ==========================================
export const RoiCalculatorWidget = ({ 
  defaultType = 'enterprise-ai' 
}: { 
  defaultType?: 'enterprise-ai' | 'crypto-exchange' | 'workflow-automation';
}) => {
  const [modelType, setModelType] = useState<'enterprise-ai' | 'crypto-exchange' | 'workflow-automation'>(defaultType);
  const [teamSize, setTeamSize] = useState<number>(50);
  const [infraTier, setInfraTier] = useState<'cloud' | 'hybrid' | 'self-hosted'>('hybrid');
  const [volumeLevel, setVolumeLevel] = useState<number>(250); // Thousands of ops/mo

  const stats = useMemo(() => {
    let baseDevCost = 120000;
    const hourlyLabor = 65;
    let hoursSavedPerEmployeeMo = 14;

    if (modelType === 'crypto-exchange') {
      baseDevCost = infraTier === 'cloud' ? 180000 : infraTier === 'hybrid' ? 320000 : 580000;
      hoursSavedPerEmployeeMo = 8;
    } else if (modelType === 'workflow-automation') {
      baseDevCost = infraTier === 'cloud' ? 85000 : infraTier === 'hybrid' ? 160000 : 290000;
      hoursSavedPerEmployeeMo = 22;
    } else {
      // enterprise-ai
      baseDevCost = infraTier === 'cloud' ? 95000 : infraTier === 'hybrid' ? 220000 : 450000;
      hoursSavedPerEmployeeMo = 18;
    }

    const monthlyCompute = (volumeLevel * 1000 * 0.0004) + (infraTier === 'self-hosted' ? 4500 : 1200);
    const annualCompute = monthlyCompute * 12;
    const monthlyLaborSavings = teamSize * hoursSavedPerEmployeeMo * hourlyLabor;
    const annualLaborSavings = monthlyLaborSavings * 12;

    const netAnnualBenefit = annualLaborSavings - annualCompute;
    const paybackMonths = Math.max(1.8, Number((baseDevCost / (monthlyLaborSavings - monthlyCompute)).toFixed(1)));
    const threeYearRoi = Math.max(110, Math.round(((netAnnualBenefit * 3 - baseDevCost) / baseDevCost) * 100));

    return {
      upfrontCapex: baseDevCost,
      monthlyOpex: Math.round(monthlyCompute),
      annualSavings: Math.round(annualLaborSavings),
      netAnnualBenefit: Math.round(netAnnualBenefit),
      paybackMonths: isNaN(paybackMonths) || paybackMonths < 0 ? 4.2 : paybackMonths,
      threeYearRoi,
    };
  }, [modelType, teamSize, infraTier, volumeLevel]);

  return (
    <section id="roi-calculator" className="b2b-widget-wrapper">
      <div className="roi-calculator-card">
        <div className="widget-header">
          <div className="widget-badge">
            <Calculator size={15} />
            <span>INTERACTIVE FINANCIAL MODEL</span>
          </div>
          <h3 className="widget-title">Enterprise Cost & ROI Payback Estimator</h3>
          <p className="widget-desc">
            Estimate initial capital expenditure (CapEx), recurring compute operations (OpEx), and workforce efficiency gains.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="calc-type-selector">
          <button 
            type="button"
            className={`calc-type-btn ${modelType === 'enterprise-ai' ? 'active' : ''}`}
            onClick={() => setModelType('enterprise-ai')}
          >
            Enterprise AI & LLM Systems
          </button>
          <button 
            type="button"
            className={`calc-type-btn ${modelType === 'crypto-exchange' ? 'active' : ''}`}
            onClick={() => setModelType('crypto-exchange')}
          >
            Crypto Exchange / FinTech
          </button>
          <button 
            type="button"
            className={`calc-type-btn ${modelType === 'workflow-automation' ? 'active' : ''}`}
            onClick={() => setModelType('workflow-automation')}
          >
            Autonomous Agents & RPA
          </button>
        </div>

        <div className="calc-grid">
          {/* Controls column */}
          <div className="calc-controls">
            <div className="control-group">
              <div className="control-label-wrap">
                <label htmlFor="team-size-slider">Impacted Team Size (FTEs)</label>
                <span className="control-val">{teamSize} Employees</span>
              </div>
              <input 
                id="team-size-slider"
                type="range" 
                min={10} 
                max={500} 
                step={10} 
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="b2b-slider"
              />
            </div>

            <div className="control-group">
              <div className="control-label-wrap">
                <label htmlFor="infra-tier-select">Architecture & Hosting Posture</label>
              </div>
              <div className="radio-pill-group" id="infra-tier-select">
                <button 
                  type="button"
                  className={`radio-pill ${infraTier === 'cloud' ? 'active' : ''}`}
                  onClick={() => setInfraTier('cloud')}
                >
                  Pure Cloud / Managed API
                </button>
                <button 
                  type="button"
                  className={`radio-pill ${infraTier === 'hybrid' ? 'active' : ''}`}
                  onClick={() => setInfraTier('hybrid')}
                >
                  Hybrid RAG & VPC
                </button>
                <button 
                  type="button"
                  className={`radio-pill ${infraTier === 'self-hosted' ? 'active' : ''}`}
                  onClick={() => setInfraTier('self-hosted')}
                >
                  Air-Gapped / On-Prem
                </button>
              </div>
            </div>

            <div className="control-group">
              <div className="control-label-wrap">
                <label htmlFor="volume-slider">Monthly Execution Load</label>
                <span className="control-val">{(volumeLevel * 1000).toLocaleString()} Ops / mo</span>
              </div>
              <input 
                id="volume-slider"
                type="range" 
                min={50} 
                max={2000} 
                step={50} 
                value={volumeLevel}
                onChange={(e) => setVolumeLevel(Number(e.target.value))}
                className="b2b-slider"
              />
            </div>
          </div>

          {/* Results column */}
          <div className="calc-results-panel">
            <div className="results-highlight">
              <span className="results-label">ESTIMATED 3-YEAR NET ROI</span>
              <div className="results-huge-value">+{stats.threeYearRoi}%</div>
              <span className="results-subtext">Payback reached in ~{stats.paybackMonths} months</span>
            </div>

            <div className="results-breakdown-grid">
              <div className="result-metric">
                <span className="r-label">Initial Dev & Integration CapEx</span>
                <span className="r-value">${(stats.upfrontCapex / 1000).toFixed(0)}k</span>
              </div>

              <div className="result-metric">
                <span className="r-label">Monthly Cloud / Compute OpEx</span>
                <span className="r-value">${stats.monthlyOpex.toLocaleString()}/mo</span>
              </div>

              <div className="result-metric">
                <span className="r-label">Annualized Workforce Savings</span>
                <span className="r-value font-emerald">+${(stats.annualSavings / 1000).toFixed(0)}k/yr</span>
              </div>

              <div className="result-metric">
                <span className="r-label">Net Year-1 Value Creation</span>
                <span className="r-value font-emerald">+${((stats.netAnnualBenefit - stats.upfrontCapex) / 1000).toFixed(0)}k</span>
              </div>
            </div>
          </div>
        </div>

        <div className="calc-footnote">
          <span>💡 Analyst Note:</span> Figures modeled on industry benchmark standard developer rates ($120k/yr base + overhead) and current hyperscaler inference token pricing (2026 indices).
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 2. COMPARISON MATRIX WIDGET
// ==========================================
export const ComparisonMatrixWidget = ({ matrix }: { matrix: ComparisonMatrix }) => {
  return (
    <section id="comparison-matrix" className="b2b-widget-wrapper">
      <div className="comparison-matrix-card">
        <div className="widget-header">
          <div className="widget-badge">
            <Layers size={15} />
            <span>DECISION MATRIX</span>
          </div>
          <h3 className="widget-title">{matrix.title}</h3>
          <p className="widget-desc">
            Direct executive evaluation between {matrix.optionAName} versus {matrix.optionBName}.
          </p>
        </div>

        <div className="matrix-table-container">
          <table className="matrix-table">
            <thead>
              <tr>
                <th className="th-criteria">Evaluation Criteria</th>
                <th className="th-option option-a">{matrix.optionAName}</th>
                <th className="th-option option-b">{matrix.optionBName}</th>
                <th className="th-winner">Executive Advantage</th>
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row, idx) => (
                <tr key={idx} className="matrix-row">
                  <td className="td-criteria">
                    <div className="criteria-text">{row.criteria}</div>
                    {row.notes && <div className="criteria-notes">{row.notes}</div>}
                  </td>
                  <td className={`td-option ${row.winner === 'A' ? 'winner-cell' : ''}`}>
                    {row.optionA}
                  </td>
                  <td className={`td-option ${row.winner === 'B' ? 'winner-cell' : ''}`}>
                    {row.optionB}
                  </td>
                  <td className="td-winner">
                    {row.winner === 'A' ? (
                      <span className="winner-pill winner-a">
                        <CheckCircle2 size={13} /> {matrix.optionAName}
                      </span>
                    ) : row.winner === 'B' ? (
                      <span className="winner-pill winner-b">
                        <CheckCircle2 size={13} /> {matrix.optionBName}
                      </span>
                    ) : (
                      <span className="winner-pill winner-tied">
                        <HelpCircle size={13} /> Parity / Context-Dependent
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 3. IMPLEMENTATION ROADMAP WIDGET
// ==========================================
export const ImplementationRoadmapWidget = ({ phases }: { phases: ImplementationPhase[] }) => {
  return (
    <section id="implementation-roadmap" className="b2b-widget-wrapper">
      <div className="roadmap-card">
        <div className="widget-header">
          <div className="widget-badge">
            <Clock size={15} />
            <span>EXECUTION PLAYBOOK</span>
          </div>
          <h3 className="widget-title">Phased Implementation & Delivery Milestones</h3>
          <p className="widget-desc">
            Recommended timeline from proof-of-concept verification to hardened enterprise production.
          </p>
        </div>

        <div className="roadmap-timeline">
          {phases.map((item, idx) => (
            <div key={idx} className="roadmap-step">
              <div className="step-marker">
                <span className="step-number">{idx + 1}</span>
                <span className="step-phase">{item.phase}</span>
                <span className="step-timeline">{item.timeline}</span>
              </div>

              <div className="step-content">
                <h4 className="step-title">{item.title}</h4>
                <ul className="step-actions-list">
                  {item.keyActions.map((action, aIdx) => (
                    <li key={aIdx} className="step-action-item">
                      <ChevronRight size={14} className="action-bullet" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>

                <div className="step-deliverable">
                  <span className="deliverable-label">Key Gate Deliverable:</span>
                  <span className="deliverable-val">{item.deliverable}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 4. EXPERT INTERVIEW / Q&A CALLOUT
// ==========================================
export const ExpertInterviewCallout = ({ interview }: { interview: ExpertInterview }) => {
  return (
    <section id="expert-interview" className="b2b-widget-wrapper">
      <div className="expert-interview-box">
        <div className="expert-header">
          <div className="expert-avatar-wrap">
            <img 
              src={interview.expertAvatar} 
              alt={interview.expertName}
              className="expert-avatar"
              loading="lazy"
            />
            <div className="expert-badge-verified">
              <UserCheck size={12} />
            </div>
          </div>
          <div className="expert-meta">
            <div className="expert-name">{interview.expertName}</div>
            <div className="expert-role">{interview.expertRole}</div>
            <div className="expert-credentials">{interview.expertCredentials}</div>
          </div>
          <span className="interview-tag">VERIFIED INDUSTRY PRACTITIONER</span>
        </div>

        <div className="interview-body">
          <div className="interview-question">
            <span className="q-label">EXECUTIVE INQUIRY:</span>
            <p className="q-text">"{interview.question}"</p>
          </div>

          <div className="interview-answer">
            <span className="a-label">ARCHITECTURAL DIRECTIVE:</span>
            <p className="a-text">{interview.insight}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 5. COMPOSITE B2B WIDGETS CONTAINER
// ==========================================
export const B2BInteractiveWidgets = ({ post }: { post: Post }) => {
  const roadmap = post.roadmapPhases || post.implementationRoadmap;
  const hasWidgets = Boolean(
    post.roiCalculator || 
    post.comparisonMatrix || 
    (roadmap && roadmap.length > 0) || 
    post.expertInterview
  );

  if (!hasWidgets) return null;

  return (
    <div className="b2b-widgets-container">
      {post.roiCalculator?.enabled && (
        <RoiCalculatorWidget defaultType={post.roiCalculator.defaultModelType} />
      )}

      {post.comparisonMatrix && (
        <ComparisonMatrixWidget matrix={post.comparisonMatrix} />
      )}

      {roadmap && roadmap.length > 0 && (
        <ImplementationRoadmapWidget phases={roadmap} />
      )}

      {post.expertInterview && (
        <ExpertInterviewCallout interview={post.expertInterview} />
      )}
    </div>
  );
};
