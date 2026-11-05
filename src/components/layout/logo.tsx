import brand from '@content/brand.json';
import { cn } from '@/lib/cn';
import { withBase } from '@/lib/config';

/**
 * Logo-Slot: liest aus content/brand.json. Solange das Original fehlt, dezente Wortmarke
 * in Cormorant Garamond. Original-Logo über content/brand.json.
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
    </span>
  );
}
