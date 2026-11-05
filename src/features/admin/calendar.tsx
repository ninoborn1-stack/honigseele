'use client';
// Admin-Kalender: Tagesansicht (Spalten je Mitarbeiterin) als Standard, Wochenansicht (eine Mitarbeiterin) als Umschalter.
import { Ban, Plus } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/form';
import { Loading } from '@/components/ui/loading';
import {
  addDaysToDate,
  berlinDate,
  berlinToISO,
  formatDateLong,
  formatDateShort,
  minutesBetween,
  overlaps,
  weekdayOf,
} from '@/domain/time';
import type { Booking, Customer, Service, TimeOff } from '@/domain/types';
import { cn } from '@/lib/cn';
import { berlinTime } from '@/lib/format';
import { useData } from '@/lib/use-data';
import {
  BlockDrawer,
  BookingDetailDrawer,
  MoveBookingDrawer,
  NewBookingDrawer,
  TimeOffDrawer,
  timeOffLabels,
} from './calendar-dialogs';
import { AdminTitle } from './ui';

const START_H = 8;
const END_H = 21;
const PX_PER_MIN = 1.6;
const HEIGHT = (END_H - START_H) * 60 * PX_PER_MIN;
const COL_MIN = 170;
const hatch =
  'repeating-linear-gradient(135deg, rgb(205 184 148 / 0.35) 0 6px, transparent 6px 12px)';

/** Position eines Zeitraums innerhalb eines Kalendertags (geschnitten auf 08–21 Uhr) */
function place(date: string, start: string, end: string) {
  const dayStart = berlinToISO(date, `${String(START_H).padStart(2, '0')}:00`);
  const dayEnd = berlinToISO(date, `${END_H}:00`);
  const s = start < dayStart ? dayStart : start;
  const e = end > dayEnd ? dayEnd : end;
  return {
    top: minutesBetween(dayStart, s) * PX_PER_MIN,
    height: Math.max(28, minutesBetween(s, e) * PX_PER_MIN),
  };
}

function Hours() {
  return (
    <div className="relative w-14 shrink-0" style={{ height: HEIGHT }}>
      {Array.from({ length: END_H - START_H + 1 }, (_, i) => (
        <span
          key={i}
          className="text-muted absolute -translate-y-2.5 pl-1 text-sm"
          style={{ top: i * 60 * PX_PER_MIN }}
        >
          {String(START_H + i).padStart(2, '0')}:00
        </span>
      ))}
    </div>
  );
}

function Column({
  date,
  staffId,
  shift,
  bookings,
  timeOff,
  services,
  customers,
  onBooking,
  onTimeOff,
}: {
  date: string;
  staffId: string;
  shift?: { start: string; end: string };
  bookings: Booking[];
  timeOff: TimeOff[];
  services: Service[];
  customers: Customer[];
  onBooking: (b: Booking) => void;
  onTimeOff: (t: TimeOff) => void;
}) {
  const dayStart = berlinToISO(date, '00:00');
  const dayEnd = berlinToISO(date, '23:59');
  const items = bookings.flatMap((b) =>
    b.items
      .filter((i) => i.staffId === staffId && i.start >= dayStart && i.start <= dayEnd)
      .map((i) => ({ b, i })),
  );
  const blocks = timeOff.filter(
    (t) => t.staffId === staffId && overlaps(t.start, t.end, dayStart, dayEnd),
  );
  return (
    <div
      className="border-line-soft relative flex-1 border-l"
      style={{ height: HEIGHT, minWidth: COL_MIN }}
    >
      {Array.from({ length: END_H - START_H }, (_, i) => (
        <div
          key={i}
          className="border-line-soft absolute inset-x-0 border-t"
          style={{ top: i * 60 * PX_PER_MIN }}
        />
      ))}
      {/* Außerhalb der Arbeitszeit */}
      {shift ? (
        <>
          <div
            className="bg-cream-200/60 absolute inset-x-0 top-0"
            style={{
              height:
                Math.max(0, minutesBetween(berlinToISO(date, '08:00'), shift.start)) * PX_PER_MIN,
            }}
          />
          <div
            className="bg-cream-200/60 absolute inset-x-0 bottom-0"
            style={{
              top: Math.min(
                HEIGHT,
                minutesBetween(berlinToISO(date, '08:00'), shift.end) * PX_PER_MIN,
              ),
            }}
          />
        </>
      ) : (
        <div className="bg-cream-200/60 absolute inset-0" />
      )}
      {blocks.map((t) => {
        const p = place(date, t.start, t.end);
        const tw = t.reason === 'treatwell';
        return (
          <button
            key={t.id}
            onClick={() => onTimeOff(t)}
            className={cn(
              'absolute inset-x-1 overflow-hidden rounded-xl border-2 px-2.5 py-1.5 text-left text-sm leading-snug',
              tw ? 'bg-card text-honey-950 border-amber-600' : 'border-line bg-card text-honey-950',
            )}
            style={{ top: p.top, height: p.height, backgroundImage: hatch }}
          >
            <span className="block font-medium">
              {berlinTime(t.start)} {tw ? 'Treatwell – geblockt' : timeOffLabels[t.reason]}
            </span>
            {t.note && <span className="text-muted block truncate">{t.note}</span>}
          </button>
        );
      })}
      {items.map(({ b, i }) => {
        const p = place(date, i.start, i.end);
        const cancelled = b.status === 'storniert';
        const tw = b.source === 'treatwell';
        const c = customers.find((x) => x.id === b.customerId);
        return (
          <button
            key={b.id + i.start + i.serviceId}
            onClick={() => onBooking(b)}
            className={cn(
              'absolute inset-x-1 overflow-hidden rounded-xl px-2.5 py-1.5 text-left text-sm leading-snug shadow-sm',
              cancelled
                ? 'border-line bg-card text-muted border-2 border-dashed'
                : tw
                  ? 'bg-honey-200 text-honey-950 border-2 border-amber-600'
                  : 'bg-honey-950 text-cream-50',
            )}
            style={{ top: p.top, height: p.height }}
          >
            <span className={cn('block font-semibold', cancelled && 'line-through')}>
              {berlinTime(i.start)} {c ? c.firstName : ''}
            </span>
            <span className="block">{services.find((s) => s.id === i.serviceId)?.name}</span>
            {tw && <span className="block font-medium">über Treatwell</span>}
            {cancelled && <span className="block">abgesagt</span>}
          </button>
        );
      })}
    </div>
  );
}

// Ohne tailwind-merge: Farben nur einmal setzen
const navBase = 'min-h-12 rounded-full border px-5 text-base font-medium transition-colors';
const navBtn = `${navBase} border-line bg-card text-honey-950 hover:border-honey-950`;
const navBtnActive = `${navBase} border-honey-950 bg-honey-950 text-cream-50 hover:bg-honey-800`;

export function AdminCalendar() {
  const today = berlinDate(new Date());
  const [date, setDate] = useState(today);
  const [view, setView] = useState<'tag' | 'woche'>('tag');
  const [weekStaff, setWeekStaff] = useState('anna');
  const [detail, setDetail] = useState<Booking | null>(null);
  const [moving, setMoving] = useState<Booking | null>(null);
  const [creating, setCreating] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [offDetail, setOffDetail] = useState<TimeOff | null>(null);

  // Aus der Übersicht: ?neu=termin bzw. ?neu=block öffnet direkt den passenden Dialog
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const intent = params.get('neu');
  useEffect(() => {
    if (intent === 'termin') setCreating(true);
    if (intent === 'block') setBlocking(true);
    if (intent) router.replace(pathname);
  }, [intent, router, pathname]);

  const { data } = useData(
    async (db) => {
      const [bookings, staff, workingHours, timeOff, services, staffServices, customers] =
        await Promise.all([
          db.listBookings({
            from: berlinToISO(addDaysToDate(date, -7), '00:00'),
            to: berlinToISO(addDaysToDate(date, 8), '23:59'),
          }),
          db.listStaff(),
          db.listWorkingHours(),
          db.listTimeOff(),
          db.listServices(),
          db.listStaffServices(),
          db.listCustomers(),
        ]);
      return { bookings, staff, workingHours, timeOff, services, staffServices, customers };
    },
    [date],
  );

  // Detail-Drawer nach Änderungen aktuell halten
  const liveDetail =
    detail && data ? (data.bookings.find((b) => b.id === detail.id) ?? detail) : detail;

  if (!data) return <Loading label="Kalender wird geladen …" />;
  const { bookings, staff, workingHours, timeOff, services, staffServices, customers } = data;
  const shiftOf = (staffId: string, d: string) => {
    const h = workingHours.find((w) => w.staffId === staffId && w.weekday === weekdayOf(d));
    return h ? { start: berlinToISO(d, h.start), end: berlinToISO(d, h.end) } : undefined;
  };
  const dayStart = berlinToISO(date, '00:00');
  const dayEnd = berlinToISO(date, '23:59');
  const columns = staff.filter(
    (s) =>
      s.bookable &&
      (shiftOf(s.id, date) ||
        bookings.some((b) =>
          b.items.some((i) => i.staffId === s.id && i.start >= dayStart && i.start <= dayEnd),
        )),
  );
  // Woche ab Montag
  const monday = addDaysToDate(date, -(weekdayOf(date) - 1));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDaysToDate(monday, i));
  const isDay = view === 'tag';
  const step = isDay ? 1 : 7;
  const count = bookings.filter(
    (b) => b.status !== 'storniert' && b.start >= dayStart && b.start <= dayEnd,
  ).length;
  const dayName =
    date === today
      ? 'Heute'
      : date === addDaysToDate(today, 1)
        ? 'Morgen'
        : date === addDaysToDate(today, -1)
          ? 'Gestern'
          : null;

  return (
    <div>
      <AdminTitle
        eyebrow={isDay ? (dayName ?? 'Kalender') : 'Kalender · Woche'}
        title={
          isDay
            ? formatDateLong(berlinToISO(date, '12:00'))
            : `Woche ab ${formatDateShort(berlinToISO(monday, '12:00'))}`
        }
      >
        <Button size="lg" onClick={() => setCreating(true)}>
          <Plus className="h-5 w-5" strokeWidth={1.5} /> Termin eintragen
        </Button>
        <Button size="lg" variant="ghost" onClick={() => setBlocking(true)}>
          <Ban className="h-5 w-5" strokeWidth={1.5} /> Zeit blocken
        </Button>
      </AdminTitle>

      {/* Blättern: klar beschriftet statt reiner Pfeile */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setDate(addDaysToDate(date, -step))} className={navBtn}>
            ← {isDay ? (date === today ? 'Gestern' : 'Tag davor') : 'Woche davor'}
          </button>
          <button
            onClick={() => setDate(today)}
            className={(isDay ? date === today : weekDays.includes(today)) ? navBtnActive : navBtn}
          >
            {isDay ? 'Heute' : 'Diese Woche'}
          </button>
          <button onClick={() => setDate(addDaysToDate(date, step))} className={navBtn}>
            {isDay ? (date === today ? 'Morgen' : 'Tag danach') : 'Woche danach'} →
          </button>
          <label className="text-muted flex min-h-12 items-center gap-2 text-base">
            <span className="sr-only sm:not-sr-only">oder Tag wählen:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="border-line bg-card text-honey-950 min-h-12 rounded-full border px-4 text-base"
              aria-label="Tag wählen"
            />
          </label>
        </div>
        {/* Wochenansicht: unauffälliger Umschalter */}
        <div className="flex items-center gap-2">
          {!isDay && (
            <Select
              value={weekStaff}
              onChange={(e) => setWeekStaff(e.target.value)}
              className="!w-auto"
              aria-label="Wessen Woche?"
            >
              {staff
                .filter((s) => s.bookable)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </Select>
          )}
          <button
            onClick={() => setView(isDay ? 'woche' : 'tag')}
            className="min-h-12 rounded-full px-4 text-base text-amber-800 underline underline-offset-4"
          >
            {isDay ? 'Ganze Woche zeigen' : 'Zurück zur Tagesansicht'}
          </button>
        </div>
      </div>
      {isDay && (
        <p className="text-muted mt-4 text-base">
          {count === 0 ? 'Keine Termine' : count === 1 ? '1 Termin' : `${count} Termine`} ·{' '}
          {columns.length} {columns.length === 1 ? 'Mitarbeiterin' : 'Mitarbeiterinnen'} im Studio
        </p>
      )}

      <div
        className="border-line-soft bg-card mt-4 overflow-x-auto rounded-2xl border"
        data-lenis-prevent
      >
        <div className="min-w-max">
          {/* Kopfzeile */}
          <div className="border-line-soft bg-card sticky top-0 z-10 flex border-b">
            <div className="w-14 shrink-0" />
            {isDay
              ? columns.map((s) => {
                  const sh = shiftOf(s.id, date);
                  return (
                    <div
                      key={s.id}
                      className="border-line-soft flex flex-1 items-center gap-2 border-l px-3 py-3"
                      style={{ minWidth: COL_MIN }}
                    >
                      <Avatar name={s.name} tone={s.avatarTone} photo={s.photo} size="sm" />
                      <span>
                        <span className="block text-base font-medium">{s.name}</span>
                        <span className="text-muted text-sm">
                          {sh ? `${berlinTime(sh.start)}–${berlinTime(sh.end)} Uhr` : 'hat frei'}
                        </span>
                      </span>
                    </div>
                  );
                })
              : weekDays.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDate(d);
                      setView('tag');
                    }}
                    className={cn(
                      'border-line-soft flex-1 border-l px-3 py-3 text-left',
                      d === today && 'text-amber-800',
                    )}
                    style={{ minWidth: COL_MIN }}
                  >
                    <span className="block text-base font-medium">
                      {formatDateShort(berlinToISO(d, '12:00'))}
                    </span>
                    <span className="text-muted text-sm">
                      {(() => {
                        const sh = shiftOf(weekStaff, d);
                        return sh
                          ? `${berlinTime(sh.start)}–${berlinTime(sh.end)} Uhr`
                          : 'hat frei';
                      })()}
                    </span>
                  </button>
                ))}
          </div>
          <div className="flex pt-3">
            <Hours />
            {isDay &&
              columns.map((s) => (
                <Column
                  key={s.id}
                  date={date}
                  staffId={s.id}
                  shift={shiftOf(s.id, date)}
                  bookings={bookings}
                  timeOff={timeOff}
                  services={services}
                  customers={customers}
                  onBooking={setDetail}
                  onTimeOff={setOffDetail}
                />
              ))}
            {isDay && columns.length === 0 && (
              <p className="text-muted flex-1 p-10 text-center text-base">
                An diesem Tag arbeitet niemand.
              </p>
            )}
            {!isDay &&
              weekDays.map((d) => (
                <Column
                  key={d}
                  date={d}
                  staffId={weekStaff}
                  shift={shiftOf(weekStaff, d)}
                  bookings={bookings}
                  timeOff={timeOff}
                  services={services}
                  customers={customers}
                  onBooking={setDetail}
                  onTimeOff={setOffDetail}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Legende */}
      <ul className="text-muted mt-4 flex flex-wrap gap-x-6 gap-y-2 text-base">
        <li className="flex items-center gap-2">
          <span className="bg-honey-950 h-4 w-4 rounded" /> Termin (online oder vom Team)
        </li>
        <li className="flex items-center gap-2">
          <span className="bg-honey-200 h-4 w-4 rounded border-2 border-amber-600" /> Termin über
          Treatwell
        </li>
        <li className="flex items-center gap-2">
          <span
            className="border-line h-4 w-4 rounded border-2"
            style={{ backgroundImage: hatch }}
          />{' '}
          Geblockt (Treatwell, Pause, Urlaub) – online nicht buchbar
        </li>
        <li className="flex items-center gap-2">
          <span className="bg-cream-200 h-4 w-4 rounded" /> Außerhalb der Arbeitszeit
        </li>
      </ul>

      <BookingDetailDrawer
        booking={liveDetail}
        onClose={() => setDetail(null)}
        onMove={(b) => {
          setDetail(null);
          setMoving(b);
        }}
        services={services}
        staff={staff}
        customers={customers}
      />
      <MoveBookingDrawer booking={moving} onClose={() => setMoving(null)} staff={staff} />
      <NewBookingDrawer
        open={creating}
        onClose={() => setCreating(false)}
        date={date}
        services={services}
        staff={staff}
        staffServices={staffServices}
        customers={customers}
      />
      <BlockDrawer
        open={blocking}
        onClose={() => setBlocking(false)}
        date={date}
        staff={staff}
        staffId={isDay ? undefined : weekStaff}
      />
      <TimeOffDrawer entry={offDetail} onClose={() => setOffDetail(null)} staff={staff} />
    </div>
  );
}
