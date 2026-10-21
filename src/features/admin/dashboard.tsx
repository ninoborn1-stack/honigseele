'use client';
import { ArrowRight, CalendarX2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { addDaysToDate, berlinDate, berlinToISO, formatDateLong } from '@/domain/time';
import { berlinTime, formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { AdminTitle, Empty, Notice, Panel, Stat, statusLabels } from './ui';

export function Dashboard() {
  const today = berlinDate(new Date());
  const dayStart = berlinToISO(today, '00:00');
  const dayEnd = berlinToISO(today, '23:59');
  const weekStart = berlinToISO(addDaysToDate(today, -6), '00:00');

  const { data } = useData(async (db) => {
    const [bookings, orders, inquiries, customers, services, staff] = await Promise.all([
      db.listBookings(),
      db.listOrders(),
      db.listInquiries(),
      db.listCustomers(),
      db.listServices(),
      db.listStaff(),
    ]);
    return { bookings, orders, inquiries, customers, services, staff };
  }, []);

  if (!data) return null;
  const { bookings, orders, inquiries, customers, services, staff } = data;
  const todays = bookings.filter((b) => b.start >= dayStart && b.start <= dayEnd).sort((a, b) => a.start.localeCompare(b.start));
  const active = (b: (typeof bookings)[number]) => b.status !== 'storniert';
  const revenue = (from: string, to: string) =>
    bookings.filter((b) => active(b) && b.start >= from && b.start <= to).reduce((s, b) => s + b.totalCents, 0) +
    orders.filter((o) => o.status !== 'storniert' && o.createdAt >= from && o.createdAt <= to).reduce((s, o) => s + o.totalCents, 0);
  const openOrders = orders.filter((o) => o.status === 'bezahlt').length;
  const newInquiries = inquiries.filter((i) => i.createdAt >= weekStart).length;

  return (
    <div>
      <AdminTitle eyebrow={formatDateLong(new Date().toISOString())} title="Guten Tag, Anna.">
        <ButtonLink href="/admin/kalender/" variant="primary">
          Zum Kalender
        </ButtonLink>
      </AdminTitle>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Termine heute" value={String(todays.filter(active).length)} hint={`${todays.filter((b) => b.status === 'storniert').length} storniert`} />
        <Stat label="Umsatz heute" value={formatEuro(revenue(dayStart, dayEnd))} hint="Termine + Shop (Demo)" />
        <Stat label="Umsatz 7 Tage" value={formatEuro(revenue(weekStart, dayEnd))} hint="Termine + Shop (Demo)" />
        <Stat label="Offen" value={`${openOrders} / ${newInquiries}`} hint="Bestellungen zu versenden / neue Anfragen" />
      </div>

      <div className="mt-6">
        <Notice>
          <p className="flex items-start gap-3">
            <CalendarX2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" strokeWidth={1.5} />
            <span>
              <strong className="font-medium">Treatwell-Termine im Kalender blocken.</strong> Solange Treatwell parallel läuft, trag dort gebuchte Termine hier als Block ein – dann wird nichts doppelt vergeben.{' '}
              <Link href="/admin/kalender/" className="underline underline-offset-4">
                Jetzt blocken
              </Link>
            </span>
          </p>
        </Notice>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Heute im Studio" action={<Link href="/admin/kalender/" className="flex items-center gap-1 text-sm text-amber-800">Kalender <ArrowRight className="h-3.5 w-3.5" /></Link>}>
          {todays.length === 0 ? (
            <Empty>Heute stehen keine Termine an.</Empty>
          ) : (
            <ul className="divide-y divide-line-soft">
              {todays.map((b) => {
                const c = customers.find((x) => x.id === b.customerId);
                const who = [...new Set(b.items.map((i) => staff.find((s) => s.id === i.staffId)?.name))].join(' & ');
                return (
                  <li key={b.id} className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 py-3">
                    <span className="font-serif text-xl">{berlinTime(b.start)}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{c ? `${c.firstName} ${c.lastName}` : 'Kundin'}</span>
                      <span className="block truncate text-xs text-muted">
                        {b.items.map((i) => services.find((s) => s.id === i.serviceId)?.name).join(', ')} · {who}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <Badge tone={b.status === 'storniert' ? 'danger' : 'line'}>{statusLabels[b.status]}</Badge>
                      {b.source === 'treatwell' && <Badge tone="honey">Treatwell</Badge>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
        <div className="space-y-6">
          <Panel title="Letzte Bestellungen" action={<Link href="/admin/bestellungen/" className="text-sm text-amber-800">Alle</Link>}>
            {orders.length === 0 ? (
              <Empty>Noch keine Bestellungen.</Empty>
            ) : (
              <ul className="divide-y divide-line-soft text-sm">
                {orders.slice(0, 4).map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                    <span>
                      <span className="block font-medium">{o.number}</span>
                      <span className="text-xs text-muted">{o.items.map((i) => i.name).join(', ')}</span>
                    </span>
                    <span className="text-right">
                      {formatEuro(o.totalCents)}
                      <Badge className="mt-1 block" tone={o.status === 'bezahlt' ? 'honey' : 'line'}>
                        {statusLabels[o.status]}
                      </Badge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Anfragen" action={<Link href="/admin/einstellungen/#anfragen" className="text-sm text-amber-800">Alle</Link>}>
            {inquiries.length === 0 ? (
              <Empty>Keine Anfragen.</Empty>
            ) : (
              <ul className="space-y-3 text-sm">
                {inquiries.slice(-3).reverse().map((i) => (
                  <li key={i.id}>
                    <span className="font-medium">{i.name}</span> <Badge>{i.kind}</Badge>
                    <p className="line-clamp-2 text-muted">{i.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
