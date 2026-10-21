'use client';
import { Check, Info, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Placeholder } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/form';
import { laserGate } from '@/domain/slots';
import type { Category, Service } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatDuration, formatEuro } from '@/lib/format';
import type { BookingDraft } from './booking-state';

export function StepServices({
  draft,
  setDraft,
  services,
  categories,
  consultationDone,
  initialCategory,
}: {
  draft: BookingDraft;
  setDraft: (d: BookingDraft) => void;
  services: Service[];
  categories: Category[];
  consultationDone: boolean;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState('');
  const bookableCats = categories.filter((c) => services.some((s) => s.categoryId === c.id && s.bookable && s.active));
  const [cat, setCat] = useState<string>(initialCategory ?? (draft.serviceIds[0] ? services.find((s) => s.id === draft.serviceIds[0])?.categoryId : undefined) ?? bookableCats[0]?.id ?? 'waxing');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => s.bookable && s.active && (q ? `${s.name} ${s.group ?? ''} ${s.description ?? ''}`.toLowerCase().includes(q) : s.categoryId === cat));
  }, [services, cat, query]);
  const groups = [...new Set(list.map((s) => (query ? categories.find((c) => c.id === s.categoryId)?.name : s.group) ?? 'Leistungen'))];

  const selected = draft.serviceIds.map((id) => services.find((s) => s.id === id)).filter((s): s is Service => Boolean(s));
  const gate = laserGate(selected, consultationDone);
  const hasReduced = selected.some((s) => s.reducedPriceCents);

  const toggle = (id: string) => {
    const has = draft.serviceIds.includes(id);
    setDraft({ ...draft, serviceIds: has ? draft.serviceIds.filter((x) => x !== id) : [...draft.serviceIds, id], slot: undefined });
  };

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.5} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchen, z. B. Achseln, Hot Stone, Pediküre"
          className="min-h-12 w-full rounded-full border border-line bg-card pl-11 pr-4 text-base focus:border-amber-600 focus:outline-none"
          aria-label="Leistung suchen"
        />
      </div>
      {!query && (
        <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
          {bookableCats.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn('min-h-10 shrink-0 rounded-full border px-4 text-sm transition-colors', cat === c.id ? 'border-honey-950 bg-honey-950 text-cream-50' : 'border-line text-muted hover:border-honey-950')}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {!gate.ok && (
        <div className="mt-6 flex gap-3 rounded-2xl border border-honey-400 bg-honey-200/40 p-4 text-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" strokeWidth={1.5} />
          <div>
            <p>{gate.reason}</p>
            <Button
              size="sm"
              className="mt-3"
              onClick={() =>
                setDraft({
                  ...draft,
                  serviceIds: ['laser-vorgespraech'],
                  note: `Interesse an: ${selected.filter((s) => s.requiresConsultation).map((s) => s.name).join(', ')}`,
                })
              }
            >
              Stattdessen Vorgespräch buchen
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-8">
        {groups.map((g) => (
          <div key={g}>
            <p className="eyebrow mb-2">{g}</p>
            <ul className="divide-y divide-line-soft border-y border-line-soft">
              {list
                .filter((s) => ((query ? categories.find((c) => c.id === s.categoryId)?.name : s.group) ?? 'Leistungen') === g)
                .map((s) => {
                  const on = draft.serviceIds.includes(s.id);
                  return (
                    <li key={s.id}>
                      <button onClick={() => toggle(s.id)} aria-pressed={on} className="flex min-h-16 w-full items-center gap-4 py-3 text-left">
                        <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors', on ? 'border-honey-950 bg-honey-950 text-honey-300' : 'border-line')}>
                          {on && <Check className="h-3.5 w-3.5" strokeWidth={2} />}
                        </span>
                        <span className="flex-1">
                          <span className="block">
                            {s.name} {s.isPlaceholder && <Placeholder className="ml-1" />}
                          </span>
                          <span className="block text-xs text-muted">
                            {formatDuration(s.durationMin)}
                            {s.audience !== 'alle' && ` · ${s.audience === 'damen' ? 'Damen' : 'Herren'}`}
                            {s.requiresConsultation && ' · nach Vorgespräch'}
                          </span>
                        </span>
                        <span className="font-serif text-xl">{s.isConsultation && s.priceCents === 0 ? 'inkl.' : formatEuro(draft.reduced && s.reducedPriceCents ? s.reducedPriceCents : s.priceCents, { from: s.priceFrom })}</span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
        {list.length === 0 && <p className="py-10 text-center text-muted">Nichts gefunden. Versuch es mit einem anderen Wort.</p>}
      </div>

      {hasReduced && (
        <Checkbox
          className="mt-6"
          checked={draft.reduced}
          onChange={(e) => setDraft({ ...draft, reduced: e.target.checked })}
          label="Ich bin Schüler*in oder studiere (Nachweis bitte zum Termin mitbringen)"
        />
      )}
    </div>
  );
}
