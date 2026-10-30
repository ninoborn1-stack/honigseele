'use client';
// Übersicht: drei große Aktionen, die heutigen Termine, darunter ruhige Kennzahlen.
import { ArrowRight, Ban, CalendarDays, Plus, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { cn } from '@/lib/cn';
import { addDaysToDate, berlinDate, berlinToISO, formatDateLong } from '@/domain/time';
import { berlinTime, formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { AdminTitle, Empty, Panel, Stat, statusLabels } from './ui';

function ActionTile({
  href,
  icon: Icon,
  title,
  sub,
  dark,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  sub: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex min-h-28 items-center gap-4 rounded-3xl border p-5 transition-colors md:p-6',
        dark
          ? 'border-honey-950 bg-honey-950 text-cream-50 hover:bg-honey-800'
          : 'border-line bg-card text-honey-950 hover:border-honey-950',
      )}
    >
      <span
        className={cn(
          'grid h-14 w-14 shrink-0 place-items-center rounded-full',
          dark ? 'bg-honey-400 text-honey-950' : 'bg-cream-100',
        )}
      >
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-serif text-2xl leading-tight md:text-3xl">{title}</span>
        <span className={cn('mt-1 block text-base', dark ? 'text-cream-100/80' : 'text-muted')}>
          {sub}
        </span>
      </span>
      <ArrowRight
        className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1"
        strokeWidth={1.5}
      />
    </Link>
  );
}

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

  if (!data) return <Loading label="Übersicht wird geladen …" />;
  const { bookings, orders, inquiries, customers, services, staff } = data;
  const todays = bookings
    .filter((b) => b.start >= dayStart && b.start <= dayEnd)
    .sort((a, b) => a.start.localeCompare(b.start));
  const active = (b: (typeof bookings)[number]) => b.status !== 'storniert';
  const revenue = (from: string, to: string) =>
    bookings
      .filter((b) => active(b) && b.start >= from && b.start <= to)
      .reduce((s, b) => s + b.totalCents, 0) +
    orders
      .filter((o) => o.status !== 'storniert' && o.createdAt >= from && o.createdAt <= to)
      .reduce((s, o) => s + o.totalCents, 0);
  const openOrders = orders.filter((o) => o.status === 'bezahlt').length;
  const newInquiries = inquiries.filter((i) => i.createdAt >= weekStart).length;

  return (
    <div>
      <AdminTitle eyebrow={formatDateLong(new Date().toISOString())} title="Guten Tag, Anna." />

      <div className="grid gap-4 xl:grid-cols-3">
        <ActionTile
          href="/admin/kalender/?neu=termin"
          icon={Plus}
          title="Termin eintragen"
          sub="Kundin, Leistung, Uhrzeit"
          dark
        />
        <ActionTile
          href="/admin/kalender/?neu=block"
          icon={Ban}
          title="Zeit blocken"
          sub="z. B. Treatwell-Termin, Pause, Urlaub"
        />
        <ActionTile
          href="/admin/kalender/"
          icon={CalendarDays}
          title="Kalender öffnen"
          sub="Alle Termine von heute"
        />
      </div>

      <Panel
        title="Heute"
        className="mt-8"
        action={
          <Link
            href="/admin/kalender/"
            className="flex min-h-12 items-center gap-1 text-base text-amber-800"
          >
            Zum Kalender <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        }
      >
        {todays.length === 0 ? (
          <Empty>Heute stehen keine Termine an.</Empty>
        ) : (
          <ul className="divide-line-soft divide-y">
            {todays.map((b) => {
              const c = customers.find((x) => x.id === b.customerId);
              const who = [
                ...new Set(b.items.map((i) => staff.find((s) => s.id === i.staffId)?.name)),
              ].join(' & ');
              const cancelled = b.status === 'storniert';
              return (
                <li
                  key={b.id}
                  className={cn(
                    'grid grid-cols-[5.5rem_1fr] items-start gap-4 py-4 sm:grid-cols-[6.5rem_1fr_auto] sm:items-center',
                    cancelled && 'opacity-60',
                  )}
                >
                  <span
                    className={cn(
                      'font-serif text-3xl leading-none sm:text-4xl',
                      cancelled && 'line-through',
                    )}
                  >
                    {berlinTime(b.start)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-medium">
                      {c ? `${c.firstName} ${c.lastName}` : 'Kundin'}
                    </span>
                    <span className="text-muted block text-base">
                      {b.items
                        .map((i) => services.find((s) => s.id === i.serviceId)?.name)
                        .join(', ')}{' '}
                      · bei {who}
                    </span>
                  </span>
                  <span className="col-start-2 flex flex-wrap gap-1 sm:col-start-auto sm:flex-col sm:items-end">
                    {cancelled && <Badge tone="danger">{statusLabels[b.status]}</Badge>}
                    {b.source === 'treatwell' && <Badge tone="honey">über Treatwell</Badge>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <h2 className="mt-12 text-2xl">Zahlen & Neues</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Termine heute"
          value={String(todays.filter(active).length)}
          hint={`${todays.filter((b) => b.status === 'storniert').length} abgesagt`}
        />
        <Stat
          label="Umsatz heute"
          value={formatEuro(revenue(dayStart, dayEnd))}
          hint="Termine + Shop"
        />
        <Stat
          label="Umsatz letzte 7 Tage"
          value={formatEuro(revenue(weekStart, dayEnd))}
          hint="Termine + Shop"
        />
        <Stat
          label="Zu erledigen"
          value={`${openOrders} / ${newInquiries}`}
          hint="Pakete zu versenden / neue Anfragen"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Letzte Bestellungen"
          action={
            <Link
              href="/admin/bestellungen/"
              className="flex min-h-12 items-center text-base text-amber-800"
            >
              Alle ansehen
            </Link>
          }
        >
          {orders.length === 0 ? (
            <Empty>Noch keine Bestellungen.</Empty>
          ) : (
            <ul className="divide-line-soft divide-y text-base">
              {orders.slice(0, 4).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block font-medium">{o.number}</span>
                    <span className="text-muted block truncate text-sm">
                      {o.items.map((i) => i.name).join(', ')}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
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
        <Panel
          title="Anfragen"
          action={
            <Link
              href="/admin/einstellungen/#anfragen"
              className="flex min-h-12 items-center text-base text-amber-800"
            >
              Alle ansehen
            </Link>
          }
        >
          {inquiries.length === 0 ? (
            <Empty>Keine Anfragen.</Empty>
          ) : (
            <ul className="space-y-4 text-base">
              {inquiries
                .slice(-3)
                .reverse()
                .map((i) => (
                  <li key={i.id}>
                    <span className="font-medium">{i.name}</span> <Badge>{i.kind}</Badge>
                    <p className="text-muted line-clamp-2">{i.message}</p>
                  </li>
                ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
