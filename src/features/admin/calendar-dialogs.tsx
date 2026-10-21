'use client';
// Dialoge des Admin-Kalenders: Termin anlegen, verschieben, Details, Zeit blocken.
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { getAdapter } from '@/data';
import type { Slot } from '@/domain/slots';
import { berlinDate, berlinToISO, formatDateLong } from '@/domain/time';
import type { Booking, Customer, Service, Staff, StaffService, TimeOff } from '@/domain/types';
import { cn } from '@/lib/cn';
import { berlinTime, formatEuro } from '@/lib/format';
import { statusLabels } from './ui';

function SlotPicker({ slots, value, onChange, staff }: { slots: Slot[] | null; value?: Slot; onChange: (s: Slot) => void; staff: Staff[] }) {
  if (slots === null) return <p className="text-sm text-muted">Freie Zeiten werden gesucht …</p>;
  if (slots.length === 0) return <p className="text-sm text-muted">An diesem Tag ist nichts frei.</p>;
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((s) => (
        <button
          key={s.start}
          type="button"
          onClick={() => onChange(s)}
          className={cn('flex min-h-12 flex-col items-center justify-center rounded-xl border text-sm', value?.start === s.start ? 'border-honey-950 bg-honey-950 text-cream-50' : 'border-line bg-card')}
        >
          {berlinTime(s.start)}
          <span className="text-[0.66rem] opacity-70">{staff.find((p) => p.id === s.items[0].staffId)?.name}</span>
        </button>
      ))}
    </div>
  );
}

function useSlots(date: string, serviceIds: string[], staffId?: string, ignoreBookingId?: string) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const key = serviceIds.join(',');
  useEffect(() => {
    let alive = true;
    setSlots(null);
    if (!date || !key) {
      setSlots([]);
      return;
    }
    getAdapter()
      .findSlots({ date, serviceIds: key.split(','), staffId, ignoreBookingId })
      .then((s) => alive && setSlots(s));
    return () => {
      alive = false;
    };
  }, [date, key, staffId, ignoreBookingId]);
  return slots;
}

export function NewBookingDrawer({
  open,
  onClose,
  date: initialDate,
  services,
  staff,
  staffServices,
  customers,
}: {
  open: boolean;
  onClose: () => void;
  date: string;
  services: Service[];
  staff: Staff[];
  staffServices: StaffService[];
  customers: Customer[];
}) {
  const [customerId, setCustomerId] = useState('neu');
  const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState(initialDate);
  const [slot, setSlot] = useState<Slot>();
  const [error, setError] = useState('');
  useEffect(() => setDate(initialDate), [initialDate]);

  const bookable = useMemo(() => services.filter((s) => s.active && s.bookable).sort((a, b) => a.categoryId.localeCompare(b.categoryId)), [services]);
  const offering = staff.filter((p) => staffServices.some((r) => r.serviceId === serviceId && r.staffId === p.id));
  const slots = useSlots(date, serviceId ? [serviceId] : [], staffId || undefined);
  const existing = customers.find((c) => c.id === customerId);

  const save = async () => {
    setError('');
    if (!slot) return setError('Bitte einen freien Slot wählen.');
    const customer = existing ?? newCustomer;
    if (!customer.firstName || !customer.email) return setError('Bitte Name und E-Mail der Kundin angeben.');
    try {
      await getAdapter().createBooking({
        customer: existing ? { ...existing } : newCustomer,
        items: slot.items,
        discountCents: 0,
        payment: { mode: 'karte-hinterlegt', method: 'vor-ort' },
        source: 'team',
      });
      setSlot(undefined);
      setServiceId('');
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Speichern fehlgeschlagen.');
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="Termin anlegen" footer={<Button className="w-full" onClick={save} disabled={!slot}>Termin speichern</Button>}>
      <div className="space-y-5">
        <Field label="Kundin">
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="neu">Neue Kundin …</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} · {c.email}
              </option>
            ))}
          </Select>
        </Field>
        {customerId === 'neu' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vorname"><Input value={newCustomer.firstName} onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })} /></Field>
            <Field label="Nachname"><Input value={newCustomer.lastName} onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })} /></Field>
            <Field label="E-Mail"><Input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} /></Field>
            <Field label="Telefon"><Input type="tel" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} /></Field>
          </div>
        )}
        <Field label="Leistung">
          <Select value={serviceId} onChange={(e) => { setServiceId(e.target.value); setStaffId(''); setSlot(undefined); }}>
            <option value="">Bitte wählen …</option>
            {bookable.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.group ?? s.categoryId}) · {formatEuro(s.priceCents)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Anbieterin">
            <Select value={staffId} onChange={(e) => { setStaffId(e.target.value); setSlot(undefined); }} disabled={!serviceId}>
              <option value="">Egal</option>
              {offering.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Tag">
            <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlot(undefined); }} />
          </Field>
        </div>
        {serviceId && (
          <div>
            <p className="mb-2 text-sm font-medium">Freie Zeiten</p>
            <SlotPicker slots={slots} value={slot} onChange={setSlot} staff={staff} />
          </div>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Drawer>
  );
}

export function MoveBookingDrawer({ booking, onClose, staff }: { booking: Booking | null; onClose: () => void; staff: Staff[] }) {
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState<Slot>();
  useEffect(() => {
    if (booking) {
      setDate(berlinDate(booking.start));
      setSlot(undefined);
    }
  }, [booking]);
  const sameStaff = booking ? booking.items.every((i) => i.staffId === booking.items[0].staffId) : false;
  const [keepStaff, setKeepStaff] = useState(true);
  const slots = useSlots(date, booking ? booking.items.map((i) => i.serviceId) : [], booking && sameStaff && keepStaff ? booking.items[0].staffId : undefined, booking?.id);
  const save = async () => {
    if (!booking || !slot) return;
    await getAdapter().rescheduleBooking(booking.id, slot);
    onClose();
  };
  return (
    <Drawer open={Boolean(booking)} onClose={onClose} title="Termin verschieben" footer={<Button className="w-full" onClick={save} disabled={!slot}>Verschieben</Button>}>
      {booking && (
        <div className="space-y-5">
          <p className="text-sm text-muted">Bisher: {formatDateLong(booking.start)}, {berlinTime(booking.start)} Uhr</p>
          <Field label="Neuer Tag">
            <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlot(undefined); }} />
          </Field>
          {sameStaff && (
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" className="h-5 w-5 accent-amber-600" checked={keepStaff} onChange={(e) => setKeepStaff(e.target.checked)} />
              Bei {staff.find((s) => s.id === booking.items[0].staffId)?.name} bleiben
            </label>
          )}
          <SlotPicker slots={slots} value={slot} onChange={setSlot} staff={staff} />
        </div>
      )}
    </Drawer>
  );
}

export function BookingDetailDrawer({
  booking,
  onClose,
  onMove,
  services,
  staff,
  customers,
}: {
  booking: Booking | null;
  onClose: () => void;
  onMove: (b: Booking) => void;
  services: Service[];
  staff: Staff[];
  customers: Customer[];
}) {
  const c = booking && customers.find((x) => x.id === booking.customerId);
  const cancel = async () => {
    if (!booking || !confirm('Termin stornieren? Für die Kundin entstehen keine Kosten (Team-Storno).')) return;
    await getAdapter().cancelBooking(booking.id, 'team');
    onClose();
  };
  return (
    <Drawer
      open={Boolean(booking)}
      onClose={onClose}
      title="Termin"
      footer={
        booking?.status === 'bestaetigt' && (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={cancel}>Stornieren</Button>
            <Button onClick={() => booking && onMove(booking)}>Verschieben</Button>
          </div>
        )
      }
    >
      {booking && (
        <div className="space-y-5 text-sm">
          <div>
            <p className="eyebrow">{formatDateLong(booking.start)}</p>
            <p className="mt-1 font-serif text-3xl">
              {berlinTime(booking.start)} – {berlinTime(booking.end)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge tone={booking.status === 'storniert' ? 'danger' : 'line'}>{statusLabels[booking.status]}</Badge>
              {booking.source === 'treatwell' && <Badge tone="honey">Treatwell</Badge>}
              {booking.source === 'team' && <Badge>vom Team angelegt</Badge>}
            </div>
          </div>
          {c && (
            <div className="rounded-xl bg-cream-100 p-4">
              <p className="font-medium">{c.firstName} {c.lastName}</p>
              <p className="text-muted">{c.email}{c.phone && ` · ${c.phone}`}</p>
              {c.laserConsultationDone && <p className="mt-1 text-xs text-success">Laser-Vorgespräch erledigt</p>}
            </div>
          )}
          <ul className="divide-y divide-line-soft border-y border-line-soft">
            {booking.items.map((i) => (
              <li key={i.start + i.serviceId} className="flex justify-between gap-3 py-3">
                <span>
                  {services.find((s) => s.id === i.serviceId)?.name}
                  <span className="block text-xs text-muted">{berlinTime(i.start)} · {staff.find((s) => s.id === i.staffId)?.name} · {i.roomId}</span>
                </span>
                {formatEuro(i.priceCents)}
              </li>
            ))}
          </ul>
          <dl className="space-y-1">
            <div className="flex justify-between"><dt className="text-muted">Gesamt</dt><dd>{formatEuro(booking.totalCents)}</dd></div>
            {booking.voucherCents > 0 && <div className="flex justify-between"><dt className="text-muted">Gutschein {booking.voucherCode}</dt><dd>−{formatEuro(booking.voucherCents)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted">Zahlung</dt><dd>{booking.payment.mode === 'vorab' ? 'vorab' : 'Karte hinterlegt'} · {booking.payment.method} · {booking.payment.status}</dd></div>
            {booking.cancellation && <div className="flex justify-between"><dt className="text-muted">Storno-Gebühr</dt><dd>{formatEuro(booking.cancellation.feeCents)}</dd></div>}
          </dl>
          {booking.note && <p className="rounded-xl border border-line-soft p-3 italic text-muted">„{booking.note}“</p>}
        </div>
      )}
    </Drawer>
  );
}

export function BlockDrawer({ open, onClose, date: initialDate, staff, staffId: initialStaff }: { open: boolean; onClose: () => void; date: string; staff: Staff[]; staffId?: string }) {
  const [form, setForm] = useState({ staffId: initialStaff ?? '', date: initialDate, from: '12:00', to: '13:00', reason: 'treatwell' as TimeOff['reason'], note: '' });
  useEffect(() => setForm((f) => ({ ...f, date: initialDate, staffId: initialStaff ?? f.staffId })), [initialDate, initialStaff]);
  const save = async () => {
    if (!form.staffId || form.from >= form.to) return;
    await getAdapter().addTimeOff({
      staffId: form.staffId,
      start: berlinToISO(form.date, form.from),
      end: berlinToISO(form.date, form.to),
      reason: form.reason,
      note: form.note || (form.reason === 'treatwell' ? 'Treatwell-Buchung' : undefined),
    });
    onClose();
  };
  return (
    <Drawer open={open} onClose={onClose} title="Zeit blocken" footer={<Button className="w-full" onClick={save} disabled={!form.staffId || form.from >= form.to}>Blocken</Button>}>
      <div className="space-y-5">
        <p className="rounded-xl bg-honey-200/40 p-3 text-sm">Treatwell-Termine hier blocken, damit nichts doppelt vergeben wird.</p>
        <Field label="Anbieterin">
          <Select value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })}>
            <option value="">Bitte wählen …</option>
            {staff.filter((s) => s.bookable).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Tag"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Von"><Input type="time" step={900} value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></Field>
          <Field label="Bis"><Input type="time" step={900} value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} /></Field>
        </div>
        <Field label="Grund">
          <Select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value as TimeOff['reason'] })}>
            <option value="treatwell">Treatwell-Termin</option>
            <option value="block">Geblockt</option>
            <option value="pause">Pause</option>
            <option value="urlaub">Urlaub</option>
          </Select>
        </Field>
        <Field label="Notiz (optional)"><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
      </div>
    </Drawer>
  );
}

export function TimeOffDrawer({ entry, onClose, staff }: { entry: TimeOff | null; onClose: () => void; staff: Staff[] }) {
  const remove = async () => {
    if (!entry) return;
    await getAdapter().removeTimeOff(entry.id);
    onClose();
  };
  const labels: Record<TimeOff['reason'], string> = { treatwell: 'Treatwell-Termin', block: 'Geblockt', pause: 'Pause', urlaub: 'Urlaub' };
  return (
    <Drawer open={Boolean(entry)} onClose={onClose} title="Block" footer={<Button variant="ghost" className="w-full" onClick={remove}>Block entfernen</Button>}>
      {entry && (
        <div className="space-y-2 text-sm">
          <p className="font-serif text-3xl">{labels[entry.reason]}</p>
          <p>{staff.find((s) => s.id === entry.staffId)?.name}</p>
          <p className="text-muted">
            {formatDateLong(entry.start)}, {berlinTime(entry.start)} – {formatDateLong(entry.end) === formatDateLong(entry.start) ? '' : `${formatDateLong(entry.end)}, `}{berlinTime(entry.end)}
          </p>
          {entry.note && <p className="italic text-muted">{entry.note}</p>}
        </div>
      )}
    </Drawer>
  );
}
