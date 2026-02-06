type CvSource = {
  profile: any;
  experience: any;
  education: any;
  skillsDatabase: any;
  projects: any;
  publications: any;
  awards?: any;
  language?: string;
};

function buildSkillsSummary(skillsDatabase: any) {
  const proficiencyMap: Record<string, string> = {
    beginner: 'beginner',
    competent: 'intermediate',
    proficient: 'advanced',
    expert: 'expert',
    wizard: 'wizard'
  };

  const proficiencyOrder = ['wizard', 'expert', 'advanced', 'intermediate', 'beginner', 'unspecified'];

  function mapProficiency(level?: string) {
    if (!level) return 'unspecified';
    return proficiencyMap[level] || level;
  }

  const skills = skillsDatabase?.skills || {};
  const items = Object.entries(skills).map(([name, skill]: any) => {
    const years = typeof skill.yearsOfExperience === 'number' ? skill.yearsOfExperience : null;
    return {
      name,
      proficiency: mapProficiency(skill.level),
      yearsOfExperience: years
    };
  });

  items.sort((a, b) => {
    const orderDelta = proficiencyOrder.indexOf(a.proficiency) - proficiencyOrder.indexOf(b.proficiency);
    if (orderDelta !== 0) return orderDelta;
    if (a.yearsOfExperience !== b.yearsOfExperience) {
      return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
    }
    return a.name.localeCompare(b.name);
  });

  const byProficiency: Record<string, string[]> = {};
  items.forEach(skill => {
    if (!byProficiency[skill.proficiency]) {
      byProficiency[skill.proficiency] = [];
    }
    const yearsLabel = typeof skill.yearsOfExperience === 'number' ? skill.yearsOfExperience : '';
    const entry = yearsLabel === '' ? skill.name : `${skill.name}(${yearsLabel})`;
    byProficiency[skill.proficiency].push(entry);
  });

  const proficiencyOrderUsed = proficiencyOrder.filter(level => byProficiency[level]);
  const extraBuckets = Object.keys(byProficiency)
    .filter(level => !proficiencyOrder.includes(level))
    .sort((a, b) => a.localeCompare(b));

  const order = [...proficiencyOrderUsed, ...extraBuckets];
  const summary: Record<string, any> = {
    schema: 'Skills grouped by proficiency; each entry is "Skill(Years)" and omits years when unknown.',
    order,
    totalCount: items.length
  };

  order.forEach(level => {
    summary[level] = byProficiency[level];
  });

  return summary;
}

function buildMachineCv(source: CvSource) {
  const papers = (source.publications || []).map((paper: any) => ({
    title: paper.title,
    citations: typeof paper.citations === 'number' ? paper.citations : null
  }));

  return {
    profile: source.profile,
    experience: source.experience,
    education: source.education,
    projects: source.projects,
    papers,
    awards: source.awards || [],
    skills: buildSkillsSummary(source.skillsDatabase),
    meta: {
      version: '1.1',
      generatedAt: new Date().toISOString(),
      format: 'machine-readable-cv-json',
      language: source.language || 'en',
      description: 'Structured CV data optimized for automated processing tools'
    }
  };
}

let magneticToastTimeout: number | null = null;

function hideToast(): void {
  const toast = document.getElementById('magnetic-carousel-toast');
  if (!toast) return;

  if (magneticToastTimeout !== null) {
    clearTimeout(magneticToastTimeout);
    magneticToastTimeout = null;
  }

  toast.classList.remove('show');
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  const toast = document.getElementById('magnetic-carousel-toast');
  if (!toast) return;

  const messageEl = toast.querySelector('.toast-message') as HTMLElement | null;
  if (!messageEl) return;

  if (magneticToastTimeout !== null) {
    clearTimeout(magneticToastTimeout);
  }

  messageEl.textContent = message;
  toast.classList.remove('success', 'error');
  toast.classList.add(type, 'show');

  magneticToastTimeout = window.setTimeout(() => {
    toast.classList.remove('show');
    magneticToastTimeout = null;
  }, 3000);
}

class MagneticCarousel {
  private carousel: HTMLElement;
  private cards: NodeListOf<Element>;
  private cvSource: CvSource;

  constructor(element: HTMLElement, cvSource: CvSource) {
    this.carousel = element;
    this.cards = element.querySelectorAll('.carousel-card');
    this.cvSource = cvSource;
    this.init();
  }

  private init() {
    this.carousel.addEventListener('mousemove', this.handleMouseMove);
    this.carousel.addEventListener('mouseleave', this.handleMouseLeave);

    this.cards.forEach(card => {
      card.addEventListener('click', this.handleCardClick);
    });
  }

  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.carousel.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.cards.forEach(card => {
      const cardEl = card as HTMLElement;
      const isFocusCard = cardEl.classList.contains('carousel-card--focus');
      if (!isFocusCard) return;

      const cardRect = cardEl.getBoundingClientRect();
      const cardX = cardRect.left - rect.left + cardRect.width / 2;
      const cardY = cardRect.top - rect.top + cardRect.height / 2;

      const deltaX = x - cardX;
      const deltaY = y - cardY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      const minEffectDistance = 40;
      const maxEffectDistance = 150;

      if (distance < minEffectDistance || distance > maxEffectDistance) {
        cardEl.style.transform = 'translate(0, 0)';
        return;
      }

      const effectiveRange = maxEffectDistance - minEffectDistance;
      const effectiveDistance = distance - minEffectDistance;
      const normalizedDistance = effectiveDistance / effectiveRange;

      const strength = Math.sin(normalizedDistance * Math.PI);

      const maxHorizontalMove = 12;
      const maxVerticalMove = 6;

      const dirX = deltaX / distance;
      const dirY = deltaY / distance;

      const translateX = dirX * strength * maxHorizontalMove;
      const translateY = dirY * strength * maxVerticalMove;

      cardEl.style.transform = `translate(${translateX}px, ${translateY}px)`;
    });
  };

  private resetCard(card: Element) {
    const cardEl = card as HTMLElement;
    const isFocusCard = cardEl.classList.contains('carousel-card--focus');
    if (isFocusCard) {
      cardEl.style.transform = 'translate(0, 0)';
    }
  }

  private handleMouseLeave = () => {
    this.cards.forEach(card => {
      this.resetCard(card);
    });
  };

  private handleCardClick = async (e: Event) => {
    const card = e.currentTarget as HTMLElement | null;
    if (!card) return;
    const cardType = card.getAttribute('data-card');

    if (cardType === 'download') {
      e.preventDefault();
      await this.downloadCV();
    } else if (cardType === 'copy') {
      e.preventDefault();
      await this.copyCV();
    }
  };

  private async downloadCV() {
    try {
      const response = await fetch('/files/Johannes_Tauscher_CV.pdf');

      if (!response.ok) {
        throw new Error('Failed to fetch CV PDF');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Johannes_Tauscher_CV.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      showToast('CV PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('Failed to download CV:', error);
      showToast('Download failed', 'error');
    }
  }

  private async copyCV() {
    const cvData = JSON.stringify(buildMachineCv(this.cvSource), null, 2);

    try {
      if (!navigator.clipboard || !window.isSecureContext) {
        throw new Error('Clipboard API unavailable');
      }

      await navigator.clipboard.writeText(cvData);
      showToast('CV data copied to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to copy CV:', error);

      try {
        const textarea = document.createElement('textarea');
        textarea.value = cvData;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('CV data copied to clipboard!', 'success');
      } catch (fallbackErr) {
        showToast('Copy failed', 'error');
      }
    }
  }
}

function initMagneticCarousels(): void {
  const toastCloseBtn = document.querySelector('#magnetic-carousel-toast .toast-close') as HTMLButtonElement | null;
  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', hideToast);
  }

  const carousels = document.querySelectorAll('[data-magnetic-carousel]');
  carousels.forEach(carousel => {
    const el = carousel as HTMLElement;
    if (el.dataset.magneticInit === 'true') return;
    el.dataset.magneticInit = 'true';

    const cvSourceJson = el.dataset.cvSource || '{}';
    const cvSource = JSON.parse(cvSourceJson) as CvSource;
    new MagneticCarousel(el, cvSource);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMagneticCarousels, { once: true });
} else {
  initMagneticCarousels();
}

document.addEventListener('astro:after-swap', initMagneticCarousels);
