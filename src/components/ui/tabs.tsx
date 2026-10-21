'use client';
import { cn } from '@/lib/cn';

export function Tabs<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string }) {
  return (
    <div role="tablist" className={cn('no-scrollbar flex gap-1 overflow-x-auto', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'min-h-11 shrink-0 rounded-full px-5 text-sm transition-colors',
            value === o.value ? 'bg-honey-950 text-cream-50' : 'text-muted hover:bg-cream-100',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
