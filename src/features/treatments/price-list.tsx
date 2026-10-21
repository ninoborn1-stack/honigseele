'use client';
// Preisliste eines Bereichs. Statisch aus content/ gerendert (SEO), im Browser live aus dem Adapter (Admin-Änderungen).
import { CalendarPlus, Clock } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Placeholder } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { priceRange } from '@/domain/pricing';
import type { Service, Staff, StaffService } from '@/domain/types';
import { formatDuration, formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';

export function PriceList({
  categoryId,
  initialServices,
  initialStaffServices,
  initialStaff,
}: {
  categoryId: string;
  initialServices: Service[];
  initialStaffServices: StaffService[];
  initialStaff: Staff[];
}) {
  const { data: services = initialServices } = useData((db) => db.listServices().then((all) => all.filter((s) => s.categoryId === categoryId && s.active)), [categoryId], initialServices);
  const { data: staffServices = initialStaffServices } = useData((db) => db.listStaffServices(), [], initialStaffServices);
  const { data: staff = initialStaff } = useData((db) => db.listStaff(), [], initialStaff);

  const groups = useMemo(() => [...new Set(services.map((s) => s.group ?? 'Leistungen'))], [services]);
  const hasAudienceTabs = groups.includes('Damen') && groups.includes('Herren');
  const [tab, setTab] = useState<string>(hasAudienceTabs ? 'Damen' : 'alle');
  const visibleGroups = hasAudienceTabs ? groups.filter((g) => g === tab || (g !== 'Damen' && g !== 'Herren')) : groups;
  const showReduced = services.some((s) => s.reducedPriceCents);

  return (
    <div>
      {hasAudienceTabs && (
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { value: 'Damen', label: 'Damen' },
            { value: 'Herren', label: 'Herren' },
          ]}
          className="mb-8"
        />
      )}
      {visibleGroups.map((group) => {
        const rows = services.filter((s) => (s.group ?? 'Leistungen') === group);
        return (
          <div key={group} className="mb-12 last:mb-0">
            {(!hasAudienceTabs || (group !== 'Damen' && group !== 'Herren')) && <h3 className="mb-4 text-3xl">{group}</h3>}
            {showReduced && rows.some((r) => r.reducedPriceCents) && (
              <p className="mb-3 text-right text-xs text-muted">in Klammern: Schüler*innen & Studierende</p>
            )}
            <ul className="border-t border-line">
              {rows.map((s) => {
                const range = priceRange(s, staffServices);
                const differing = staffServices.filter((r) => r.serviceId === s.id && r.priceCents && r.priceCents !== s.priceCents);
                return (
                  <li key={s.id} className="border-b border-line-soft">
                    <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-4 sm:grid-cols-[1fr_auto_auto]">
                      <div>
                        <p className="text-[1.02rem]">
                          {s.name} {s.isPlaceholder && <Placeholder className="ml-1" />}
                          {s.requiresConsultation && <span className="ml-2 text-xs text-amber-800">nach Vorgespräch</span>}
                        </p>
                        {s.description && <p className="mt-0.5 text-sm text-muted">{s.description}</p>}
                        {differing.length > 0 && (
                          <p className="mt-1 text-xs text-amber-800">
                            Preis je Anbieterin:{' '}
                            {differing.map((d) => `${staff.find((x) => x.id === d.staffId)?.name} ${formatEuro(d.priceCents!)}`).join(' · ')}, sonst {formatEuro(s.priceCents)}
                          </p>
                        )}
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted sm:hidden">
                          <Clock className="h-3 w-3" strokeWidth={1.5} /> ca. {formatDuration(s.durationMin)}
                        </p>
                      </div>
                      <p className="hidden items-center gap-1 text-sm text-muted sm:flex">
                        <Clock className="h-3.5 w-3.5" strokeWidth={1.5} /> {formatDuration(s.durationMin)}
                      </p>
                      <div className="flex items-center gap-3 justify-self-end">
                        <p className="text-right font-serif text-2xl whitespace-nowrap">
                          {s.isConsultation && s.priceCents === 0
                            ? 'inklusive'
                            : range.min !== range.max
                              ? `${formatEuro(range.min)}–${formatEuro(range.max).replace(/\s?€/, '')} €`
                              : formatEuro(s.priceCents, { from: s.priceFrom })}
                          {s.reducedPriceCents && <span className="ml-1 text-base text-muted">({formatEuro(s.reducedPriceCents).replace(/\s?€/, '')})</span>}
                        </p>
                        {s.bookable && (
                          <Link
                            href={`/buchen/?leistung=${s.id}`}
                            className="grid h-11 w-11 place-items-center rounded-full border border-line text-amber-800 transition-colors hover:border-honey-950 hover:bg-honey-950 hover:text-cream-50"
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
          </div>
        );
      })}
    </div>
  );
}
