import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsJsonPath = path.resolve(__dirname, '../src/data/posts.json');
const b2bPostsPath = path.resolve(__dirname, '../src/data/b2bAnalystPosts.ts');
const llmsPath = path.resolve(__dirname, '../public/llms.txt');
const llmsFullPath = path.resolve(__dirname, '../public/llms-full.txt');
const baseUrl = 'https://xavi-003.github.io/blog';

function parseB2BPosts(fileContent) {
  const posts = [];
  const blocks = fileContent.split(/id:\s*["']b2b-post-/);
  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i];
    const slug = (b.match(/slug:\s*["']([^"']+)["']/) || [])[1];
    const title = (b.match(/title:\s*["']([^"']+)["']/) || [])[1];
    const subtitle = (b.match(/subtitle:\s*["']([^"']+)["']/) || [])[1];
    const date = (b.match(/date:\s*["']([^"']+)["']/) || [])[1] || '2026-08-20';
    const category = (b.match(/category:\s*["']([^"']+)["']/) || [])[1] || 'Enterprise AI';
    if (slug && title) {
      posts.push({ slug, title, subtitle: subtitle || '', date, category });
    }
  }
  return posts;
}

// 1. Read automated raw posts from posts.json
let posts = [];
if (fs.existsSync(postsJsonPath)) {
  try {
    posts = JSON.parse(fs.readFileSync(postsJsonPath, 'utf8'));
  } catch (e) {
    console.error('Error parsing posts.json:', e);
  }
}

// 2. Extract flagship posts from b2bAnalystPosts.ts
let b2bPosts = [];
if (fs.existsSync(b2bPostsPath)) {
  try {
    const content = fs.readFileSync(b2bPostsPath, 'utf8');
    b2bPosts = parseB2BPosts(content);
  } catch (e) {
    console.warn('Could not parse b2bAnalystPosts:', e);
  }
}

// Combine with deduplication
const seenSlugs = new Set();
const allPosts = [];

for (const post of b2bPosts) {
  if (post.slug && !seenSlugs.has(post.slug)) {
    seenSlugs.add(post.slug);
    allPosts.push(post);
  }
}

for (const post of posts) {
  if (post.slug && !seenSlugs.has(post.slug)) {
    seenSlugs.add(post.slug);
    allPosts.push(post);
  }
}

// Generate standard llms.txt
let llmsTxt = `# AI Insights Pro — Executive B2B Tech Intelligence Briefings

> High-impact, decision-grade technical intelligence reports for CTOs, CFOs, Enterprise Architects, and Technology Leaders. Covers enterprise AI integration costs, cloud infrastructure, white-label crypto architectures, cybersecurity threats, and AEO optimization benchmarks.

## Executive Briefings Index

`;

allPosts.forEach(post => {
  const url = `${baseUrl}/blog/${post.slug}`;
  const desc = post.subtitle || (post.content ? post.content.replace(/[#*`_]/g, '').slice(0, 150) + '...' : 'Executive technical intelligence analysis.');
  llmsTxt += `- [${post.title}](${url}): ${desc.replace(/\n+/g, ' ').trim()}\n`;
});

llmsTxt += `
## Full LLM Ingestion Dump
- [llms-full.txt](${baseUrl}/llms-full.txt): Complete concatenated full-text markdown corpus of all technical intelligence reports for AI/RAG context pipelines.

## Author & Lead Analyst Credentials
- [Antony Xavier — Lead Tech & Systems Analyst](${baseUrl}/portfolio/): B2B Software Architect & Intelligence Strategist. Specializing in AI ROI modeling, enterprise cloud security, and decision-grade technical intelligence.
- [LinkedIn Profile](https://www.linkedin.com/in/antony-xavier-4b5019333)
- [GitHub Repository](https://github.com/Xavi-003)
`;

// Generate llms-full.txt with complete text
let llmsFullTxt = `# AI Insights Pro — Complete Intelligence Briefings Dump
Generated: ${new Date().toISOString()}
Base URL: ${baseUrl}

`;

allPosts.forEach(post => {
  const url = `${baseUrl}/blog/${post.slug}`;
  llmsFullTxt += `\n---\n\n# ${post.title}\n`;
  llmsFullTxt += `**URL:** ${url}\n`;
  llmsFullTxt += `**Date:** ${post.date || '2026-08-20'}\n`;
  if (post.subtitle) llmsFullTxt += `**Subtitle:** ${post.subtitle}\n`;
  if (post.category) llmsFullTxt += `**Category:** ${post.category}\n`;
  llmsFullTxt += `**Author:** Antony Xavier (Lead Tech & Systems Analyst)\n\n`;
  if (post.content) {
    llmsFullTxt += `${post.content}\n\n`;
  } else {
    llmsFullTxt += `*Full analysis and interactive models available at ${url}*\n\n`;
  }
});

fs.writeFileSync(llmsPath, llmsTxt, 'utf8');
fs.writeFileSync(llmsFullPath, llmsFullTxt, 'utf8');

console.log(`✅ Generated llms.txt (${allPosts.length} entries) and llms-full.txt successfully.`);
