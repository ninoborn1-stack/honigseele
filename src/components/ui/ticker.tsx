import Link from 'next/link';
import { Marquee } from './motion';

/** Dezentes Laufband wie auf der Startseite: feine Linien, kleine Versalien, viel Luft. Optional verlinkt. */
export function TickerBand({ items, className }: { items: { label: string; href?: string }[]; className?: string }) {
  return (
    <div className={`border-y border-line-soft bg-cream-50 py-4 text-muted ${className ?? ''}`}>
      <Marquee
        speed={70}
        items={items.map((it) =>
          it.href ? (
            <Link key={it.label} href={it.href} data-label={it.label} className="whitespace-nowrap px-6 text-[0.72rem] font-medium uppercase tracking-[0.32em] transition-colors hover:text-honey-950">
              {it.label}
            </Link>
          ) : (
            <span key={it.label} className="whitespace-nowrap px-6 text-[0.72rem] font-medium uppercase tracking-[0.32em]">
              {it.label}
            </span>
          ),
        )}
      />
    </div>
  );
}
