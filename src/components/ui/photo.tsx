'use client';
import { useState } from 'react';
import { resolveImage } from '@/content/images';
import { cn } from '@/lib/cn';
import { DEMO, withBase } from '@/lib/config';

/** Bild-URL aus Schlüssel (content/images.json) oder Pfad */
export const imageUrl = (keyOrSrc: string) => withBase(resolveImage(keyOrSrc).src);

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
 * Bild aus der zentralen Zuordnung (Schlüssel wie "hero.shop") oder per Pfad.
 * Mit stilvollem Ersatz (Honig-Verlauf + Motiv), falls die Datei fehlt.
 * Kein next/image: statischer Export, Bilder liegen bereits in passender Größe vor.
 */
export function Photo({
  src,
  alt,
  className,
  imgClassName,
  priority,
}: {
  /** Schlüssel aus content/images.json oder Pfad */
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const entry = resolveImage(src);
  const text = alt ?? entry.alt;
  return (
    <div className={cn('@container relative overflow-hidden bg-cream-200', className)}>
      {failed ? (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(70%_60%_at_30%_20%,#f1d49c,transparent),linear-gradient(160deg,#efe4d2,#d9a54a)] p-6 text-center font-serif text-lg italic text-honey-950/70">
          {entry.motif || text}
        </div>
      ) : (
        <img
          src={withBase(entry.src)}
          alt={text}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      )}
      <ImageBadge keyOrSrc={src} />
    </div>
  );
}
