import { useState, useEffect, useMemo, useCallback } from 'react';
import { List, CheckCircle2, ChevronRight } from 'lucide-react';
import { slugifyText } from '../tocUtils';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  hasExecutiveSummary?: boolean;
  hasRoiCalculator?: boolean;
  hasComparisonMatrix?: boolean;
  hasRoadmap?: boolean;
  hasExpertInterview?: boolean;
  hasFaqs?: boolean;
}

export const TableOfContents = ({
  content,
  hasExecutiveSummary = true,
  hasRoiCalculator = false,
  hasComparisonMatrix = false,
  hasRoadmap = false,
  hasExpertInterview = false,
  hasFaqs = false,
}: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>('executive-summary');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const headings = useMemo(() => {
    const items: TocItem[] = [];
    const usedIds = new Set<string>();

    if (hasExecutiveSummary) {
      items.push({ id: 'executive-summary', text: 'Executive Summary & Key Takeaways', level: 2 });
      usedIds.add('executive-summary');
    }

    // Extract headers from markdown (##, ###, ####)
    const headingRegex = /^(#{2,4})\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const rawText = match[2].trim();
      const cleanText = rawText.replace(/\*\*/g, '').replace(/`/g, '');
      const baseId = slugifyText(cleanText);

      if (!baseId) continue;

      // Handle duplicate heading ids
      let id = baseId;
      if (usedIds.has(id)) {
        if (id === 'executive-summary') {
          // If markdown also has an "Executive Summary" heading, skip duplicate TOC entry
          continue;
        }
        let counter = 2;
        while (usedIds.has(`${baseId}-${counter}`)) {
          counter++;
        }
        id = `${baseId}-${counter}`;
      }

      usedIds.add(id);
      items.push({ id, text: cleanText, level });
    }

    if (hasRoiCalculator && !usedIds.has('roi-calculator')) {
      items.push({ id: 'roi-calculator', text: 'Interactive ROI & Cost Estimator', level: 2 });
      usedIds.add('roi-calculator');
    }
    if (hasComparisonMatrix && !usedIds.has('comparison-matrix')) {
      items.push({ id: 'comparison-matrix', text: 'Decision Matrix & Benchmark', level: 2 });
      usedIds.add('comparison-matrix');
    }
    if (hasRoadmap && !usedIds.has('implementation-roadmap')) {
      items.push({ id: 'implementation-roadmap', text: 'Implementation Timeline & Milestones', level: 2 });
      usedIds.add('implementation-roadmap');
    }
    if (hasExpertInterview && !usedIds.has('expert-interview')) {
      items.push({ id: 'expert-interview', text: 'Expert Q&A & Technical Analysis', level: 2 });
      usedIds.add('expert-interview');
    }
    if (hasFaqs && !usedIds.has('faqs-section')) {
      items.push({ id: 'faqs-section', text: 'Executive FAQs & Decision Directives', level: 2 });
      usedIds.add('faqs-section');
    }

    if (!usedIds.has('source-intelligence')) {
      items.push({ id: 'source-intelligence', text: 'Primary Intelligence & Verification', level: 2 });
    }

    return items;
  }, [content, hasExecutiveSummary, hasRoiCalculator, hasComparisonMatrix, hasRoadmap, hasExpertInterview, hasFaqs]);

  // Handle active heading tracking on scroll
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const headingElements = headings
            .map(h => {
              const el = document.getElementById(h.id);
              return el ? { id: h.id, element: el } : null;
            })
            .filter(Boolean) as { id: string; element: HTMLElement }[];

          if (headingElements.length === 0) {
            ticking = false;
            return;
          }

          // Top of page
          if (window.scrollY < 120) {
            setActiveId(headingElements[0].id);
            ticking = false;
            return;
          }

          // Bottom of page
          const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 70;
          if (isAtBottom) {
            setActiveId(headingElements[headingElements.length - 1].id);
            ticking = false;
            return;
          }

          const triggerOffset = 140; // Pixels from viewport top
          let currentActiveId = headingElements[0].id;

          for (let i = 0; i < headingElements.length; i++) {
            const rect = headingElements[i].element.getBoundingClientRect();
            if (rect.top <= triggerOffset) {
              currentActiveId = headingElements[i].id;
            } else {
              break;
            }
          }

          setActiveId(currentActiveId);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setTimeout(handleScroll, 120);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [headings]);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
      setActiveId(id);
      setIsOpenMobile(false);
    }
  }, []);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile Drawer Trigger */}
      <div className="toc-mobile-bar">
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="toc-mobile-toggle"
        >
          <List size={16} />
          <span>Table of Contents ({headings.length} Sections)</span>
          <ChevronRight size={16} className={`transform transition-transform ${isOpenMobile ? 'rotate-90' : ''}`} />
        </button>
      </div>

      <nav className={`toc-container ${isOpenMobile ? 'mobile-open' : ''}`} aria-label="Executive Table of Contents">
        <div className="toc-header">
          <div className="toc-title">
            <List size={16} className="toc-icon" />
            <span>EXECUTIVE BRIEFING TOC</span>
          </div>
          <span className="toc-badge">Interactive</span>
        </div>

        <ul className="toc-list">
          {headings.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li
                key={item.id}
                className={`toc-item level-${item.level} ${isActive ? 'active' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => scrollToHeading(item.id)}
                  className="toc-link"
                >
                  <span className="toc-indicator">
                    {isActive ? <CheckCircle2 size={13} className="text-primary" /> : <span className="toc-dot" />}
                  </span>
                  <span className="toc-text">{item.text}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="toc-footer-tip">
          <div className="toc-skim-pill">⚡ 3-Minute Skim Enabled</div>
          <p>Click any section to jump directly to data benchmarks, costs, or FAQs.</p>
        </div>
      </nav>
    </>
  );
};
