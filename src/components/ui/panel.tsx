import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Großes Panel im Stil der Behandlungs-Übersicht: oben stark gerundet, leicht eingerückt,
 * hell (cream) oder dunkel (Honig). Für Teaser und Split-Inhalte.
 */
export function Panel({ children, dark, className, id }: { children: ReactNode; dark?: boolean; className?: string; id?: string }) {
  return (
    <section id={id} className={cn('px-[clamp(0.75rem,1.6vw,1.75rem)]', className)}>
      <div className={cn('overflow-hidden rounded-t-[2.5rem] rounded-b-[1.5rem] md:rounded-t-[4rem]', dark ? 'honey-glow on-dark text-cream-50' : 'bg-cream-100 text-honey-950')}>{children}</div>
    </section>
  );
}

/** Große Nummer in Honiggold wie auf der Behandlungs-Seite */
export function BigNumeral({ n, dark, className }: { n: number; dark?: boolean; className?: string }) {
  return <span className={cn('font-serif leading-[0.8]', dark ? 'text-honey-300/80' : 'text-honey-400', className)}>{String(n).padStart(2, '0')}</span>;
}
