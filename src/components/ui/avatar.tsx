import type { Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

const tones: Record<Tone, string> = {
  honey: 'bg-[radial-gradient(circle_at_30%_25%,#f1d49c,#d9a54a)] text-honey-950',
  cream: 'bg-[radial-gradient(circle_at_30%_25%,#fbf7f0,#e6d6bc)] text-honey-950',
  amber: 'bg-[radial-gradient(circle_at_30%_25%,#d9a54a,#8a5a12)] text-cream-50',
  sand: 'bg-[radial-gradient(circle_at_30%_25%,#efe4d2,#cdb894)] text-honey-950',
  sage: 'bg-[radial-gradient(circle_at_30%_25%,#e5e7d6,#c9cdb4)] text-honey-950',
};

export function Avatar({ name, tone, size = 'md', className }: { name: string; tone: Tone; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-10 w-10 text-sm', md: 'h-16 w-16 text-xl', lg: 'h-28 w-28 text-4xl' };
  return (
    <span
      aria-hidden
      className={cn('inline-grid shrink-0 place-items-center rounded-full font-serif', tones[tone], sizes[size], className)}
    >
      {initials(name)}
    </span>
  );
}
