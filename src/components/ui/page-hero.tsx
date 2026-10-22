import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Parallax, RevealHeading } from './motion';
import { Photo } from './photo';
import { Eyebrow } from './typography';

/**
 * Seitenkopf im Stil von „Über uns“: Bild über volle Breite, dunkler Verlauf, großer Titel unten links.
 * Höhe begrenzt, damit das Bild auf großen Bildschirmen nicht ausufert; mobil wächst er mit dem Inhalt.
 */
export function PageHero({
  image,
  alt,
  eyebrow,
  title,
  lead,
  actions,
  imageClassName,
}: {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  lead: string;
  actions?: ReactNode;
  /** z. B. object-[50%_30%], um den Bildausschnitt zu steuern */
  imageClassName?: string;
}) {
  return (
    <section className="relative flex min-h-[520px] items-end overflow-hidden bg-honey-950 text-cream-50 md:h-[calc(88svh-var(--top-h,96px))] md:max-h-[860px] md:min-h-[600px]">
      <Parallax speed={-0.12} className="absolute -inset-y-[8%] inset-x-0">
        <Photo src={image} alt={alt} priority className="h-full w-full !bg-honey-950" imgClassName={cn('animate-fade', imageClassName)} />
      </Parallax>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgb(28_21_15/0.94)_0%,rgb(28_21_15/0.66)_42%,rgb(28_21_15/0.4)_72%,rgb(28_21_15/0.6)_100%)]" />
      <div className="wrap relative pb-10 pt-32 md:pb-16 md:pt-40">
        <Eyebrow className="!text-honey-300">{eyebrow}</Eyebrow>
        <RevealHeading as="h1" onLoad text={title} className="mt-6 max-w-[11ch] font-serif text-[clamp(2.8rem,9vw,10rem)] leading-[0.9] tracking-[-0.03em]" />
        <div className="mt-8 grid gap-7 md:mt-10 md:grid-cols-[1fr_auto] md:items-end">
          <p className="max-w-xl text-base text-cream-100/90 sm:text-lg md:text-xl">{lead}</p>
          {actions && <div className="flex flex-wrap items-center gap-x-8 gap-y-3">{actions}</div>}
        </div>
      </div>
    </section>
  );
}
