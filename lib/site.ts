export const SITE_URL = "https://immigratealberta.ca";

/**
 * Build a canonical URL from a path.
 * Ensures leading slash, no trailing slash (except root), and no query strings.
 */
export function canonical(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const normalized =
    clean.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  return normalized === "/" ? SITE_URL : `${SITE_URL}${normalized}`;
}
