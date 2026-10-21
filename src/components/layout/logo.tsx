import { cn } from '@/lib/cn';

/** Platzhalter-Wortmarke. Wird durch das Original-Logo von Anna ersetzt (docs/PLATZHALTER.md). */
export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn('inline-flex items-baseline font-serif text-[1.7rem] leading-none tracking-tight', light ? 'text-cream-50' : 'text-honey-950', className)}>
      <em className={cn('not-italic', light ? 'text-honey-300' : 'text-amber-600')} style={{ fontStyle: 'italic' }}>
        Honig
      </em>
      seele
    </span>
  );
}
