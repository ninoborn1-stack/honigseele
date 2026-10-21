import { cn } from '@/lib/cn';
import { formatEuro } from '@/lib/format';

/** Gutscheinkarte: Vorschau beim Gestalten und Anzeige der erzeugten Codes */
export function VoucherCard({
  title,
  valueCents,
  recipient,
  message,
  code,
  validUntil,
  className,
}: {
  title: string;
  valueCents: number;
  recipient?: string;
  message?: string;
  code?: string;
  validUntil?: string;
  className?: string;
}) {
  return (
    <div className={cn('honey-glow on-dark relative aspect-[1.6/1] w-full overflow-hidden rounded-[1.75rem] p-6 text-cream-50 shadow-xl shadow-honey-950/20 sm:p-8', className)}>
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-honey-300/20" />
      <div aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full border border-honey-300/15" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <p className="font-serif text-2xl leading-none">
            <em className="text-honey-300">Honig</em>seele
          </p>
          <p className="eyebrow !text-[0.62rem]">{title}</p>
        </div>
        <div>
          {recipient && <p className="text-sm text-cream-100/75">für {recipient}</p>}
          <p className="font-serif text-5xl leading-none sm:text-6xl">{formatEuro(valueCents)}</p>
          {message && <p className="mt-2 line-clamp-2 font-serif text-lg italic text-cream-100/85">„{message}“</p>}
        </div>
        <div className="flex items-end justify-between gap-4 border-t border-cream-50/15 pt-3 text-xs">
          <span className="font-mono tracking-[0.2em] text-honey-300">{code ?? 'HS-••••-••••'}</span>
          <span className="text-cream-100/60">{validUntil ? `gültig bis ${validUntil}` : 'Hornstraße 1 · Berlin'}</span>
        </div>
      </div>
    </div>
  );
}
