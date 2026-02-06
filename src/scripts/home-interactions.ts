import { initExperienceToggles } from './experience-toggle';

type HomeInteractionLabels = {
  bioMore: string;
  bioLess: string;
  videoTitleDefault: string;
};

const DEFAULT_LABELS: HomeInteractionLabels = {
  bioMore: 'Read more',
  bioLess: 'Read less',
  videoTitleDefault: 'Project video'
};

function getHomeLabels(root: HTMLElement): HomeInteractionLabels {
  return {
    bioMore: root.dataset.bioMore || DEFAULT_LABELS.bioMore,
    bioLess: root.dataset.bioLess || DEFAULT_LABELS.bioLess,
    videoTitleDefault: root.dataset.videoTitleDefault || DEFAULT_LABELS.videoTitleDefault
  };
}

function initHomeInteractions(): void {
  const root = document.querySelector('[data-home-interactions]') as HTMLElement | null;
  if (!root || root.dataset.homeInteractionsInit === 'true') return;
  root.dataset.homeInteractionsInit = 'true';

  const labels = getHomeLabels(root);

  initExperienceToggles();

  // Handle video thumbnail clicks
  const thumbnails = root.querySelectorAll('.video-thumbnail');

  const toggleVideo = (thumbnail: HTMLElement) => {
    const projectIndex = thumbnail.getAttribute('data-project-index');
    const videoContainer = root.querySelector(
      `.video-container[data-project-index="${projectIndex}"]`
    ) as HTMLElement | null;

    if (!videoContainer) return;

    const isExpanded = thumbnail.getAttribute('aria-expanded') === 'true';

    if (!isExpanded) {
      if (!videoContainer.querySelector('iframe')) {
        const videoSrc = videoContainer.getAttribute('data-video-src');
        const videoTitle = videoContainer.getAttribute('data-video-title') || labels.videoTitleDefault;

        if (videoSrc) {
          const iframe = document.createElement('iframe');
          iframe.title = videoTitle;
          iframe.src = videoSrc;
          iframe.width = '100%';
          iframe.height = '400';
          iframe.referrerPolicy = 'strict-origin-when-cross-origin';
          iframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share';
          iframe.setAttribute('allowfullscreen', '');
          videoContainer.appendChild(iframe);
        }
      }

      videoContainer.style.display = 'block';
      thumbnail.style.opacity = '0.5';
      thumbnail.setAttribute('aria-expanded', 'true');
    } else {
      videoContainer.style.display = 'none';
      thumbnail.style.opacity = '1';
      thumbnail.setAttribute('aria-expanded', 'false');
    }
  };

  thumbnails.forEach((thumbnailEl) => {
    const thumbnail = thumbnailEl as HTMLElement;

    thumbnail.addEventListener('click', () => {
      toggleVideo(thumbnail);
    });

    thumbnail.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleVideo(thumbnail);
      }
    });
  });

  // Handle audio summary play trigger
  const audioSummarySection = root.querySelector('#audio-summary');
  const audioSummaryTrigger = audioSummarySection?.querySelector('.audio-summary-trigger') as HTMLButtonElement | null;
  const audioSummaryPlayer = audioSummarySection?.querySelector('.audio-summary-player') as HTMLElement | null;

  if (audioSummaryTrigger && audioSummaryPlayer) {
    audioSummaryTrigger.addEventListener('click', () => {
      const isHidden = audioSummaryPlayer.hasAttribute('hidden');
      if (isHidden) {
        audioSummaryPlayer.removeAttribute('hidden');
        audioSummaryTrigger.setAttribute('aria-expanded', 'true');
      }

      let attempts = 0;
      const maxAttempts = 20;
      const interval = window.setInterval(() => {
        attempts += 1;
        const playButton = audioSummaryPlayer.querySelector('.play-pause-btn') as HTMLButtonElement | null;
        if (
          playButton
          && audioSummaryPlayer.querySelector('.audio-summary-player-wrapper')?.getAttribute('data-initialized') === 'true'
        ) {
          playButton.click();
          window.clearInterval(interval);
        } else if (attempts >= maxAttempts) {
          window.clearInterval(interval);
        }
      }, 100);
    });
  }

  // Handle bio expand/collapse
  const bioToggles = root.querySelectorAll('.bio-toggle');

  bioToggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      const expandable = button.closest('.bio-expandable');
      if (!expandable) return;

      const bioFull = expandable.querySelector('.bio-full') as HTMLElement | null;
      const toggleText = button.querySelector('.toggle-text');
      const chevron = button.querySelector('.chevron') as HTMLElement | null;
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      if (!bioFull) return;

      if (!isExpanded) {
        bioFull.style.display = 'block';
        if (toggleText) toggleText.textContent = labels.bioLess;
        if (chevron) chevron.style.transform = 'rotate(180deg)';
        button.setAttribute('aria-expanded', 'true');
      } else {
        bioFull.style.display = 'none';
        if (toggleText) toggleText.textContent = labels.bioMore;
        if (chevron) chevron.style.transform = 'rotate(0deg)';
        button.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomeInteractions, { once: true });
} else {
  initHomeInteractions();
}

document.addEventListener('astro:after-swap', initHomeInteractions);
