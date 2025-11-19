import { persistentAtom } from '@nanostores/persistent';

export type Language = 'en' | 'de';

export const languageStore = persistentAtom<Language>('language', 'en', {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function setLanguage(lang: Language) {
  languageStore.set(lang);
}

export function getLanguage(): Language {
  return languageStore.get();
}