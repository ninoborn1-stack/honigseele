'use client';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { getAdapter } from '@/data';
import { quote } from '@/domain/pricing';
import type { Slot } from '@/domain/slots';
import { addDaysToDate, berlinDate, berlinToISO, inBerlin } from '@/domain/time';
import type { Service, Staff, StaffService } from '@/domain/types';
import { cn } from '@/lib/cn';
import { berlinTime, formatDateLong, formatEuro } from '@/lib/format';
import { staffForAll, type BookingDraft } from './booking-state';

export function StepStaff({
  draft,
  setDraft,
  services,
  staff,
  staffServices,
  onNext,
}: {
  draft: BookingDraft;
  setDraft: (d: BookingDraft) => void;
  services: Service[];
  staff: Staff[];
  staffServices: StaffService[];
  onNext: () => void;
}) {
  const selected = draft.serviceIds.map((id) => services.find((s) => s.id === id)).filter((s): s is Service => Boolean(s));
  const ids = staffForAll(draft.serviceIds, staffServices);
  const people = staff.filter((s) => ids.includes(s.id) && s.bookable);
  const priceWith = (staffId?: string) => quote(selected.map((service) => ({ service, staffId })), staffServices, { reduced: draft.reduced }).totalCents;
  const choose = (staffId?: string) => {
    setDraft({ ...draft, staffId, slot: undefined });
    onNext();
  };
  return (
    <div>
      {people.length === 0 && (
        <p className="mb-4 rounded-2xl bg-cream-100 p-4 text-sm text-muted">
          Deine Auswahl teilen sich mehrere Honigseelen. Wir legen die Behandlungen nacheinander und wählen passend für Dich.
        </p>
      )}
      <ul className="space-y-3">
        <li>
          <button onClick={() => choose(undefined)} className={cn('flex min-h-20 w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors', !draft.staffId ? 'border-honey-950 bg-card' : 'border-line hover:border-honey-950')}>
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-honey-950 text-honey-300">
              <Sparkles strokeWidth={1.5} />
            </span>
            <span className="flex-1">
              <span className="block font-serif text-2xl">Egal, erste Freie</span>
              <span className="text-sm text-muted">Die meisten freien Termine</span>
            </span>
            <span className="font-serif text-xl">ab {formatEuro(Math.min(priceWith(undefined), ...people.map((p) => priceWith(p.id))))}</span>
          </button>
        </li>
        {people.map((p) => (
          <li key={p.id}>
            <button onClick={() => choose(p.id)} className={cn('flex min-h-20 w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors', draft.staffId === p.id ? 'border-honey-950 bg-card' : 'border-line hover:border-honey-950')}>
              <Avatar name={p.name} tone={p.avatarTone} />
              <span className="flex-1">
                <span className="block font-serif text-2xl">{p.name}</span>
                <span className="text-sm text-muted">{p.title ?? p.role}</span>
                <span className="block text-xs text-muted">{p.languages.join(' · ')}</span>
              </span>
              <span className="font-serif text-xl">{formatEuro(priceWith(p.id))}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StepTime({
  draft,
  setDraft,
  staff,
  ignoreBookingId,
}: {
  draft: BookingDraft;
  setDraft: (d: BookingDraft) => void;
  staff: Staff[];
  ignoreBookingId?: string;
}) {
  const today = berlinDate(new Date());
  const days = useMemo(() => Array.from({ length: 35 }, (_, i) => addDaysToDate(today, i)), [today]);
  const [date, setDate] = useState(draft.date ?? today);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const strip = useRef<HTMLDivElement>(null);

  // Verfügbarkeit für die Tagesleiste (Punkte unter den Tagen)
  useEffect(() => {
    let alive = true;
    Promise.all(
      days.slice(0, 21).map((d) =>
        getAdapter()
          .findSlots({ date: d, serviceIds: draft.serviceIds, staffId: draft.staffId, reduced: draft.reduced, notBefore: new Date(Date.now() + 60 * 60_000), ignoreBookingId })
          .then((s) => [d, s.length] as const),
      ),
    ).then((rows) => {
      if (!alive) return;
      const map = Object.fromEntries(rows);
      setAvailability(map);
      if (!draft.date) {
        const first = rows.find(([, n]) => n > 0)?.[0];
        if (first) setDate(first);
      }
    });
    return () => {
      alive = false;
    };
  }, [days, draft.serviceIds, draft.staffId, draft.reduced, draft.date, ignoreBookingId]);

  useEffect(() => {
    let alive = true;
    setSlots(null);
    getAdapter()
      .findSlots({ date, serviceIds: draft.serviceIds, staffId: draft.staffId, reduced: draft.reduced, notBefore: new Date(Date.now() + 60 * 60_000), ignoreBookingId })
      .then((s) => alive && setSlots(s));
    return () => {
      alive = false;
    };
  }, [date, draft.serviceIds, draft.staffId, draft.reduced, ignoreBookingId]);

  const scroll = (dir: number) => strip.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  const parts = { Vormittag: [] as Slot[], Nachmittag: [] as Slot[], Abend: [] as Slot[] };
  for (const s of slots ?? []) {
    const h = Number(berlinTime(s.start).slice(0, 2));
    (h < 12 ? parts.Vormittag : h < 17 ? parts.Nachmittag : parts.Abend).push(s);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-serif text-2xl">{formatDateLong(berlinToISO(date, '12:00'))}</p>
        <div className="hidden gap-1 md:flex">
          <button onClick={() => scroll(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-line" aria-label="Frühere Tage">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button onClick={() => scroll(1)} className="grid h-10 w-10 place-items-center rounded-full border border-line" aria-label="Spätere Tage">
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <div ref={strip} className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0" data-lenis-prevent>
        {days.map((d) => {
          const dt = inBerlin(berlinToISO(d, '12:00'));
          const n = availability[d];
          const on = d === date;
          return (
            <button
              key={d}
              onClick={() => {
                setDate(d);
                setDraft({ ...draft, date: d, slot: undefined });
              }}
              className={cn('flex min-h-20 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border transition-colors', on ? 'border-honey-950 bg-honey-950 text-cream-50' : 'border-line hover:border-honey-950', n === 0 && !on && 'opacity-45')}
            >
              <span className="text-[0.68rem] uppercase tracking-widest">{dt.toLocaleDateString('de-DE', { weekday: 'short' })}</span>
              <span className="font-serif text-2xl leading-tight">{dt.getDate()}</span>
              <span className={cn('h-1 w-1 rounded-full', n === undefined ? 'bg-transparent' : n > 0 ? (on ? 'bg-honey-300' : 'bg-amber-600') : 'bg-transparent')} />
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {slots === null && <p className="py-10 text-center text-muted">Freie Zeiten werden gesucht …</p>}
        {slots?.length === 0 && (
          <div className="rounded-2xl bg-cream-100 p-6 text-center">
            <p className="font-serif text-2xl">An diesem Tag ist leider nichts mehr frei.</p>
            <p className="mt-1 text-sm text-muted">Probier einen anderen Tag{draft.staffId ? ' oder wähle „Egal, erste Freie“' : ''}.</p>
          </div>
        )}
        {Object.entries(parts).map(([label, list]) =>
          list.length ? (
            <div key={label} className="mb-6">
              <p className="eyebrow mb-3">{label}</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                {list.map((s) => {
                  const on = draft.slot?.start === s.start;
                  const who = staff.find((p) => p.id === s.items[0].staffId)?.name;
                  return (
                    <button
                      key={s.start}
                      onClick={() => setDraft({ ...draft, date, slot: s })}
                      className={cn('flex min-h-14 flex-col items-center justify-center rounded-xl border text-sm transition-colors', on ? 'border-honey-950 bg-honey-950 text-cream-50' : 'border-line bg-card hover:border-honey-950')}
                    >
                      <span className="font-medium">{berlinTime(s.start)}</span>
                      {!draft.staffId && <span className={cn('text-[0.66rem]', on ? 'text-cream-100/80' : 'text-muted')}>{who}{new Set(s.items.map((i) => i.staffId)).size > 1 ? ' +' : ''}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
