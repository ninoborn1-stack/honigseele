'use client';
// Schnellsuche über alle Leistungen: wer direkt „Achseln“ sucht, ist mit zwei Klicks im Buchungs-Flow.
import { ArrowUpRight, CalendarPlus, Clock, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Category, Service } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatDuration, formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';

const suggestions = ['Achseln', 'Beine komplett', 'Bikini', 'Hot Stone', 'Spa-Pediküre', 'Lash Lifting'];

export function ServiceSearch({ initialServices, categories }: { initialServices: Service[]; categories: Category[] }) {
  const { data: services = initialServices } = useData((db) => db.listServices(), [], initialServices);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (q.length < 2) return [];
    return services
      .filter((s) => s.active && s.bookable)
      .filter((s) => {
        const cat = categories.find((c) => c.id === s.categoryId)?.name ?? '';
        return `${s.name} ${s.group ?? ''} ${cat} ${s.description ?? ''}`.toLowerCase().includes(q);
      })
      .slice(0, 12);
  }, [services, categories, q]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-amber-800 md:left-8" strokeWidth={1.5} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Achseln, Hot Stone, Pediküre …"
          aria-label="Behandlung suchen"
          className="min-h-20 w-full rounded-full border border-honey-950/20 bg-card pl-16 pr-16 font-serif text-[clamp(1.3rem,2.2vw,2rem)] text-honey-950 shadow-[0_20px_60px_-30px_rgb(43_33_24/0.35)] placeholder:text-muted/50 focus:border-amber-600 focus:outline-none md:min-h-24 md:pl-20 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Suche leeren" className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full hover:bg-cream-100 md:right-6">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {q.length < 2 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">Oft gesucht</span>
          {suggestions.map((s) => (
            <button key={s} onClick={() => setQuery(s)} className="min-h-11 rounded-full border border-honey-950/15 px-5 text-sm transition-colors hover:border-honey-950 hover:bg-honey-950 hover:text-cream-50">
              {s}
            </button>
          ))}
        </div>
      )}

      {q.length >= 2 && (
        <div className="mt-6 overflow-hidden rounded-[2rem] border border-honey-950/10 bg-card" aria-live="polite">
          {results.length === 0 ? (
            <p className="p-8 text-center font-serif text-2xl text-muted">Dazu haben wir nichts gefunden. Versuch es mit einem anderen Wort.</p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {results.map((s, i) => {
                const cat = categories.find((c) => c.id === s.categoryId);
                return (
                  <li key={s.id} className="animate-rise" style={{ animationDelay: `${i * 35}ms` }}>
                    <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 xl:grid-cols-[1fr_7rem_7rem_auto] md:px-8">
                      <div>
                        <p className="font-serif text-2xl leading-tight">{s.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">
                          {cat?.name}
                          {s.group && s.group !== cat?.name ? ` · ${s.group}` : ''}
                        </p>
                      </div>
                      <p className="hidden items-center gap-1.5 text-sm text-muted xl:flex">
                        <Clock className="h-4 w-4" strokeWidth={1.5} />
                        {formatDuration(s.durationMin)}
                      </p>
                      <p className="hidden text-right font-serif text-2xl xl:block">{s.isConsultation && s.priceCents === 0 ? 'inklusive' : formatEuro(s.priceCents, { from: s.priceFrom })}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-xl xl:hidden">{formatEuro(s.priceCents, { from: s.priceFrom })}</span>
                        <Link href={`/behandlungen/${s.categoryId}/`} aria-label={`${cat?.name} ansehen`} className={cn('hidden h-11 w-11 place-items-center rounded-full border border-honey-950/20 transition-colors hover:border-honey-950 sm:grid', !cat?.inTreatments && '!hidden')}>
                          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                        </Link>
                        <Link href={`/buchen/?leistung=${s.id}`} data-label="Buchen" aria-label={`${s.name} buchen`} className="grid h-11 w-11 place-items-center rounded-full bg-honey-950 text-honey-300 transition-colors hover:bg-amber-600 hover:text-cream-50">
                          <CalendarPlus className="h-4 w-4" strokeWidth={1.5} />
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
