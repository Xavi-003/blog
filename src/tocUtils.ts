/**
 * Strips markdown and special characters to extract raw text from React nodes or strings
 */
export function extractNodeText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractNodeText).join('');
  if (typeof node === 'object' && node.props && node.props.children) {
    return extractNodeText(node.props.children);
  }
  return '';
}

/**
 * Standardized slugify for markdown headings & Table of Contents matching
 */
export function slugifyText(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\*\*/g, '')
    .replace(/[`_#]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
