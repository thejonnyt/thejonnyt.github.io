function updateProgressBar(): void {
  const progressBar = document.querySelector('.progress-bar') as HTMLElement | null;
  if (!progressBar) return;

  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;

  // Calculate scroll percentage
  const scrollableHeight = documentHeight - windowHeight;
  const scrollPercentage = (scrollTop / scrollableHeight) * 100;

  progressBar.style.width = `${Math.min(scrollPercentage, 100)}%`;
}

function updateActiveSection(): void {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[data-section]');

  let currentSection = '';
  const scrollPosition = window.scrollY + 150; // Offset for better UX

  // Check if we're at the bottom of the page
  const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

  if (isAtBottom) {
    // If at bottom, highlight the last section
    const lastSection = sections[sections.length - 1];
    if (lastSection) {
      currentSection = lastSection.getAttribute('id') || '';
    }
  } else {
    // Normal scroll detection
    sections.forEach((section) => {
      const sectionTop = (section as HTMLElement).offsetTop;
      const sectionHeight = (section as HTMLElement).clientHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id') || '';
      }
    });
  }

  navLinks.forEach((link) => {
    const linkElement = link as HTMLAnchorElement;
    const linkSection = linkElement.dataset.section;

    // Education nav item is active for education, publications, and skills sections
    const isEducationActive = linkSection === 'education' &&
      (currentSection === 'education' || currentSection === 'publications' || currentSection === 'skills');

    if (linkSection === currentSection || isEducationActive) {
      linkElement.classList.add('active');
    } else {
      linkElement.classList.remove('active');
    }
  });
}

function throttle(func: () => void, delay: number): () => void {
  let timeoutId: number | null = null;
  return () => {
    if (!timeoutId) {
      timeoutId = window.setTimeout(() => {
        func();
        timeoutId = null;
      }, delay);
    }
  };
}

function getCurrentSection(): string {
  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + 150;

  // Check if at bottom of page
  const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

  if (isAtBottom && sections.length > 0) {
    const lastSection = sections[sections.length - 1];
    return lastSection?.getAttribute('id') || '';
  }

  // Normal scroll detection
  let currentSection = '';
  sections.forEach((section) => {
    const sectionTop = (section as HTMLElement).offsetTop;
    const sectionHeight = (section as HTMLElement).clientHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      currentSection = section.getAttribute('id') || '';
    }
  });

  return currentSection;
}

function setupLanguageSwitcher(): void {
  const langLinks = document.querySelectorAll('.lang-switcher a');

  langLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const currentSection = getCurrentSection();

      // If we're viewing a specific section, add it to the URL
      if (currentSection && currentSection !== 'hero') {
        e.preventDefault();
        const targetUrl = (link as HTMLAnchorElement).href;
        window.location.href = `${targetUrl}#${currentSection}`;
      }
      // Otherwise, let the link navigate normally (to top of page)
    });
  });
}

function initHeaderScroll(): void {
  updateProgressBar();
  updateActiveSection();
  setupLanguageSwitcher();
}

const throttledUpdate = throttle(() => {
  updateProgressBar();
  updateActiveSection();
}, 50);

function ensureScrollListener(): void {
  if ((window as any).__headerScrollListener) return;
  (window as any).__headerScrollListener = true;
  window.addEventListener('scroll', throttledUpdate);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    ensureScrollListener();
  }, { once: true });
} else {
  initHeaderScroll();
  ensureScrollListener();
}

document.addEventListener('astro:after-swap', initHeaderScroll);
