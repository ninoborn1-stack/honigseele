'use client';
import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
import { resolveImage, variantFor, type ImageEntry } from '@/content/images';
import { cn } from '@/lib/cn';
import { DEMO, withBase } from '@/lib/config';

/** Bild-URL aus Schlüssel oder Pfad; mit `minWidth` die passende kleine Variante (z. B. Vorschaubilder) */
export const imageUrl = (keyOrSrc: string, minWidth = 1600) => withBase(variantFor(resolveImage(keyOrSrc), minWidth));

/** srcset aus den WebP-Varianten */
export const srcSetOf = (entry: ImageEntry) => entry.variants?.map(([w, path]) => `${withBase(path)} ${w}w`).join(', ');

/** Dezente Kennzeichnung im Demo-Modus, nur wenn das Bild groß genug ist (Container-Query) */
export function ImageBadge({ keyOrSrc }: { keyOrSrc: string }) {
  const entry = resolveImage(keyOrSrc);
  if (!DEMO || !entry.placeholder) return null;
  return (
    <span
      title={`Platzhalter – gewünscht: ${entry.wanted}`}
      className="pointer-events-none absolute bottom-3 left-3 z-[1] hidden items-center gap-1.5 rounded-full bg-cream-50/80 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-honey-950/80 backdrop-blur @min-[14rem]:inline-flex"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
      Platzhalter
    </span>
  );
}

/**
 * Optimiertes Bild: WebP-Varianten per srcset, Unschärfe-Vorschau sofort, scharfes Bild blendet
 * weich ein, sobald es geladen ist. `onReady` meldet, wann es fertig ist (für Reveal-Animationen).
 */
export function SmartImg({
  entry,
  alt,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority,
  className,
  onReady,
  ...rest
}: { entry: ImageEntry; alt: string; sizes?: string; priority?: boolean; onReady?: () => void } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'alt'>) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const done = () => {
    setLoaded(true);
    onReady?.();
  };
  // Schon aus dem Cache geladen, bevor React übernommen hat
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <img
      ref={ref}
      alt={alt}
      src={withBase(variantFor(entry, 1600))}
      srcSet={srcSetOf(entry)}
      sizes={entry.variants ? sizes : undefined}
      width={entry.width}
      height={entry.height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      onLoad={done}
      className={cn('transition-opacity duration-700 ease-[var(--ease-soft)]', loaded ? 'opacity-100' : 'opacity-0', className)}
      {...rest}
    />
  );
}

/** Hintergrund mit Unschärfe-Vorschau, bis das echte Bild da ist */
export const blurStyle = (entry: ImageEntry) => (entry.blur ? { backgroundImage: `url(${entry.blur})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined);

/**
 * Bild aus der zentralen Zuordnung (Schlüssel wie "hero.shop") oder per Pfad.
 * Mit stilvollem Ersatz (Honig-Verlauf + Motiv), falls die Datei fehlt.
 * Kein next/image: statischer Export, Varianten erzeugt `npm run images`.
 */
export function Photo({
  src,
  alt,
  className,
  imgClassName,
  priority,
  sizes,
}: {
  /** Schlüssel aus content/images.json oder Pfad */
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** z. B. "100vw" für volle Breite, "64px" für kleine Vorschaubilder */
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const entry = resolveImage(src);
  const text = alt ?? entry.alt;
  return (
    <div className={cn('@container relative overflow-hidden bg-cream-200', className)} style={blurStyle(entry)}>
      {failed ? (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(70%_60%_at_30%_20%,#f1d49c,transparent),linear-gradient(160deg,#efe4d2,#d9a54a)] p-6 text-center font-serif text-lg italic text-honey-950/70">
          {entry.motif || text}
        </div>
      ) : (
        <SmartImg entry={entry} alt={text} sizes={sizes} priority={priority} onError={() => setFailed(true)} className={cn('h-full w-full object-cover', imgClassName)} />
      )}
      <ImageBadge keyOrSrc={src} />
    </div>
  );
}
