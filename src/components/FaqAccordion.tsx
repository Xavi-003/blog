import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Copy, 
  Check, 
  Sparkles, 
  Search,
  MessageSquare
} from 'lucide-react';
import type { FaqItem } from '../types';

interface FaqAccordionProps {
  faqs?: FaqItem[];
  title?: string;
  postTitle?: string;
}

export const FaqAccordion = ({ 
  faqs = [], 
  title,
  postTitle
}: FaqAccordionProps) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]); // First open by default
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const displayTitle = title || (postTitle ? `Executive Briefing FAQs: ${postTitle}` : 'Executive Decision Directives & AEO FAQs');

  if (!faqs || faqs.length === 0) return null;

  const toggleIndex = (index: number) => {
    setOpenIndexes(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleCopyFaq = (faq: FaqItem, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Q: ${faq.question}\n\nA: ${faq.answer}\n\n(Source: AI Insights Pro Briefing)`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="faqs-section" className="b2b-widget-wrapper">
      <div className="faq-card">
        <div className="widget-header">
          <div className="widget-badge">
            <Sparkles size={14} />
            <span>ANSWER ENGINE OPTIMIZED (AEO)</span>
          </div>
          <h3 className="widget-title">{displayTitle}</h3>
          <p className="widget-desc">
            Direct, factual answers structured for executive rapid-briefings and AI search engine citation (Perplexity, ChatGPT, Gemini).
          </p>

          {faqs.length > 3 && (
            <div className="faq-search-wrap">
              <Search size={15} className="faq-search-icon" />
              <input
                type="text"
                placeholder="Search executive questions & answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="faq-search-input"
              />
            </div>
          )}
        </div>

        <div className="faq-list">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndexes.includes(index);
            const isCopied = copiedIndex === index;

            return (
              <div 
                key={index} 
                className={`faq-item ${isOpen ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleIndex(index)}
                  aria-expanded={isOpen}
                >
                  <div className="faq-q-left">
                    <span className="faq-q-badge">Q{index + 1}</span>
                    <span className="faq-q-text">{faq.question}</span>
                  </div>

                  <div className="faq-q-right">
                    <button
                      type="button"
                      onClick={(e) => handleCopyFaq(faq, index, e)}
                      className="faq-copy-btn"
                      title="Copy Q&A snippet"
                    >
                      {isCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                    <ChevronDown size={18} className={`faq-chevron ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="faq-answer-container"
                    >
                      <div className="faq-answer-content">
                        <p className="faq-a-text">{faq.answer}</p>
                        {faq.targetRole && (
                          <div className="faq-target-role">
                            <span>Relevant for: </span>
                            <strong>{faq.targetRole}</strong>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="faq-empty">
              <MessageSquare size={24} />
              <p>No questions matched your search query.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
