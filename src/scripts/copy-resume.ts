export {};

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

  const experience = (source.experience || []).map((role: any) => {
    const { achievementsShort, achievements_short, ...rest } = role;
    const shortAchievements = achievementsShort || achievements_short;
    const achievements = Array.isArray(shortAchievements) && shortAchievements.length > 0
      ? shortAchievements
      : role.achievements;
    return {
      ...rest,
      achievements
    };
  });

  return {
    profile: source.profile,
    experience,
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

function initCvActions(root: HTMLElement): void {
  if (root.dataset.cvActionsInit === 'true') return;
  root.dataset.cvActionsInit = 'true';

  const toast = root.querySelector('.toast-notification') as HTMLElement | null;
  const toastCloseBtn = root.querySelector('.toast-close') as HTMLButtonElement | null;
  const downloadBtn = root.querySelector('[data-action="download"]') as HTMLButtonElement | null;
  const copyBtn = root.querySelector('[data-action="copy"]') as HTMLButtonElement | null;

  const cvSourceJson = root.dataset.cvSource || '{}';
  let cvSource: CvSource | null = null;
  try {
    cvSource = JSON.parse(cvSourceJson) as CvSource;
  } catch (err) {
    console.error('Failed to parse CV source data:', err);
  }

  let toastTimeout: number | null = null;

  function hideToast() {
    if (!toast) return;

    if (toastTimeout !== null) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }

    toast.classList.remove('show');
  }

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    if (!toast) return;

    const messageEl = toast.querySelector('.toast-message') as HTMLElement | null;
    if (!messageEl) return;

    if (toastTimeout !== null) {
      clearTimeout(toastTimeout);
    }

    messageEl.textContent = message;
    toast.classList.remove('success', 'error');
    toast.classList.add(type, 'show');

    toastTimeout = window.setTimeout(() => {
      toast.classList.remove('show');
      toastTimeout = null;
    }, 3000);
  }

  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', hideToast);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      try {
        const link = document.createElement('a');
        link.href = '/files/Johannes_Tauscher_CV.pdf';
        link.download = 'Johannes_Tauscher_CV.pdf';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Downloading CV...', 'success');
      } catch (err) {
        console.error('Failed to download PDF:', err);
        showToast('Download failed', 'error');
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (!cvSource) {
        showToast('CV data unavailable', 'error');
        return;
      }

      const cvData = JSON.stringify(buildMachineCv(cvSource), null, 2);

      try {
        await navigator.clipboard.writeText(cvData);
        showToast('CV data copied to clipboard!', 'success');
      } catch (err) {
        console.error('Failed to copy CV data:', err);

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
    });
  }
}

function initAllCvActions(): void {
  const roots = document.querySelectorAll('.cv-actions-wrapper');
  roots.forEach((root) => initCvActions(root as HTMLElement));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllCvActions, { once: true });
} else {
  initAllCvActions();
}

document.addEventListener('astro:after-swap', initAllCvActions);
