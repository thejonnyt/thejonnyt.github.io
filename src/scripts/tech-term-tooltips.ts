type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  links?: { href: string; text: string }[];
};

type GlossaryData = {
  terms: GlossaryTerm[];
};

let glossaryCache: Map<string, GlossaryTerm> | null = null;
let tooltipEl: HTMLElement | null = null;
let currentTerm: string | null = null;
let hideTimeout: number | null = null;

function getGlossary(): Map<string, GlossaryTerm> {
  if (glossaryCache) return glossaryCache;
  const tooltip = document.getElementById('tech-term-tooltip') as HTMLElement | null;
  const glossaryJson = tooltip?.dataset.glossary || '{"terms": []}';
  const parsed = JSON.parse(glossaryJson) as GlossaryData;
  glossaryCache = new Map(parsed.terms.map((term) => [term.id, term]));
  return glossaryCache;
}

function positionTooltip(targetElement: Element): void {
  if (!tooltipEl) return;

  const targetRect = (targetElement as HTMLElement).getBoundingClientRect();
  const tooltipRect = tooltipEl.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Default: position below the term
  let top = targetRect.bottom + window.scrollY + 8;
  let left = targetRect.left + window.scrollX + targetRect.width / 2;

  // Check if tooltip would overflow viewport
  const wouldOverflowRight = left + tooltipRect.width / 2 > viewportWidth - 20;
  const wouldOverflowLeft = left - tooltipRect.width / 2 < 20;
  const wouldOverflowBottom =
    targetRect.bottom + tooltipRect.height + 8 > viewportHeight - 20;

  // Adjust horizontal position
  if (wouldOverflowRight) {
    left = viewportWidth - tooltipRect.width - 20;
  } else if (wouldOverflowLeft) {
    left = 20;
  } else {
    left = left - tooltipRect.width / 2;
  }

  // Position above if would overflow bottom
  if (wouldOverflowBottom) {
    top = targetRect.top + window.scrollY - tooltipRect.height - 8;
    tooltipEl.classList.add('tooltip-above');
  } else {
    tooltipEl.classList.remove('tooltip-above');
  }

  tooltipEl.style.top = `${top}px`;
  tooltipEl.style.left = `${left}px`;

  // Position arrow to point at the term
  const arrow = tooltipEl.querySelector('.tooltip-arrow') as HTMLElement | null;
  if (arrow) {
    const arrowLeft = targetRect.left + targetRect.width / 2 - left;
    arrow.style.left = `${arrowLeft}px`;
  }
}

function hideTooltip(): void {
  if (!tooltipEl) return;
  tooltipEl.classList.remove('visible');
  tooltipEl.setAttribute('aria-hidden', 'true');
  currentTerm = null;
}

function scheduleHide(): void {
  if (hideTimeout) {
    window.clearTimeout(hideTimeout);
  }
  hideTimeout = window.setTimeout(() => {
    hideTooltip();
  }, 200);
}

function showTooltip(termId: string, targetElement: Element): void {
  if (!tooltipEl) return;

  const glossary = getGlossary();
  const term = glossary.get(termId);
  if (!term) return;

  if (hideTimeout) {
    window.clearTimeout(hideTimeout);
  }

  currentTerm = termId;

  const title = tooltipEl.querySelector('.tooltip-title') as HTMLElement | null;
  const definition = tooltipEl.querySelector('.tooltip-definition') as HTMLElement | null;
  const linksContainer = tooltipEl.querySelector('.tooltip-links') as HTMLElement | null;

  if (title) title.textContent = term.term;
  if (definition) definition.textContent = term.definition;

  if (linksContainer) {
    if (term.links && term.links.length > 0) {
      linksContainer.innerHTML = term.links
        .map(
          (link) =>
            `<a href="${link.href}" target="_blank" rel="noopener noreferrer">${link.text} →</a>`
        )
        .join('');
      linksContainer.style.display = 'block';
    } else {
      linksContainer.innerHTML = '';
      linksContainer.style.display = 'none';
    }
  }

  positionTooltip(targetElement);
  tooltipEl.classList.add('visible');
  tooltipEl.setAttribute('aria-hidden', 'false');
}

function bindTooltipEvents(): void {
  if (!tooltipEl) return;

  const terms = document.querySelectorAll('.tech-term');

  terms.forEach((termElement) => {
    const el = termElement as HTMLElement;
    if (el.dataset.tooltipBound === 'true') return;
    el.dataset.tooltipBound = 'true';

    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '0');
    }

    const showHandler = (event: Event) => {
      const target = event.currentTarget as HTMLElement | null;
      if (!target) return;
      const termId = target.dataset.termId || '';
      if (!termId) return;
      showTooltip(termId, target);
    };

    const hideHandler = () => {
      scheduleHide();
    };

    el.addEventListener('mouseenter', showHandler);
    el.addEventListener('focusin', showHandler);
    el.addEventListener('mouseleave', hideHandler);
    el.addEventListener('focusout', hideHandler);
  });

  const cancelHide = () => {
    if (hideTimeout) {
      window.clearTimeout(hideTimeout);
    }
  };

  tooltipEl.addEventListener('mouseenter', cancelHide);
  tooltipEl.addEventListener('focusin', cancelHide);
  tooltipEl.addEventListener('mouseleave', scheduleHide);
  tooltipEl.addEventListener('focusout', scheduleHide);
}

function initTechTermTooltips(): void {
  tooltipEl = document.getElementById('tech-term-tooltip') as HTMLElement | null;
  if (!tooltipEl) return;
  getGlossary();
  bindTooltipEvents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTechTermTooltips, { once: true });
} else {
  initTechTermTooltips();
}

document.addEventListener('astro:after-swap', initTechTermTooltips);
