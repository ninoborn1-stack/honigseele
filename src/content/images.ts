// Zentrale Bildzuordnung. Bilder werden über Schlüssel (z. B. "hero.shop") eingebunden.
// Echte Fotos liegen verkleinert in public/images/real/ (Originale im ignorierten Ordner "Pics Website").
// Neues Foto: Datei dort ablegen, in content/images.json "src" eintragen und `npm run images` ausführen.
import imagesJson from '@content/images.json';
import generatedJson from '@content/images.generated.json';

export interface ImageEntry {
  src: string;
  alt: string;
  placeholder: boolean;
  /** Motiv-Beschreibung (Ersatzanzeige, falls das Bild nicht lädt) */
  motif?: string;
  wanted?: string;
  /** Bildausschnitt (CSS object-position), z. B. "50% 0%" damit Köpfe oben nie abgeschnitten werden */
  position?: string;
  /** aus scripts/optimize-images.py */
  width?: number;
  height?: number;
  variants?: [number, string][];
  blur?: string;
}

interface Generated {
  width: number;
  height: number;
  variants: [number, string][];
  blur: string;
}

export const images = imagesJson as Record<string, Omit<ImageEntry, 'width' | 'height' | 'variants' | 'blur'>>;
const generated = generatedJson as unknown as Record<string, Generated>;
export type ImageKey = keyof typeof imagesJson;

/** Schlüssel oder Pfad → Eintrag inkl. optimierter Varianten. Daten-URLs (Admin-Upload) werden durchgereicht. */
export function resolveImage(keyOrSrc: string): ImageEntry {
  const base = images[keyOrSrc] ?? { src: keyOrSrc, alt: '', placeholder: false, motif: '', wanted: '' };
  return { ...base, ...(generated[base.src] ?? {}) };
}

/** Kleinste Variante, die mindestens `minWidth` breit ist (für Vorschaubilder ohne srcset) */
export function variantFor(entry: ImageEntry, minWidth: number): string {
  if (!entry.variants?.length) return entry.src;
  return (entry.variants.find(([w]) => w >= minWidth) ?? entry.variants[entry.variants.length - 1])[1];
}
