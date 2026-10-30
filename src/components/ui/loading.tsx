import { FlowerOfLife } from '@/components/brand/flower-of-life';
import { cn } from '@/lib/cn';

/**
 * Ladezustand mit der Blume des Lebens (dreht langsam, atmet). Ersetzt alle Spinner.
 * Barrierefrei: role="status", aria-live="polite"; den ladenden Bereich zusätzlich mit aria-busy markieren.
 */
export function Loading({
  label = 'Lädt …',
  size = 56,
  variant = 'light',
  showLabel = true,
  className,
}: {
  label?: string;
  size?: number;
  variant?: 'light' | 'dark';
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" className={cn('flex flex-col items-center justify-center gap-4 py-12', className)}>
      <FlowerOfLife size={size} variant={variant} animate="pulse" />
      <span className={cn('text-sm', showLabel ? (variant === 'dark' ? 'text-cream-100/70' : 'text-muted') : 'sr-only')}>{label}</span>
    </div>
  );
}

/** Kleine Blume in Buttons beim Absenden */
export function InlineLoading({ variant = 'dark', label = 'Wird gesendet …' }: { variant?: 'light' | 'dark'; label?: string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2">
      <FlowerOfLife size={18} variant={variant} animate="pulse" />
      <span>{label}</span>
    </span>
  );
}
