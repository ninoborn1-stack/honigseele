'use client';
// Preisliste eines Bereichs: links Sprung-Navigation (sticky, aktiver Abschnitt), rechts breite Tabelle.
// Statisch aus content/ gerendert (SEO), im Browser live aus dem Adapter (Admin-Änderungen).
import { CalendarPlus, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Placeholder } from '@/components/ui/badge';
import { priceRange } from '@/domain/pricing';
import type { Service, Staff, StaffService } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatDuration, formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';

const anchor = (group: string) =>
  `gruppe-${group
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' })[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')}`;

function priceLabel(s: Service, staffServices: StaffService[]) {
  if (s.isConsultation && s.priceCents === 0) return 'inklusive';
  const range = priceRange(s, staffServices);
  if (range.min !== range.max) return `${formatEuro(range.min).replace(/\s?€/, '')}–${formatEuro(range.max)}`;
  return formatEuro(s.priceCents, { from: s.priceFrom });
}

export function PriceList({
  categoryId,
  initialServices,
  initialStaffServices,
  initialStaff,
  aside,
}: {
  categoryId: string;
  initialServices: Service[];
  initialStaffServices: StaffService[];
  initialStaff: Staff[];
  /** zusätzlicher Inhalt unter der Navigation (z. B. Hinweise) */
  aside?: React.ReactNode;
}) {
  const { data: services = initialServices } = useData((db) => db.listServices().then((all) => all.filter((s) => s.categoryId === categoryId && s.active)), [categoryId], initialServices);
  const { data: staffServices = initialStaffServices } = useData((db) => db.listStaffServices(), [], initialStaffServices);
  const { data: staff = initialStaff } = useData((db) => db.listStaff(), [], initialStaff);

  const groups = useMemo(() => [...new Set(services.map((s) => s.group ?? 'Leistungen'))], [services]);
  const hasAudienceTabs = groups.includes('Damen') && groups.includes('Herren');
  const [tab, setTab] = useState<'Damen' | 'Herren'>('Damen');
  const visibleGroups = hasAudienceTabs ? groups.filter((g) => g === tab || (g !== 'Damen' && g !== 'Herren')) : groups;
  const [active, setActive] = useState(visibleGroups[0]);

  // Aktiven Abschnitt beim Scrollen markieren
  useEffect(() => {
    const els = visibleGroups.map((g) => document.getElementById(anchor(g))).filter((e): e is HTMLElement => Boolean(e));
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.getAttribute('data-group') ?? '');
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [visibleGroups.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  const jump = (g: string) => {
    const el = document.getElementById(anchor(g));
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--top-h')) || 96) - 24;
    scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[18rem_1fr] lg:gap-20 xl:grid-cols-[22rem_1fr]">
      <aside className="min-w-0 lg:sticky lg:top-[calc(var(--top-h,96px)+2rem)] lg:self-start">
        {hasAudienceTabs && (
          <div role="tablist" aria-label="Zielgruppe" className="mb-8 inline-flex rounded-full border border-honey-950/15 p-1">
            {(['Damen', 'Herren'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn('min-h-11 rounded-full px-7 text-sm font-medium tracking-wide transition-colors duration-300', tab === t ? 'bg-honey-950 text-cream-50' : 'text-muted hover:text-honey-950')}
              >
                {t}
              </button>
            ))}
          </div>
        )}
        <nav aria-label="Abschnitte der Preisliste" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:block lg:space-y-1 lg:px-0">
          {visibleGroups.map((g) => {
            const count = services.filter((s) => (s.group ?? 'Leistungen') === g).length;
            const on = active === g;
            return (
              <button
                key={g}
                onClick={() => jump(g)}
                className={cn(
                  'group flex min-h-11 shrink-0 items-center justify-between gap-6 rounded-full border px-5 text-left transition-colors lg:w-full lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:py-3',
                  on ? 'border-honey-950 bg-honey-950 text-cream-50 lg:border-honey-950 lg:bg-transparent lg:text-honey-950' : 'border-honey-950/15 text-muted hover:text-honey-950 lg:border-honey-950/10',
                )}
              >
                <span className="flex items-center gap-3">
                  <span className={cn('hidden h-px bg-amber-600 transition-all duration-500 lg:block', on ? 'w-8' : 'w-0')} />
                  <span className="font-serif text-xl lg:text-2xl">{g}</span>
                </span>
                <span className="text-xs tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </nav>
        {aside && <div className="mt-10 hidden lg:block">{aside}</div>}
      </aside>

      <div>
        {services.some((s) => s.reducedPriceCents) && <p className="mb-6 text-sm text-muted">In Klammern: Preis für Schüler*innen & Studierende mit Nachweis.</p>}
        {visibleGroups.map((group) => {
          const rows = services.filter((s) => (s.group ?? 'Leistungen') === group);
          return (
            <section key={group} id={anchor(group)} data-group={group} className="mb-20 scroll-mt-32 last:mb-0">
              <div className="flex items-end justify-between gap-6 border-b border-honey-950 pb-5">
                <h3 className="font-serif text-[clamp(2.2rem,4vw,3.8rem)] leading-none">{group}</h3>
                <span className="pb-1 text-xs font-medium uppercase tracking-[0.18em] text-muted">{rows.length} {rows.length === 1 ? 'Leistung' : 'Leistungen'}</span>
              </div>
              <ul>
                {rows.map((s) => {
                  const differing = staffServices.filter((r) => r.serviceId === s.id && r.priceCents && r.priceCents !== s.priceCents);
                  return (
                    <li key={s.id} className="group border-b border-honey-950/10 transition-colors hover:bg-cream-100/70">
                      <div className="grid grid-cols-1 items-center gap-x-5 gap-y-3 py-5 sm:grid-cols-[1fr_7rem_auto] md:px-3">
                        <div className="min-w-0">
                          <p className="font-serif text-[1.55rem] leading-tight md:text-[1.8rem]">
                            {s.name} {s.isPlaceholder && <Placeholder className="ml-1 align-middle" />}
                          </p>
                          {s.requiresConsultation && <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-amber-800">nach Vorgespräch</p>}
                          {s.description && <p className="mt-1.5 max-w-xl text-sm text-muted">{s.description}</p>}
                          {differing.length > 0 && (
                            <p className="mt-2 inline-flex flex-wrap gap-x-2 rounded-full bg-honey-200/50 px-3 py-1 text-xs text-honey-950">
                              Preis je Anbieterin: {differing.map((d) => `${staff.find((x) => x.id === d.staffId)?.name} ${formatEuro(d.priceCents!)}`).join(' · ')} · sonst {formatEuro(s.priceCents)}
                            </p>
                          )}
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted sm:hidden">
                            <Clock className="h-3 w-3" strokeWidth={1.5} /> ca. {formatDuration(s.durationMin)}
                          </p>
                        </div>
                        <p className="hidden items-center gap-1.5 text-sm text-muted sm:flex">
                          <Clock className="h-3.5 w-3.5" strokeWidth={1.5} /> {formatDuration(s.durationMin)}
                        </p>
                        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-self-end">
                          <p className="text-right font-serif text-[1.7rem] leading-none whitespace-nowrap md:text-[2.1rem]">
                            {priceLabel(s, staffServices)}
                            {s.reducedPriceCents && <span className="ml-1.5 text-lg text-muted">({formatEuro(s.reducedPriceCents).replace(/\s?€/, '')})</span>}
                          </p>
                          {s.bookable && (
                            <Link
                              href={`/buchen/?leistung=${s.id}`}
                              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-honey-950/20 text-honey-950 transition-all duration-300 hover:border-honey-950 hover:bg-honey-950 hover:text-honey-300 group-hover:border-honey-950"
                              aria-label={`${s.name} buchen`}
                              data-label="Buchen"
                            >
                              <CalendarPlus className="h-4 w-4" strokeWidth={1.5} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        {aside && <div className="mt-12 lg:hidden">{aside}</div>}
      </div>
    </div>
  );
}
