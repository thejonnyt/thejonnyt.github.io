export type AudioState = {
  src: string;
  title?: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  volume: number;
  muted: boolean;
  lastUpdated: number;
  isCompleted: boolean;
  lastUserAction: 'play' | 'pause' | 'seek' | 'stop' | 'ended' | 'init';
};

type StatePatch = Partial<AudioState>;
type Subscriber = (state: AudioState) => void;

const TTL_MS = 7 * 24 * 60 * 60 * 1000;
type GlobalAudioStateStore = {
  stateBySrc: Map<string, AudioState>;
  subscribersBySrc: Map<string, Set<Subscriber>>;
  activeSrc: string | null;
};

const GLOBAL_KEY = '__audioStateStore__';
const globalStore = (() => {
  const win = window as unknown as Record<string, GlobalAudioStateStore | undefined>;
  if (!win[GLOBAL_KEY]) {
    win[GLOBAL_KEY] = {
      stateBySrc: new Map<string, AudioState>(),
      subscribersBySrc: new Map<string, Set<Subscriber>>(),
      activeSrc: null,
    };
  }
  return win[GLOBAL_KEY] as GlobalAudioStateStore;
})();

const stateBySrc = globalStore.stateBySrc;
const subscribersBySrc = globalStore.subscribersBySrc;

function now() {
  return Date.now();
}

function baseState(src: string): AudioState {
  return {
    src,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    playbackRate: 1,
    volume: 1,
    muted: false,
    lastUpdated: now(),
    isCompleted: false,
    lastUserAction: 'init',
  };
}

function notify(src: string) {
  const state = stateBySrc.get(src);
  if (!state) return;
  const subs = subscribersBySrc.get(src);
  if (!subs) return;
  subs.forEach((cb) => cb(state));
}

export function getState(src: string): AudioState {
  return stateBySrc.get(src) ?? baseState(src);
}

export function setState(src: string, patch: StatePatch): AudioState {
  const prev = stateBySrc.get(src) ?? baseState(src);
  const next: AudioState = {
    ...prev,
    ...patch,
    src,
    lastUpdated: now(),
  };
  stateBySrc.set(src, next);
  notify(src);
  return next;
}

export function subscribe(src: string, cb: Subscriber): () => void {
  const subs = subscribersBySrc.get(src) ?? new Set<Subscriber>();
  subs.add(cb);
  subscribersBySrc.set(src, subs);
  return () => {
    subs.delete(cb);
    if (!subs.size) subscribersBySrc.delete(src);
  };
}

export function setActive(src: string | null): void {
  globalStore.activeSrc = src;
  window.dispatchEvent(new CustomEvent('audio:active', { detail: { src } }));
}

export function getActive(): string | null {
  return globalStore.activeSrc;
}

export function loadState(src: string, storageKey?: string): AudioState {
  if (!storageKey) return getState(src);
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return getState(src);
    const data = JSON.parse(saved) as {
      currentTime?: number;
      duration?: number;
      playbackRate?: number;
      volume?: number;
      muted?: boolean;
      timestamp?: number;
    };
    const savedAt = data.timestamp ?? 0;
    if (savedAt < now() - TTL_MS) return getState(src);
    if (!data.currentTime || data.currentTime <= 5) return getState(src);
    return setState(src, {
      currentTime: data.currentTime ?? 0,
      duration: data.duration ?? 0,
      playbackRate: data.playbackRate ?? 1,
      volume: data.volume ?? 1,
      muted: data.muted ?? false,
    });
  } catch {
    return getState(src);
  }
}

export function saveState(src: string, storageKey?: string): void {
  if (!storageKey) return;
  const state = getState(src);
  if (!state.duration) return;
  if (state.currentTime <= 0) return;
  if (state.currentTime >= state.duration - 5) return;
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      currentTime: state.currentTime,
      duration: state.duration,
      playbackRate: state.playbackRate,
      volume: state.volume,
      muted: state.muted,
      timestamp: now(),
    })
  );
}

export function clearState(src: string, storageKey?: string): void {
  if (storageKey) localStorage.removeItem(storageKey);
  stateBySrc.set(src, {
    ...baseState(src),
    lastUserAction: 'stop',
  });
  notify(src);
}
