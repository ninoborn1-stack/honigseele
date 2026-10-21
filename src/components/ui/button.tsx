import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'honey' | 'ghost' | 'light' | 'link';
const styles: Record<Variant, string> = {
  primary: 'bg-honey-950 text-cream-50 hover:bg-honey-800',
  honey: 'bg-honey-400 text-honey-950 hover:bg-honey-300',
  ghost: 'border border-honey-950/25 text-honey-950 hover:border-honey-950 hover:bg-honey-950 hover:text-cream-50',
  light: 'border border-cream-50/40 text-cream-50 hover:bg-cream-50 hover:text-honey-950 hover:border-cream-50',
  link: 'text-amber-800 underline decoration-line underline-offset-[6px] hover:decoration-amber-800 !px-0 !min-h-0',
};

const base =
  'group/btn inline-flex min-h-11 items-center whitespace-nowrap justify-center gap-2 rounded-full px-6 text-[0.95rem] font-medium tracking-wide transition-colors duration-300 disabled:pointer-events-none disabled:opacity-40';

interface Common {
  variant?: Variant;
  size?: 'md' | 'lg' | 'sm';
  className?: string;
  /** Pfeil, der beim Hover nach rechts gleitet */
  arrow?: boolean;
  children: ReactNode;
}
const sizes = { sm: 'min-h-10 px-4 text-sm', md: '', lg: 'min-h-14 px-8 text-base' };

const Arrow = () => (
  <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-soft)] group-hover/btn:translate-x-1" strokeWidth={1.5} />
);

export function Button({ variant = 'primary', size = 'md', className, arrow, children, ...props }: Common & ComponentProps<'button'>) {
  return (
    <button className={cn(base, styles[variant], sizes[size], className)} {...props}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  href,
  arrow,
  children,
  ...props
}: Common & Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const cls = cn(base, styles[variant], sizes[size], className);
  if (/^(https?:|mailto:|tel:)/.test(href))
    return (
      <a href={href} className={cls} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {children}
        {arrow && <Arrow />}
      </a>
    );
  return (
    <Link href={href} className={cls} {...props}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

/**
 * Text-CTA: klare Beschriftung + runder Pfeil-Knopf, der sich beim Hover füllt.
 * Für sekundäre Wege wie „Wer wir sind“ oder „Alle Behandlungen“.
 */
export function ArrowLink({
  href,
  children,
  light,
  className,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href'> & { href: string; children: ReactNode; light?: boolean; className?: string }) {
  return (
    <Link
      href={href}
      className={cn('group/arrow inline-flex min-h-12 items-center gap-4 text-[0.82rem] font-medium uppercase tracking-[0.18em]', light ? 'text-cream-50' : 'text-honey-950', className)}
      {...props}
    >
      <span className="relative">
        {children}
        <span className={cn('absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 transition-transform duration-500 ease-[var(--ease-soft)] group-hover/arrow:origin-left group-hover/arrow:scale-x-100', light ? 'bg-cream-50' : 'bg-honey-950')} />
      </span>
      <span
        className={cn(
          'grid h-12 w-12 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-soft)]',
          light ? 'border-cream-50/40 group-hover/arrow:border-honey-300 group-hover/arrow:bg-honey-300 group-hover/arrow:text-honey-950' : 'border-honey-950/25 group-hover/arrow:border-honey-950 group-hover/arrow:bg-honey-950 group-hover/arrow:text-cream-50',
        )}
      >
        <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover/arrow:rotate-45" strokeWidth={1.5} />
      </span>
    </Link>
  );
}
