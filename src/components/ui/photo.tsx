'use client';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { withBase } from '@/lib/config';

/**
 * Bild mit stilvollem Platzhalter (Honig-Verlauf + Motivbeschreibung), falls die Datei fehlt.
 * Kein next/image: statischer Export, Bilder liegen bereits in passender Größe vor.
 */
export function Photo({
  src,
  alt,
  className,
  imgClassName,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn('relative overflow-hidden bg-cream-200', className)}>
      {failed ? (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(70%_60%_at_30%_20%,#f1d49c,transparent),linear-gradient(160deg,#efe4d2,#d9a54a)] p-6 text-center font-serif text-lg italic text-honey-950/70">
          {alt}
        </div>
      ) : (
        <img
          src={withBase(src)}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      )}
    </div>
  );
}
