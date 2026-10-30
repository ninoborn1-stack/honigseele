import brand from '@content/brand.json';
import { cn } from '@/lib/cn';
import { DEMO, withBase } from '@/lib/config';

/**
 * Logo-Slot: liest aus content/brand.json. Solange das Original fehlt, dezente Wortmarke
 * in Cormorant Garamond – im Demo-Modus mit kleinem Platzhalter-Punkt.
 * Das Logo wird nie verzerrt, umgefärbt oder animiert.
 */
export function Logo({ className, light }: { className?: string; light?: boolean }) {
  const src = light ? (brand.logo.srcLight ?? brand.logo.src) : brand.logo.src;
  if (src)
    return (
      <img
        src={withBase(src)}
        alt={brand.name}
        width={brand.logo.width ?? undefined}
        height={brand.logo.height ?? undefined}
        className={cn('h-[1em] w-auto max-w-none object-contain', className)}
        style={{ fontSize: 'inherit' }}
      />
    );
  return (
    <span className={cn('relative inline-flex items-baseline font-serif text-[1.7rem] leading-none tracking-tight', light ? 'text-cream-50' : 'text-honey-950', className)}>
      <em className={cn('not-italic', light ? 'text-honey-300' : 'text-amber-600')} style={{ fontStyle: 'italic' }}>
        Honig
      </em>
      seele
      {DEMO && brand.placeholder && <span title="Platzhalter: Original-Logo folgt" className="absolute -right-2 top-0 h-1.5 w-1.5 rounded-full bg-amber-600/70" />}
    </span>
  );
}
