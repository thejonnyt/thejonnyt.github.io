type ExperienceEntry = {
  startDate?: string;
  endDate?: string;
  current?: boolean;
};

type ExperienceToggleLabels = {
  moreSingular: string;
  morePlural: string;
  less: string;
  moreFallback: string;
};

const DEFAULT_LABELS: ExperienceToggleLabels = {
  moreSingular: 'Show {count} more year of experience',
  morePlural: 'Show {count} more years of experience',
  less: 'Show less experience',
  moreFallback: 'Show more experience'
};

function getExperienceLabels(section: HTMLElement): ExperienceToggleLabels {
  return {
    moreSingular: section.dataset.toggleMoreSingular || DEFAULT_LABELS.moreSingular,
    morePlural: section.dataset.toggleMorePlural || DEFAULT_LABELS.morePlural,
    less: section.dataset.toggleLess || DEFAULT_LABELS.less,
    moreFallback: section.dataset.toggleMoreFallback || DEFAULT_LABELS.moreFallback
  };
}

function formatLabel(template: string, count: number): string {
  return template.replace('{count}', `${count}`);
}

function parseExperienceData(section: HTMLElement): ExperienceEntry[] {
  const experienceJson = section.getAttribute('data-experience') || '[]';
  try {
    const parsed = JSON.parse(experienceJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function calculateHiddenExperienceYears(
  hiddenExperiences: NodeListOf<Element>,
  experienceData: ExperienceEntry[]
): number {
  let totalYears = 0;

  hiddenExperiences.forEach((exp) => {
    const index = parseInt(exp.getAttribute('data-experience-index') || '0', 10);
    const expData = experienceData[index];
    if (!expData?.startDate) return;

    const startDate = new Date(expData.startDate);
    const endDate = expData.current || expData.endDate === 'present'
      ? new Date()
      : new Date(expData.endDate || expData.startDate);

    const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    totalYears += years;
  });

  return totalYears;
}

function updateToggleText(
  toggleText: Element | null,
  labels: ExperienceToggleLabels,
  roundedYears: number
): void {
  if (!toggleText) return;

  if (roundedYears > 0) {
    const template = roundedYears === 1 ? labels.moreSingular : labels.morePlural;
    toggleText.textContent = formatLabel(template, roundedYears);
    return;
  }

  toggleText.textContent = labels.moreFallback;
}

function initExperienceToggle(section: HTMLElement): void {
  if (section.dataset.experienceToggleInit === 'true') return;
  section.dataset.experienceToggleInit = 'true';

  const experienceData = parseExperienceData(section);
  const hiddenExperiences = section.querySelectorAll('.timeline-item[data-hidden="true"]');
  const totalYears = calculateHiddenExperienceYears(hiddenExperiences, experienceData);
  const roundedYears = Math.round(totalYears);

  const toggleButton = section.querySelector('#experience-toggle') as HTMLButtonElement | null;
  const toggleText = toggleButton?.querySelector('.toggle-text') || null;
  const chevron = toggleButton?.querySelector('.chevron') as HTMLElement | null;
  const labels = getExperienceLabels(section);

  updateToggleText(toggleText, labels, roundedYears);

  if (!toggleButton) return;

  toggleButton.addEventListener('click', () => {
    const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';

    hiddenExperiences.forEach((exp) => {
      const expEl = exp as HTMLElement;
      if (!isExpanded) {
        expEl.style.display = 'block';
        expEl.setAttribute('data-hidden', 'false');
      } else {
        expEl.style.display = 'none';
        expEl.setAttribute('data-hidden', 'true');
      }
    });

    if (!isExpanded) {
      toggleButton.setAttribute('aria-expanded', 'true');
      if (toggleText) toggleText.textContent = labels.less;
      if (chevron) chevron.style.transform = 'rotate(180deg)';
    } else {
      toggleButton.setAttribute('aria-expanded', 'false');
      updateToggleText(toggleText, labels, roundedYears);
      if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
  });
}

export function initExperienceToggles(): void {
  const sections = document.querySelectorAll('section[data-experience]');
  sections.forEach((section) => initExperienceToggle(section as HTMLElement));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExperienceToggles, { once: true });
} else {
  initExperienceToggles();
}

document.addEventListener('astro:after-swap', initExperienceToggles);
