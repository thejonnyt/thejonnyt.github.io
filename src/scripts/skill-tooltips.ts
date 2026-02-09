export {};

function positionTooltip(tag: Element): void {
  const tooltip = tag.querySelector('.skill-tooltip') as HTMLElement | null;
  if (!tooltip) return;

  // Reset classes for re-calculation
  tooltip.classList.remove('tooltip-above', 'tooltip-left', 'tooltip-right');

  const tagRect = (tag as HTMLElement).getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 16; // 1rem

  // Vertical check: If tooltip would go below the viewport, move it above
  if (tagRect.bottom + tooltipRect.height + margin > viewportHeight) {
    tooltip.classList.add('tooltip-above');
  }

  // Horizontal check
  const centeredLeft = tagRect.left + tagRect.width / 2 - tooltipRect.width / 2;

  if (centeredLeft < margin) {
    // If it overflows the left edge, align it to the left
    tooltip.classList.add('tooltip-left');
  } else if (centeredLeft + tooltipRect.width + margin > viewportWidth) {
    // If it overflows the right edge, align it to the right
    tooltip.classList.add('tooltip-right');
  }
}

function initSkillTooltips(): void {
  const skillTags = document.querySelectorAll('.skill-tag[data-has-meta="true"]');
  skillTags.forEach(tag => {
    // Use 'pointerenter' for better compatibility with various devices
    tag.addEventListener('pointerenter', () => positionTooltip(tag));
    tag.addEventListener('focusin', () => positionTooltip(tag));
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSkillTooltips, { once: true });
} else {
  initSkillTooltips();
}

document.addEventListener('astro:after-swap', initSkillTooltips);
