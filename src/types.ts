export type ExecutiveRole = 'ALL' | 'CTO' | 'CFO' | 'Founders' | 'Security' | string;
export type ThreatLevel = 'High' | 'Medium' | 'Low' | 'Opportunity';

export interface AuthorInfo {
  name: string;
  role: string;
  affiliation: string;
  avatar: string;
  credentials?: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
  isOfficial?: boolean;
  isVerified?: boolean;
}

export interface ExecutiveTakeaway {
  tag: 'STRATEGY' | 'FINANCIAL' | 'RISK' | 'TECH' | 'TIMELINE' | 'ROI';
  label: string;
  text: string;
}

export interface KeyMetric {
  label: string;
  value: string;
  subtext: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface FaqItem {
  question: string;
  answer: string;
  targetRole?: string;
}

export interface ComparisonMatrix {
  title: string;
  optionAName: string;
  optionBName: string;
  rows: {
    criteria: string;
    optionA: string;
    optionB: string;
    winner?: 'A' | 'B' | 'TIED';
    notes?: string;
  }[];
}

export interface ImplementationPhase {
  phase: string;
  timeline: string;
  title: string;
  keyActions: string[];
  deliverable: string;
}

export interface ExpertInterview {
  expertName: string;
  expertRole: string;
  expertAvatar: string;
  expertCredentials: string;
  question: string;
  insight: string;
}

export interface RoiCalculatorConfig {
  enabled: boolean;
  defaultModelType?: 'enterprise-ai' | 'crypto-exchange' | 'workflow-automation';
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  date: string;
  original_link: string;
  image: string | null;
  category: string;
  industry?: string;
  targetRole?: string[]; // e.g. ["CTO", "CFO", "Founders", "Security"]
  source: string;
  reading_time: string;
  color: string;
  author?: AuthorInfo;
  executiveTakeaways?: ExecutiveTakeaway[];
  keyMetrics?: KeyMetric[];
  faqs?: FaqItem[];
  comparisonMatrix?: ComparisonMatrix;
  implementationRoadmap?: ImplementationPhase[];
  roadmapPhases?: ImplementationPhase[];
  roiCalculator?: RoiCalculatorConfig;
  expertInterview?: ExpertInterview;
  threatLevel?: ThreatLevel;
  roiPotential?: string;
  style?: string;
  format?: string;
}
