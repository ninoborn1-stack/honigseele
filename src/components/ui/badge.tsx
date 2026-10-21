import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { DEMO } from '@/lib/config';

export function Badge({
  children,
  tone = 'line',
  className,
}: {
  children: ReactNode;
  tone?: 'line' | 'honey' | 'dark' | 'success' | 'danger';
  className?: string;
}) {
  const tones = {
    line: 'border border-line text-muted',
    honey: 'bg-honey-200 text-honey-950',
    dark: 'bg-honey-950 text-cream-50',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Markiert Inhalte, die noch von Anna kommen. Nur im Demo-Modus sichtbar.
 * Alle Stellen sind in docs/PLATZHALTER.md gesammelt (Suche nach "<Placeholder").
 */
export function Placeholder({ label = 'Platzhalter', className }: { label?: string; className?: string }) {
  if (!DEMO) return null;
  return (
    <span
      title="Inhalt folgt von der Honigseele"
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-dashed border-amber-600/60 bg-cream-50/80 px-2 py-0.5 align-middle font-sans text-[0.65rem] font-medium uppercase not-italic tracking-[0.14em] text-amber-800 backdrop-blur',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
      {label}
    </span>
  );
}
