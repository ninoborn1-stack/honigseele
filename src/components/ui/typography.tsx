import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('eyebrow', className)}>{children}</p>;
}

/** Überschrift mit optionalem kursivem Akzentwort: title="Zeit für *Dich*" */
export function Title({
  as: Tag = 'h2',
  children,
  className,
}: {
  as?: 'h1' | 'h2' | 'h3';
  children: string;
  className?: string;
}) {
  const parts = children.split(/\*(.+?)\*/g);
  return (
    <Tag className={cn(Tag === 'h1' ? 'text-5xl md:text-7xl' : Tag === 'h2' ? 'text-4xl md:text-6xl' : 'text-2xl md:text-3xl', className)}>
      {parts.map((p, i) => (i % 2 ? <em key={i}>{p}</em> : p))}
    </Tag>
  );
}

export function Section({
  children,
  className,
  id,
  tone = 'cream',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: 'cream' | 'cream2' | 'dark' | 'light';
}) {
  const tones = {
    cream: 'bg-cream-50',
    cream2: 'bg-cream-100',
    dark: 'honey-glow text-cream-50 on-dark',
    light: 'honey-light',
  };
  return (
    <section id={id} className={cn('px-5 py-20 md:px-10 md:py-28', tones[tone], className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
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
