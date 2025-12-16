import { persistentAtom } from "@nanostores/persistent";
import { translations } from "./translations";

export type Language = "en" | "de";

export const languageStore = persistentAtom<Language>("language", "en", {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function setLanguage(lang: Language) {
  languageStore.set(lang);
}

export function getLanguage(): Language {
  return languageStore.get();
}

export function getLangFromUrl(url: URL): Language {
  return url.pathname.startsWith("/de") ? "de" : "en";
}

export function useTranslations(lang: Language) {
  return function t(key: string): string {
    const keys = key.split(".");
    let current: any = translations[lang];
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        return key; // Key not found
      }
    }
    return typeof current === "string" ? current : key;
  };
}