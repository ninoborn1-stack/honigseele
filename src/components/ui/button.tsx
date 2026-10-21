import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'honey' | 'ghost' | 'light' | 'link';
const styles: Record<Variant, string> = {
  primary: 'bg-honey-950 text-cream-50 hover:bg-honey-800',
  honey: 'bg-honey-400 text-honey-950 hover:bg-honey-300',
  ghost: 'border border-honey-950/25 text-honey-950 hover:border-honey-950 hover:bg-honey-950/[0.03]',
  light: 'border border-cream-50/40 text-cream-50 hover:bg-cream-50/10 hover:border-cream-50',
  link: 'text-amber-800 underline decoration-line underline-offset-[6px] hover:decoration-amber-800 !px-0 !min-h-0',
};

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-medium tracking-wide transition-colors duration-300 disabled:pointer-events-none disabled:opacity-40';

interface Common {
  variant?: Variant;
  size?: 'md' | 'lg' | 'sm';
  className?: string;
  children: ReactNode;
}
const sizes = { sm: 'min-h-10 px-4 text-sm', md: '', lg: 'min-h-13 px-8 text-base' };

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: Common & ComponentProps<'button'>) {
  return <button className={cn(base, styles[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  href,
  ...props
}: Common & Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const external = /^(https?:|mailto:|tel:)/.test(href);
  if (external)
    return (
      <a
        href={href}
        className={cn(base, styles[variant], sizes[size], className)}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel="noreferrer"
      >
        {props.children}
      </a>
    );
  return <Link href={href} className={cn(base, styles[variant], sizes[size], className)} {...props} />;
}
