import glossaryData from '../content/glossary.json';

export interface GlossaryTerm {
  id: string;
  term: string;
  shortDefinition: string;
  definition: string;
  links?: Array<{ text: string; href: string }>;
  category: string;
}

export const glossary = new Map<string, GlossaryTerm>(
  glossaryData.terms.map((term) => [term.id, term])
);

/**
 * Parses text containing {{termId}} syntax and returns HTML with technical term markup
 * @param text - The input text with {{termId}} placeholders
 * @returns HTML string with <span class="tech-term"> elements
 */
export function parseTerms(text: string): string {
  // Match {{termId}} pattern
  const termPattern = /\{\{([a-z0-9-]+)\}\}/g;

  return text.replace(termPattern, (match, termId) => {
    const term = glossary.get(termId);

    if (!term) {
      console.warn(`Unknown term ID: ${termId}`);
      // Return the text without the brackets if term not found
      return termId;
    }

    // Return a span with data attributes for the tooltip
    return `<span class="tech-term" data-term-id="${termId}" data-term-name="${escapeHtml(term.term)}">${escapeHtml(term.term)}</span>`;
  });
}

/**
 * Helper to escape HTML entities
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Get term details by ID
 */
export function getTerm(termId: string): GlossaryTerm | undefined {
  return glossary.get(termId);
}
