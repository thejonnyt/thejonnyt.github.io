import type { Language } from './languageStore';

export async function loadContent<T>(section: string, language: Language): Promise<T> {
  const fileName = language === 'en' ? 'data.json' : `data.${language}.json`;
  const path = `/src/content/${section}/${fileName}`;

  try {
    const module = await import(`../content/${section}/${fileName}`);
    return module.default as T;
  } catch (error) {
    console.warn(`Failed to load ${path}, falling back to English`);
    const fallback = await import(`../content/${section}/data.json`);
    return fallback.default as T;
  }
}
