import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { RevealHeading } from './motion';

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('eyebrow flex items-center gap-3', className)}>
      <span className="h-px w-8 bg-current opacity-60" />
      {children}
    </p>
  );
}

const sizes = {
  display: 'text-[clamp(3.4rem,9vw,10rem)] leading-[0.92] tracking-[-0.025em]',
  h1: 'text-[clamp(3rem,7.5vw,8rem)] leading-[0.95] tracking-[-0.02em]',
  h2: 'text-[clamp(2.5rem,5.6vw,6.2rem)] leading-[0.98] tracking-[-0.015em]',
  h3: 'text-[clamp(1.8rem,3vw,3rem)] leading-[1.05]',
};

/** Überschrift mit Wort-für-Wort-Einblendung; *Wort* = kursiver Akzent */
export function Title({
  as = 'h2',
  size,
  children,
  className,
}: {
  as?: 'h1' | 'h2' | 'h3';
  size?: keyof typeof sizes;
  children: string;
  className?: string;
}) {
  return <RevealHeading as={as} text={children} className={cn(sizes[size ?? as], className)} />;
}

export function Section({
  children,
  className,
  id,
  tone = 'cream',
  bleed,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: 'cream' | 'cream2' | 'dark' | 'light';
  /** ohne Innenabstand links/rechts */
  bleed?: boolean;
}) {
  const tones = {
    cream: 'bg-cream-50',
    cream2: 'bg-cream-100',
    dark: 'honey-glow text-cream-50 on-dark',
    light: 'honey-light',
  };
  return (
    <section id={id} className={cn('py-24 md:py-36', tones[tone], className)}>
      <div className={bleed ? '' : 'wrap'}>{children}</div>
    </section>
  );
}

export function Rule({ className }: { className?: string }) {
  return <hr className={cn('border-t border-line', className)} />;
}

/** Nummerierung in Serif mit feiner Linie */
export function Numeral({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn('flex items-center gap-3 font-serif text-lg text-amber-800', className)}>
      {String(n).padStart(2, '0')}
      <span className="h-px w-8 bg-line" />
    </span>
  );
}
