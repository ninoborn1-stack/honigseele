// Zentrale Schalter. Werte kommen aus .env (NEXT_PUBLIC_* wird zur Build-Zeit eingesetzt).
export const DEMO = process.env.NEXT_PUBLIC_DEMO !== 'false';
export const HONEYCOMB = process.env.NEXT_PUBLIC_HONEYCOMB === 'true';
export const SITE_URL = 'https://honigseele.de';

/** Unterordner beim Hosting, z. B. "/honigseele" auf GitHub Pages. Lokal leer. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Pfad zu Dateien in public/ (Bilder, Icons) inkl. Unterordner. next/link braucht das nicht. */
export function withBase(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path; // data:, https:, relative
  return `${BASE_PATH}${path}`;
}

/** location.pathname ohne Unterordner (für Vergleiche und router.push) */
export function stripBase(pathname: string): string {
  return BASE_PATH && pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) || '/' : pathname;
}
