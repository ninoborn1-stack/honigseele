'use client';
// Großzügiges FAQ-Akkordeon mit weichem Aufklappen (Grid-Rows-Trick, keine feste Höhe nötig).
import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/cn';

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <ul className="border-t border-honey-950/20">
      {items.map((item, i) => {
        const on = open === i;
        return (
          <li key={item.q} className="border-b border-honey-950/20">
            <button
              id={`${id}-q${i}`}
              aria-expanded={on}
              aria-controls={`${id}-a${i}`}
              onClick={() => setOpen(on ? null : i)}
              className="group flex min-h-20 w-full items-center justify-between gap-8 py-7 text-left"
            >
              <span className={cn('font-serif text-[clamp(1.5rem,2.4vw,2.4rem)] leading-tight transition-colors duration-300', on ? 'text-amber-600' : 'group-hover:text-amber-600')}>{item.q}</span>
              <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-soft)]', on ? 'rotate-45 border-honey-950 bg-honey-950 text-cream-50' : 'border-honey-950/25')}>
                <Plus className="h-5 w-5" strokeWidth={1.5} />
              </span>
            </button>
            <div
              id={`${id}-a${i}`}
              role="region"
              aria-labelledby={`${id}-q${i}`}
              className={cn('grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-soft)]', on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl pb-8 text-lg leading-relaxed text-muted">{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
