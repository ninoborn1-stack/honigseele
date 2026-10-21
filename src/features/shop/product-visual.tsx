import type { Product, Tone } from '@/domain/types';
import { cn } from '@/lib/cn';

// Platzhalter-Darstellung der Pflegeserie: Tiegel, Flasche oder Tube als feine Linienzeichnung
// auf getönter Fläche. Wird durch echte Produktfotos ersetzt (docs/PLATZHALTER.md).
const surfaces: Record<Tone, string> = {
  honey: 'bg-[radial-gradient(80%_70%_at_30%_20%,#f1d49c,#e6bd6e)]',
  cream: 'bg-[radial-gradient(80%_70%_at_30%_20%,#fbf7f0,#e6d6bc)]',
  amber: 'bg-[radial-gradient(80%_70%_at_30%_20%,#e6bd6e,#b87a1e)]',
  sand: 'bg-[radial-gradient(80%_70%_at_30%_20%,#efe4d2,#cdb894)]',
  sage: 'bg-[radial-gradient(80%_70%_at_30%_20%,#e5e7d6,#c9cdb4)]',
};
const ink: Record<Tone, string> = {
  honey: 'text-honey-950',
  cream: 'text-amber-800',
  amber: 'text-cream-50',
  sand: 'text-honey-950',
  sage: 'text-honey-950',
};

type Shape = 'jar' | 'bottle' | 'tube' | 'dropper';

function shapeOf(product: Product): Shape {
  const n = product.name.toLowerCase();
  if (/serum|öl|augengel/.test(n)) return 'dropper';
  if (/wasser|gel/.test(n)) return 'bottle';
  if (/balsam|handzahm/.test(n)) return 'tube';
  return 'jar';
}

function Shape({ shape }: { shape: Shape }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, vectorEffect: 'non-scaling-stroke' as const };
  switch (shape) {
    case 'bottle':
      return (
        <g {...common}>
          <rect x="40" y="18" width="20" height="12" rx="2" />
          <path d="M36 30h28v6c8 4 10 10 10 18v42a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6V54c0-8 2-14 10-18z" />
          <path d="M30 64h40M30 84h40" opacity="0.5" />
        </g>
      );
    case 'dropper':
      return (
        <g {...common}>
          <path d="M46 8c0-3 8-3 8 0v14h-8z" />
          <rect x="40" y="22" width="20" height="12" rx="2" />
          <path d="M34 34h32v8c6 2 8 6 8 12v42a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6V54c0-6 2-10 8-12z" />
          <path d="M50 34v38" opacity="0.5" />
          <path d="M30 70h40" opacity="0.5" />
        </g>
      );
    case 'tube':
      return (
        <g {...common}>
          <path d="M34 16h32l-3 70H37z" />
          <rect x="38" y="86" width="24" height="16" rx="3" />
          <path d="M36 30h28M38 50h24" opacity="0.5" />
        </g>
      );
    default:
      return (
        <g {...common}>
          <rect x="22" y="40" width="56" height="14" rx="4" />
          <path d="M24 54h52v34a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8z" />
          <path d="M30 70h40" opacity="0.5" />
        </g>
      );
  }
}

export function ProductVisual({ product, className, large }: { product: Product; className?: string; large?: boolean }) {
  return (
    <div className={cn('relative grid place-items-center overflow-hidden', surfaces[product.tone], ink[product.tone], className)}>
      <svg viewBox="0 0 100 110" className={cn(large ? 'h-[58%]' : 'h-[62%]', 'w-auto drop-shadow-[0_18px_24px_rgba(43,33,24,0.12)]')} aria-hidden>
        <Shape shape={shapeOf(product)} />
      </svg>
      <span className="absolute bottom-4 left-0 right-0 text-center font-serif text-sm italic opacity-70">Honigseele</span>
    </div>
  );
}
