// Freie Termine aus Arbeitszeiten, Abwesenheiten, bestehenden Buchungen, Dauer, Puffer und Räumen.
// Mehrere Leistungen werden nacheinander gelegt; bei "egal" darf jede Leistung eine andere Anbieterin haben.
import { addMinutes, berlinToISO, overlaps, weekdayOf } from './time';
import { priceFor } from './pricing';
import type {
  Booking,
  BookingItem,
  Room,
  RoomType,
  Service,
  StaffService,
  TimeOff,
  WorkingHours,
} from './types';

export interface SlotContext {
  services: Service[];
  staffServices: StaffService[];
  workingHours: WorkingHours[];
  timeOff: TimeOff[];
  bookings: Booking[];
  rooms: Room[];
  roomTypeOf: (service: Service) => RoomType;
  bufferMin: number;
  stepMin: number;
}

export interface SlotRequest {
  date: string; // Berliner Kalendertag
  serviceIds: string[];
  /** undefined = "egal, erste Freie" */
  staffId?: string;
  reduced?: boolean;
  /** Termine vor diesem Zeitpunkt sind nicht buchbar */
  notBefore?: Date;
  /** Beim Umbuchen die eigene Buchung ignorieren */
  ignoreBookingId?: string;
}

export interface Slot {
  start: string;
  end: string;
  items: BookingItem[];
}

interface Busy {
  start: string;
  end: string;
}

function staffBusy(ctx: SlotContext, staffId: string, ignoreBookingId?: string): Busy[] {
  const fromBookings = ctx.bookings
    .filter((b) => b.status !== 'storniert' && b.id !== ignoreBookingId)
    .flatMap((b) => b.items.filter((i) => i.staffId === staffId))
    .map((i) => ({ start: i.start, end: addMinutes(i.end, ctx.bufferMin) }));
  const fromTimeOff = ctx.timeOff.filter((t) => t.staffId === staffId);
  return [...fromBookings, ...fromTimeOff];
}

function roomBusy(ctx: SlotContext, roomId: string, ignoreBookingId?: string): Busy[] {
  return ctx.bookings
    .filter((b) => b.status !== 'storniert' && b.id !== ignoreBookingId)
    .flatMap((b) => b.items.filter((i) => i.roomId === roomId))
    .map((i) => ({ start: i.start, end: addMinutes(i.end, ctx.bufferMin) }));
}

function isFree(busy: Busy[], start: string, end: string): boolean {
  return !busy.some((b) => overlaps(b.start, b.end, start, end));
}

/** Arbeitszeitfenster einer Anbieterin an einem Tag (ISO) */
export function shiftOf(ctx: SlotContext, staffId: string, date: string): Busy | undefined {
  const wd = weekdayOf(date);
  const h = ctx.workingHours.find((w) => w.staffId === staffId && w.weekday === wd);
  return h ? { start: berlinToISO(date, h.start), end: berlinToISO(date, h.end) } : undefined;
}

export function staffFor(ctx: SlotContext, serviceId: string): string[] {
  return ctx.staffServices.filter((r) => r.serviceId === serviceId).map((r) => r.staffId);
}

/**
 * Versucht, alle Leistungen ab `start` lückenlos nacheinander zu legen.
 * Bevorzugt dieselbe Anbieterin wie bei der vorherigen Leistung.
 */
function placeChain(
  ctx: SlotContext,
  req: SlotRequest,
  services: Service[],
  start: string,
  memo: { busy: Map<string, Busy[]>; shifts: Map<string, Busy | undefined> },
): BookingItem[] | null {
  const items: BookingItem[] = [];
  let cursor = start;
  for (const service of services) {
    const offered = staffFor(ctx, service.id);
    let candidates = req.staffId ? offered.filter((id) => id === req.staffId) : offered;
    const prev = items[items.length - 1]?.staffId;
    if (prev) candidates = [prev, ...candidates.filter((id) => id !== prev)];
    let placed: BookingItem | null = null;
    for (const staffId of candidates) {
      const { priceCents, durationMin } = priceFor(service, staffId, ctx.staffServices, {
        reduced: req.reduced,
      });
      const end = addMinutes(cursor, durationMin);
      if (!memo.shifts.has(staffId)) memo.shifts.set(staffId, shiftOf(ctx, staffId, req.date));
      const shift = memo.shifts.get(staffId);
      if (!shift || cursor < shift.start || end > shift.end) continue;
      const key = `s:${staffId}`;
      if (!memo.busy.has(key)) memo.busy.set(key, staffBusy(ctx, staffId, req.ignoreBookingId));
      // Innerhalb der eigenen Kette wird die Anbieterin ebenfalls belegt
      const own = items.filter((i) => i.staffId === staffId);
      if (!isFree([...memo.busy.get(key)!, ...own], cursor, end)) continue;
      const roomType = ctx.roomTypeOf(service);
      const room = ctx.rooms
        .filter((r) => r.type === roomType)
        .find((r) => {
          const rk = `r:${r.id}`;
          if (!memo.busy.has(rk)) memo.busy.set(rk, roomBusy(ctx, r.id, req.ignoreBookingId));
          return isFree(memo.busy.get(rk)!, cursor, end);
        });
      if (!room) continue;
      placed = { serviceId: service.id, staffId, roomId: room.id, start: cursor, end, priceCents };
      break;
    }
    if (!placed) return null;
    items.push(placed);
    cursor = placed.end;
  }
  return items;
}

export function findSlots(ctx: SlotContext, req: SlotRequest): Slot[] {
  const services = req.serviceIds
    .map((id) => ctx.services.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s));
  if (services.length === 0) return [];

  // Frühester Beginn / spätestes Ende über alle beteiligten Anbieterinnen
  const staffIds = new Set(services.flatMap((s) => staffFor(ctx, s.id)));
  const shifts = [...staffIds]
    .filter((id) => !req.staffId || id === req.staffId)
    .map((id) => shiftOf(ctx, id, req.date))
    .filter((s): s is Busy => Boolean(s));
  if (shifts.length === 0) return [];
  const dayStart = shifts.map((s) => s.start).sort()[0];
  const dayEnd = shifts.map((s) => s.end).sort().at(-1)!;

  const memo = { busy: new Map<string, Busy[]>(), shifts: new Map<string, Busy | undefined>() };
  const slots: Slot[] = [];
  for (let t = dayStart; t < dayEnd; t = addMinutes(t, ctx.stepMin)) {
    if (req.notBefore && new Date(t) < req.notBefore) continue;
    const items = placeChain(ctx, req, services, t, memo);
    if (items) slots.push({ start: t, end: items[items.length - 1].end, items });
  }
  return slots;
}

/** Laser: Ohne erledigtes Vorgespräch ist nur das Vorgespräch buchbar. */
export function laserGate(
  selected: Service[],
  consultationDone: boolean,
): { ok: true } | { ok: false; reason: string } {
  const needs = selected.some((s) => s.requiresConsultation);
  if (!needs || consultationDone) return { ok: true };
  return {
    ok: false,
    reason:
      'Vor Deiner ersten Laser-Behandlung lernen wir Deine Haut im Vorgespräch kennen. Buch bitte zuerst das Vorgespräch – die Behandlung folgt danach.',
  };
}
