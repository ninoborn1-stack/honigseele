// Zentrale Bildzuordnung. Bilder werden über Schlüssel (z. B. "hero.shop") eingebunden.
// Annas Fotos: Datei nach public/images/ legen, in content/images.json "src" eintragen und
// "placeholder" auf false setzen – keine Code-Änderung nötig.
import imagesJson from '@content/images.json';

export interface ImageEntry {
  src: string;
  alt: string;
  placeholder: boolean;
  motif: string;
  wanted: string;
}

export const images = imagesJson as Record<string, ImageEntry>;
export type ImageKey = keyof typeof imagesJson;

/** Schlüssel oder Pfad → Eintrag. Pfade/Daten-URLs (z. B. Admin-Upload) werden durchgereicht. */
export function resolveImage(keyOrSrc: string): ImageEntry {
  const hit = images[keyOrSrc];
  if (hit) return hit;
  return { src: keyOrSrc, alt: '', placeholder: false, motif: '', wanted: '' };
}
