export type Language = "en" | "de";

export function getLangFromUrl(url: URL): Language {
  return url.pathname.startsWith("/de") ? "de" : "en";
}
