'use client';
// Admin-Kalender: Tagesansicht (Spalten je Anbieterin) und Wochenansicht (eine Anbieterin).
import { Ban, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/form';
import { Tabs } from '@/components/ui/tabs';
import { addDaysToDate, berlinDate, berlinToISO, formatDateLong, formatDateShort, minutesBetween, overlaps, weekdayOf } from '@/domain/time';
import type { Booking, Service, TimeOff } from '@/domain/types';
import { cn } from '@/lib/cn';
import { berlinTime } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { BlockDrawer, BookingDetailDrawer, MoveBookingDrawer, NewBookingDrawer, TimeOffDrawer } from './calendar-dialogs';
import { AdminTitle, Notice } from './ui';

const START_H = 8;
const END_H = 21;
const PX_PER_MIN = 1.1;
const HEIGHT = (END_H - START_H) * 60 * PX_PER_MIN;

/** Position eines Zeitraums innerhalb eines Kalendertags (geschnitten auf 08–21 Uhr) */
function place(date: string, start: string, end: string) {
  const dayStart = berlinToISO(date, `${String(START_H).padStart(2, '0')}:00`);
  const dayEnd = berlinToISO(date, `${END_H}:00`);
  const s = start < dayStart ? dayStart : start;
  const e = end > dayEnd ? dayEnd : end;
  return { top: minutesBetween(dayStart, s) * PX_PER_MIN, height: Math.max(18, minutesBetween(s, e) * PX_PER_MIN) };
}

function Hours() {
  return (
    <div className="relative w-12 shrink-0" style={{ height: HEIGHT }}>
      {Array.from({ length: END_H - START_H + 1 }, (_, i) => (
        <span key={i} className="absolute -translate-y-2 text-[0.68rem] text-muted" style={{ top: i * 60 * PX_PER_MIN }}>
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
  onBooking,
  onTimeOff,
}: {
  date: string;
  staffId: string;
  shift?: { start: string; end: string };
  bookings: Booking[];
  timeOff: TimeOff[];
  services: Service[];
  onBooking: (b: Booking) => void;
  onTimeOff: (t: TimeOff) => void;
}) {
  const dayStart = berlinToISO(date, '00:00');
  const dayEnd = berlinToISO(date, '23:59');
  const items = bookings.flatMap((b) => b.items.filter((i) => i.staffId === staffId && i.start >= dayStart && i.start <= dayEnd).map((i) => ({ b, i })));
  const blocks = timeOff.filter((t) => t.staffId === staffId && overlaps(t.start, t.end, dayStart, dayEnd));
  return (
    <div className="relative flex-1 border-l border-line-soft" style={{ height: HEIGHT, minWidth: 130 }}>
      {Array.from({ length: END_H - START_H }, (_, i) => (
        <div key={i} className="absolute inset-x-0 border-t border-line-soft/70" style={{ top: i * 60 * PX_PER_MIN }} />
      ))}
      {/* Außerhalb der Arbeitszeit */}
      {shift ? (
        <>
          <div className="absolute inset-x-0 top-0 bg-cream-200/50" style={{ height: Math.max(0, minutesBetween(berlinToISO(date, '08:00'), shift.start)) * PX_PER_MIN }} />
          <div className="absolute inset-x-0 bottom-0 bg-cream-200/50" style={{ top: Math.min(HEIGHT, minutesBetween(berlinToISO(date, '08:00'), shift.end) * PX_PER_MIN) }} />
        </>
      ) : (
        <div className="absolute inset-0 bg-cream-200/50" />
      )}
      {blocks.map((t) => {
        const p = place(date, t.start, t.end);
        return (
          <button
            key={t.id}
            onClick={() => onTimeOff(t)}
            className={cn(
              'absolute inset-x-1 overflow-hidden rounded-lg border px-2 py-1 text-left text-[0.7rem]',
              t.reason === 'treatwell' ? 'border-amber-600/50 text-amber-800' : 'border-line text-muted',
            )}
            style={{ top: p.top, height: p.height, background: 'repeating-linear-gradient(135deg, rgb(205 184 148 / 0.28) 0 6px, transparent 6px 12px)' }}
          >
            {t.reason === 'treatwell' ? 'Treatwell' : t.reason === 'urlaub' ? 'Urlaub' : t.reason === 'pause' ? 'Pause' : 'Geblockt'}
            {t.note && <span className="block truncate opacity-75">{t.note}</span>}
          </button>
        );
      })}
      {items.map(({ b, i }) => {
        const p = place(date, i.start, i.end);
        const cancelled = b.status === 'storniert';
        return (
          <button
            key={b.id + i.start + i.serviceId}
            onClick={() => onBooking(b)}
            className={cn(
              'absolute inset-x-1 overflow-hidden rounded-lg px-2 py-1 text-left text-[0.72rem] leading-tight shadow-sm transition-transform hover:scale-[1.02]',
              cancelled ? 'border border-dashed border-line bg-card text-muted line-through' : b.source === 'treatwell' ? 'bg-honey-200 text-honey-950' : 'bg-honey-950 text-cream-50',
            )}
            style={{ top: p.top, height: p.height }}
          >
            <span className="font-medium">{berlinTime(i.start)}</span> {services.find((s) => s.id === i.serviceId)?.name}
            {b.source === 'treatwell' && <span className="block text-[0.62rem] uppercase tracking-wider">Treatwell</span>}
          </button>
        );
      })}
    </div>
  );
}

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

  const { data } = useData(async (db) => {
    const [bookings, staff, workingHours, timeOff, services, staffServices, customers] = await Promise.all([
      db.listBookings({ from: berlinToISO(addDaysToDate(date, -7), '00:00'), to: berlinToISO(addDaysToDate(date, 8), '23:59') }),
      db.listStaff(),
      db.listWorkingHours(),
      db.listTimeOff(),
      db.listServices(),
      db.listStaffServices(),
      db.listCustomers(),
    ]);
    return { bookings, staff, workingHours, timeOff, services, staffServices, customers };
  }, [date]);

  // Detail-Drawer nach Änderungen aktuell halten
  const liveDetail = detail && data ? (data.bookings.find((b) => b.id === detail.id) ?? detail) : detail;

  if (!data) return null;
  const { bookings, staff, workingHours, timeOff, services, staffServices, customers } = data;
  const shiftOf = (staffId: string, d: string) => {
    const h = workingHours.find((w) => w.staffId === staffId && w.weekday === weekdayOf(d));
    return h ? { start: berlinToISO(d, h.start), end: berlinToISO(d, h.end) } : undefined;
  };
  const dayStart = berlinToISO(date, '00:00');
  const dayEnd = berlinToISO(date, '23:59');
  const columns = staff.filter(
    (s) => s.bookable && (shiftOf(s.id, date) || bookings.some((b) => b.items.some((i) => i.staffId === s.id && i.start >= dayStart && i.start <= dayEnd))),
  );
  // Woche ab Montag
  const monday = addDaysToDate(date, -(weekdayOf(date) - 1));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDaysToDate(monday, i));
  const step = view === 'tag' ? 1 : 7;
  const count = bookings.filter((b) => b.status !== 'storniert' && b.start >= dayStart && b.start <= dayEnd).length;

  return (
    <div>
      <AdminTitle eyebrow="Kalender" title={view === 'tag' ? formatDateLong(berlinToISO(date, '12:00')) : `Woche ab ${formatDateShort(berlinToISO(monday, '12:00'))}`}>
        <Button variant="ghost" onClick={() => setBlocking(true)}>
          <Ban className="h-4 w-4" strokeWidth={1.5} /> Zeit blocken
        </Button>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Termin anlegen
        </Button>
      </AdminTitle>

      <Notice>
        <strong className="font-medium">Treatwell-Termine hier blocken, damit nichts doppelt vergeben wird.</strong> Geblockte Zeiten sind schraffiert und für Online-Buchungen gesperrt.
      </Notice>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => setDate(addDaysToDate(date, -step))} className="grid h-11 w-11 place-items-center rounded-full border border-line" aria-label="Zurück">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button onClick={() => setDate(today)} className="min-h-11 rounded-full border border-line px-4 text-sm">
            Heute
          </button>
          <button onClick={() => setDate(addDaysToDate(date, step))} className="grid h-11 w-11 place-items-center rounded-full border border-line" aria-label="Weiter">
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="ml-2 min-h-11 rounded-full border border-line bg-card px-4 text-sm" aria-label="Datum wählen" />
        </div>
        <div className="flex items-center gap-2">
          {view === 'woche' && (
            <Select value={weekStaff} onChange={(e) => setWeekStaff(e.target.value)} className="!min-h-11 !w-auto">
              {staff.filter((s) => s.bookable).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          )}
          <Tabs value={view} onChange={setView} options={[{ value: 'tag', label: 'Tag' }, { value: 'woche', label: 'Woche' }]} />
        </div>
      </div>
      {view === 'tag' && <p className="mt-3 text-sm text-muted">{count} Termine · {columns.length} Honigseelen im Studio</p>}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line-soft bg-card" data-lenis-prevent>
        <div className="min-w-max">
          {/* Kopfzeile */}
          <div className="sticky top-0 z-10 flex border-b border-line-soft bg-card">
            <div className="w-12 shrink-0" />
            {view === 'tag'
              ? columns.map((s) => {
                  const sh = shiftOf(s.id, date);
                  return (
                    <div key={s.id} className="flex flex-1 items-center gap-2 border-l border-line-soft px-2 py-3" style={{ minWidth: 130 }}>
                      <Avatar name={s.name} tone={s.avatarTone} size="sm" />
                      <span className="text-sm">
                        <span className="block font-medium">{s.name}</span>
                        <span className="text-[0.68rem] text-muted">{sh ? `${berlinTime(sh.start)}–${berlinTime(sh.end)}` : 'frei'}</span>
                      </span>
                    </div>
                  );
                })
              : weekDays.map((d) => (
                  <button key={d} onClick={() => { setDate(d); setView('tag'); }} className={cn('flex-1 border-l border-line-soft px-2 py-3 text-left text-sm', d === today && 'text-amber-800')} style={{ minWidth: 130 }}>
                    <span className="block font-medium">{formatDateShort(berlinToISO(d, '12:00'))}</span>
                    <span className="text-[0.68rem] text-muted">{(() => { const sh = shiftOf(weekStaff, d); return sh ? `${berlinTime(sh.start)}–${berlinTime(sh.end)}` : 'frei'; })()}</span>
                  </button>
                ))}
          </div>
          <div className="flex pt-3">
            <Hours />
            {view === 'tag' &&
              columns.map((s) => (
                <Column key={s.id} date={date} staffId={s.id} shift={shiftOf(s.id, date)} bookings={bookings} timeOff={timeOff} services={services} onBooking={setDetail} onTimeOff={setOffDetail} />
              ))}
            {view === 'tag' && columns.length === 0 && <p className="flex-1 p-10 text-center text-sm text-muted">An diesem Tag arbeitet niemand.</p>}
            {view === 'woche' &&
              weekDays.map((d) => (
                <Column key={d} date={d} staffId={weekStaff} shift={shiftOf(weekStaff, d)} bookings={bookings} timeOff={timeOff} services={services} onBooking={setDetail} onTimeOff={setOffDetail} />
              ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-honey-950" /> Online / Team</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-honey-200" /> Treatwell</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded border border-line" style={{ background: 'repeating-linear-gradient(135deg, rgb(205 184 148 / 0.5) 0 3px, transparent 3px 6px)' }} /> Geblockt / Urlaub</span>
      </div>

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
      <NewBookingDrawer open={creating} onClose={() => setCreating(false)} date={date} services={services} staff={staff} staffServices={staffServices} customers={customers} />
      <BlockDrawer open={blocking} onClose={() => setBlocking(false)} date={date} staff={staff} staffId={view === 'woche' ? weekStaff : undefined} />
      <TimeOffDrawer entry={offDetail} onClose={() => setOffDetail(null)} staff={staff} />
    </div>
  );
}
