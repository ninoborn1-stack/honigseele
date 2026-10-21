import { Plus } from 'lucide-react';

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 font-serif text-xl md:text-2xl [&::-webkit-details-marker]:hidden">
            {item.q}
            <Plus strokeWidth={1.5} className="h-5 w-5 shrink-0 text-amber-800 transition-transform duration-300 group-open:rotate-45" />
          </summary>
          <p className="max-w-2xl pb-6 text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
