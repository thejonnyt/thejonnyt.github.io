function initAudioPlaylistPlayer(wrapper: HTMLElement) {
  if (wrapper.dataset.initialized === 'true') return;
  wrapper.dataset.initialized = 'true';

  const audio = wrapper.querySelector('.hidden-audio') as HTMLAudioElement;
  const source = audio.querySelector('source') as HTMLSourceElement | null;
  const mainContainer = wrapper.querySelector('.audio-player-container') as HTMLElement;
  const miniPlayer = wrapper.querySelector('.mini-player') as HTMLElement;
  const minimizedPlayer = wrapper.querySelector('.minimized-player') as HTMLElement;
  const titleEl = wrapper.querySelector('.track-title') as HTMLElement;
  const miniTitle = wrapper.querySelector('.mini-title') as HTMLElement;

  const playlistButtons = Array.from(wrapper.querySelectorAll('.playlist-item')) as HTMLButtonElement[];
  const playlistItems = playlistButtons
    .map((button) => ({
      src: button.dataset.src || '',
      title: button.dataset.title || 'Audio'
    }))
    .filter((item) => item.src);

  if (!playlistItems.length || !source) return;

  // Main player elements
  const prevBtn = wrapper.querySelector('.prev-btn') as HTMLButtonElement;
  const nextBtn = wrapper.querySelector('.next-btn') as HTMLButtonElement;
  const playPauseBtn = wrapper.querySelector('.play-pause-btn') as HTMLButtonElement;
  const playIcon = wrapper.querySelector('.play-icon') as HTMLElement;
  const pauseIcon = wrapper.querySelector('.pause-icon') as HTMLElement;
  const currentTimeEl = wrapper.querySelector('.current-time') as HTMLElement;
  const durationEl = wrapper.querySelector('.duration') as HTMLElement;
  const progressBar = wrapper.querySelector('.progress-bar') as HTMLInputElement;
  const volumeBtn = wrapper.querySelector('.volume-btn') as HTMLButtonElement;
  const volumeIcon = wrapper.querySelector('.volume-icon') as HTMLElement;
  const mutedIcon = wrapper.querySelector('.muted-icon') as HTMLElement;
  const volumeSlider = wrapper.querySelector('.volume-slider') as HTMLInputElement;
  const speedBtn = wrapper.querySelector('.speed-btn') as HTMLButtonElement;
  const speedValue = wrapper.querySelector('.speed-value') as HTMLElement;
  const speedMenu = wrapper.querySelector('.speed-menu') as HTMLElement;

  // Mini player elements
  const miniPlayPauseBtn = wrapper.querySelector('.mini-play-pause-btn') as HTMLButtonElement;
  const miniPlayIcon = wrapper.querySelector('.mini-play-icon') as HTMLElement;
  const miniPauseIcon = wrapper.querySelector('.mini-pause-icon') as HTMLElement;
  const miniTime = wrapper.querySelector('.mini-time') as HTMLElement;
  const miniProgressBar = wrapper.querySelector('.mini-progress-bar') as HTMLInputElement;
  const miniVolumeBtn = wrapper.querySelector('.mini-volume-btn') as HTMLButtonElement;
  const miniVolumeIcon = wrapper.querySelector('.mini-volume-icon') as HTMLElement;
  const miniMutedIcon = wrapper.querySelector('.mini-muted-icon') as HTMLElement;
  const miniVolumeSlider = wrapper.querySelector('.mini-volume-slider') as HTMLInputElement;
  const miniSpeedBtn = wrapper.querySelector('.mini-speed-btn') as HTMLButtonElement;
  const miniSpeedValue = wrapper.querySelector('.mini-speed-value') as HTMLElement;
  const miniSpeedMenu = wrapper.querySelector('.mini-speed-menu') as HTMLElement;
  const miniMinimizeBtn = wrapper.querySelector('.mini-minimize-btn') as HTMLButtonElement;
  const miniCloseBtn = wrapper.querySelector('.mini-close-btn') as HTMLButtonElement;

  // Minimized player elements
  const minimizedPlayPauseBtn = wrapper.querySelector('.minimized-play-pause-btn') as HTMLButtonElement;
  const minimizedPlayIcon = wrapper.querySelector('.minimized-play-icon') as HTMLElement;
  const minimizedPauseIcon = wrapper.querySelector('.minimized-pause-icon') as HTMLElement;
  const minimizedTime = wrapper.querySelector('.minimized-time') as HTMLElement;
  const minimizedExpandBtn = wrapper.querySelector('.minimized-expand-btn') as HTMLButtonElement;
  const minimizedCloseBtn = wrapper.querySelector('.minimized-close-btn') as HTMLButtonElement;

  let isUserManuallyHidingMini = false;
  let pendingAutoplay = false;
  let currentIndex = Math.min(
    Math.max(Number(wrapper.dataset.defaultIndex) || 0, 0),
    playlistItems.length - 1
  );
  let storageKey = getStorageKey(playlistItems[currentIndex].src);

  function getStorageKey(src: string) {
    return `playlist-position-${src}`;
  }

  function pauseOtherAudio() {
    document.querySelectorAll('audio').forEach((other) => {
      if (other !== audio) {
        other.pause();
      }
    });
  }

  function updateActiveItem() {
    playlistButtons.forEach((button, index) => {
      const isActive = index === currentIndex;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function resetTimeDisplay() {
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';
    miniTime.textContent = '0:00 / 0:00';
    minimizedTime.textContent = '0:00 / 0:00';
    progressBar.value = '0';
    miniProgressBar.value = '0';
  }

  function setTrack(index: number, opts: { autoplay?: boolean } = {}) {
    if (!playlistItems.length) return;
    const boundedIndex = Math.min(Math.max(index, 0), playlistItems.length - 1);
    if (boundedIndex === currentIndex && source.src) {
      if (opts.autoplay) {
        pauseOtherAudio();
        audio.play();
      }
      return;
    }

    savePlaybackPosition();
    currentIndex = boundedIndex;
    const item = playlistItems[currentIndex];
    storageKey = getStorageKey(item.src);
    titleEl.textContent = item.title;
    miniTitle.textContent = item.title;
    source.src = item.src;
    audio.load();
    pendingAutoplay = !!opts.autoplay;
    resetTimeDisplay();
    updateActiveItem();
  }

  // Format time helper
  function formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Save playback position to localStorage
  function savePlaybackPosition() {
    if (audio.currentTime > 0 && audio.currentTime < audio.duration - 5) {
      localStorage.setItem(storageKey, JSON.stringify({
        currentTime: audio.currentTime,
        duration: audio.duration,
        timestamp: Date.now()
      }));
    }
  }

  // Restore playback position from localStorage
  function restorePlaybackPosition() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        // Only restore if saved within last 7 days
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        if (data.timestamp > sevenDaysAgo && data.currentTime > 5) {
          audio.currentTime = data.currentTime;
        }
      }
    } catch (e) {
      console.error('Failed to restore playback position:', e);
    }
  }

  // Clear saved position
  function clearPlaybackPosition() {
    localStorage.removeItem(storageKey);
  }

  function updatePlayPauseIcons(isPlaying: boolean) {
    if (isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'inline-block';
      miniPlayIcon.style.display = 'none';
      miniPauseIcon.style.display = 'inline-block';
      minimizedPlayIcon.style.display = 'none';
      minimizedPauseIcon.style.display = 'inline-block';
    } else {
      playIcon.style.display = 'inline-block';
      pauseIcon.style.display = 'none';
      miniPlayIcon.style.display = 'inline-block';
      miniPauseIcon.style.display = 'none';
      minimizedPlayIcon.style.display = 'inline-block';
      minimizedPauseIcon.style.display = 'none';
    }
  }

  function playAudio() {
    pauseOtherAudio();
    audio.play();
    updatePlayPauseIcons(true);
  }

  // Play/Pause functionality
  function togglePlayPause() {
    if (audio.paused) {
      playAudio();
    } else {
      audio.pause();
      updatePlayPauseIcons(false);
    }
  }

  playPauseBtn?.addEventListener('click', togglePlayPause);
  miniPlayPauseBtn?.addEventListener('click', togglePlayPause);
  minimizedPlayPauseBtn?.addEventListener('click', togglePlayPause);
  prevBtn?.addEventListener('click', () => setTrack(currentIndex - 1, { autoplay: true }));
  nextBtn?.addEventListener('click', () => setTrack(currentIndex + 1, { autoplay: true }));

  playlistButtons.forEach((button, index) => {
    button.addEventListener('click', () => setTrack(index, { autoplay: true }));
  });

  function playFromExternalTrigger(target: HTMLElement) {
    const src = target.dataset.src;
    if (!src) return;
    const matchIndex = playlistItems.findIndex((item) => item.src === src);
    if (matchIndex === -1) return;
    setTrack(matchIndex, { autoplay: true });
  }

  document.addEventListener('click', (event) => {
    const trigger = (event.target as HTMLElement).closest('.playlist-trigger') as HTMLElement | null;
    if (!trigger) return;
    event.preventDefault();
    playFromExternalTrigger(trigger);
  });

  // Update time and progress
  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
    restorePlaybackPosition();
    if (pendingAutoplay) {
      playAudio();
      pendingAutoplay = false;
    }
  });

  // Auto-save playback position every 5 seconds
  let autoSaveInterval: number;
  audio.addEventListener('play', () => {
    autoSaveInterval = window.setInterval(savePlaybackPosition, 5000);
    updatePlayPauseIcons(true);
  });

  audio.addEventListener('pause', () => {
    clearInterval(autoSaveInterval);
    savePlaybackPosition();
    updatePlayPauseIcons(false);
  });

  audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime;
    const duration = audio.duration;

    currentTimeEl.textContent = formatTime(currentTime);
    miniTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    minimizedTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;

    if (duration) {
      const progress = (currentTime / duration) * 100;
      progressBar.value = progress.toString();
      miniProgressBar.value = progress.toString();
    }
  });

  // Seek functionality
  function seek(e: Event) {
    const target = e.target as HTMLInputElement;
    const seekTime = (parseFloat(target.value) / 100) * audio.duration;
    audio.currentTime = seekTime;
  }

  progressBar?.addEventListener('input', seek);
  miniProgressBar?.addEventListener('input', seek);

  // Volume control
  function updateVolume(value: number) {
    audio.volume = value / 100;
    volumeSlider.value = value.toString();
    miniVolumeSlider.value = value.toString();

    if (value === 0) {
      volumeIcon.style.display = 'none';
      mutedIcon.style.display = 'inline-block';
      miniVolumeIcon.style.display = 'none';
      miniMutedIcon.style.display = 'inline-block';
    } else {
      volumeIcon.style.display = 'inline-block';
      mutedIcon.style.display = 'none';
      miniVolumeIcon.style.display = 'inline-block';
      miniMutedIcon.style.display = 'none';
    }
  }

  volumeSlider?.addEventListener('input', (e) => {
    updateVolume(parseFloat((e.target as HTMLInputElement).value));
  });

  miniVolumeSlider?.addEventListener('input', (e) => {
    updateVolume(parseFloat((e.target as HTMLInputElement).value));
  });

  // Mute toggle
  let previousVolume = 100;
  function toggleMute() {
    if (audio.volume > 0) {
      previousVolume = audio.volume * 100;
      updateVolume(0);
    } else {
      updateVolume(previousVolume);
    }
  }

  volumeBtn?.addEventListener('click', toggleMute);
  miniVolumeBtn?.addEventListener('click', toggleMute);

  // Speed control
  function setSpeed(speed: number) {
    audio.playbackRate = speed;
    speedValue.textContent = `${speed}×`;
    miniSpeedValue.textContent = `${speed}×`;

    // Update active state in menus
    wrapper.querySelectorAll('.speed-menu button, .mini-speed-menu button').forEach(btn => {
      btn.classList.remove('active');
      if (parseFloat((btn as HTMLElement).dataset.speed || '1') === speed) {
        btn.classList.add('active');
      }
    });
  }

  // Speed button toggle
  speedBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    speedMenu.style.display = speedMenu.style.display === 'none' ? 'block' : 'none';
  });

  miniSpeedBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    miniSpeedMenu.style.display = miniSpeedMenu.style.display === 'none' ? 'block' : 'none';
  });

  // Speed menu item clicks
  wrapper.querySelectorAll('.speed-menu button, .mini-speed-menu button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const speed = parseFloat((e.target as HTMLElement).dataset.speed || '1');
      setSpeed(speed);
      speedMenu.style.display = 'none';
      miniSpeedMenu.style.display = 'none';
    });
  });

  // Close speed menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!speedBtn?.contains(e.target as Node) && !speedMenu?.contains(e.target as Node)) {
      speedMenu.style.display = 'none';
    }
    if (!miniSpeedBtn?.contains(e.target as Node) && !miniSpeedMenu?.contains(e.target as Node)) {
      miniSpeedMenu.style.display = 'none';
    }
  });

  // Mini player visibility based on scroll
  let miniPlayerTimeout: number;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Show mini player if main player is not visible and audio has been played
      if (!entry.isIntersecting && (audio.currentTime > 0 || !audio.paused) && !isUserManuallyHidingMini) {
        clearTimeout(miniPlayerTimeout);
        // Only show mini player if minimized player is not visible
        if (minimizedPlayer.style.display !== 'flex') {
          miniPlayer.style.display = 'block';
        }
      } else if (entry.isIntersecting) {
        // Hide both players when main player is visible and reset manual hiding flag
        miniPlayerTimeout = window.setTimeout(() => {
          miniPlayer.style.display = 'none';
          minimizedPlayer.style.display = 'none';
          isUserManuallyHidingMini = false;
        }, 300);
      }
    });
  }, {
    threshold: 0.1
  });

  observer.observe(mainContainer);

  // Minimize mini player (show minimized version)
  miniMinimizeBtn?.addEventListener('click', () => {
    miniPlayer.style.display = 'none';
    minimizedPlayer.style.display = 'flex';
  });

  // Expand minimized player (show full mini player)
  minimizedExpandBtn?.addEventListener('click', () => {
    minimizedPlayer.style.display = 'none';
    miniPlayer.style.display = 'block';
  });

  // Close mini player button - Pause and hide (save position)
  miniCloseBtn?.addEventListener('click', () => {
    audio.pause();
    savePlaybackPosition();
    updatePlayPauseIcons(false);
    miniPlayer.style.display = 'none';
    minimizedPlayer.style.display = 'none';
    isUserManuallyHidingMini = true;
  });

  // Close minimized player button - Pause and hide (save position)
  minimizedCloseBtn?.addEventListener('click', () => {
    audio.pause();
    savePlaybackPosition();
    updatePlayPauseIcons(false);
    miniPlayer.style.display = 'none';
    minimizedPlayer.style.display = 'none';
    isUserManuallyHidingMini = true;
  });

  // Handle audio end - Clear saved position when track completes
  audio.addEventListener('ended', () => {
    clearPlaybackPosition();
    updatePlayPauseIcons(false);
    miniPlayer.style.display = 'none';
    minimizedPlayer.style.display = 'none';
  });

  // Save position when page is about to unload
  window.addEventListener('beforeunload', () => {
    if (!audio.paused) {
      savePlaybackPosition();
    }
  });

  updateActiveItem();
  updatePlayPauseIcons(false);
}

function initAudioPlaylistWhenVisible() {
  const wrappers = Array.from(document.querySelectorAll('.audio-playlist-player-wrapper')) as HTMLElement[];
  if (!wrappers.length) return;

  if (!('IntersectionObserver' in window)) {
    wrappers.forEach((wrapper) => initAudioPlaylistPlayer(wrapper));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          initAudioPlaylistPlayer(entry.target as HTMLElement);
        }
      });
    },
    { rootMargin: '200px 0px' }
  );

  wrappers.forEach((wrapper) => {
    if (wrapper.dataset.initialized === 'true') return;
    observer.observe(wrapper);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAudioPlaylistWhenVisible, { once: true });
} else {
  initAudioPlaylistWhenVisible();
}

document.addEventListener('astro:after-swap', initAudioPlaylistWhenVisible);
