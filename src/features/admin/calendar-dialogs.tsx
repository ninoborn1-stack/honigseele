'use client';
// Dialoge des Admin-Kalenders: Termin eintragen (Schritt für Schritt), verschieben, ansehen, Zeit blocken.
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Field, Input, Textarea } from '@/components/ui/form';
import { InlineLoading, Loading } from '@/components/ui/loading';
import { getAdapter } from '@/data';
import type { Slot } from '@/domain/slots';
import { addDaysToDate, berlinDate, berlinToISO, formatDateLong } from '@/domain/time';
import type { Booking, Customer, Service, Staff, StaffService, TimeOff } from '@/domain/types';
import { cn } from '@/lib/cn';
import { berlinTime, formatDuration, formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import {
  Choice,
  MoreOptions,
  notify,
  paymentMethodLabels,
  paymentStatusLabels,
  statusLabels,
} from './ui';

export const timeOffLabels: Record<TimeOff['reason'], string> = {
  treatwell: 'Treatwell-Termin',
  block: 'Sonstiges',
  pause: 'Pause',
  urlaub: 'Urlaub',
};

/** Tag wählen: „Heute“, „Morgen“ oder ein beliebiges Datum */
function DayPicker({
  value,
  onChange,
  label = 'Tag',
}: {
  value: string;
  onChange: (d: string) => void;
  label?: string;
}) {
  const today = berlinDate(new Date());
  const tomorrow = addDaysToDate(today, 1);
  const chip = (d: string, text: string) => (
    <button
      type="button"
      onClick={() => onChange(d)}
      aria-pressed={value === d}
      className={cn(
        'min-h-12 rounded-full border px-5 text-base',
        value === d ? 'border-honey-950 bg-honey-950 text-cream-50' : 'border-line bg-card',
      )}
    >
      {text}
    </button>
  );
  return (
    <div>
      <p className="mb-2 text-base font-medium">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {chip(today, 'Heute')}
        {chip(tomorrow, 'Morgen')}
        <input
          type="date"
          value={value}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="border-line bg-card min-h-12 rounded-full border px-4 text-base"
          aria-label={`${label}: anderes Datum`}
        />
      </div>
    </div>
  );
}

/** Freie Uhrzeiten als große Knöpfe */
function TimePicker({
  slots,
  value,
  onChange,
  staff,
}: {
  slots: Slot[] | null;
  value?: Slot;
  onChange: (s: Slot) => void;
  staff: Staff[];
}) {
  if (slots === null)
    return <Loading size={44} label="Freie Uhrzeiten werden gesucht …" className="py-6" />;
  if (slots.length === 0)
    return (
      <p className="bg-cream-100 rounded-2xl p-4 text-base">
        An diesem Tag ist leider nichts mehr frei. Bitte einen anderen Tag wählen.
      </p>
    );
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((s) => (
        <button
          key={s.start}
          type="button"
          onClick={() => onChange(s)}
          aria-pressed={value?.start === s.start}
          className={cn(
            'flex min-h-16 flex-col items-center justify-center rounded-2xl border text-lg font-medium',
            value?.start === s.start
              ? 'border-honey-950 bg-honey-950 text-cream-50'
              : 'border-line bg-card hover:border-honey-950',
          )}
        >
          {berlinTime(s.start)} Uhr
          <span className="text-sm font-normal opacity-75">
            bei {staff.find((p) => p.id === s.items[0].staffId)?.name}
          </span>
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

const STEPS = [
  'Leistung wählen',
  'Mitarbeiterin wählen',
  'Tag und Uhrzeit wählen',
  'Kundin eintragen',
] as const;

/** Bereits Gewähltes, antippbar zum Ändern */
function Picked({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="border-line-soft flex min-h-12 w-full items-center justify-between gap-3 border-b py-2 text-left text-base"
    >
      <span className="min-w-0">
        <span className="text-muted block text-sm">{label}</span>
        <span className="block truncate font-medium">{value}</span>
      </span>
      <span className="shrink-0 text-amber-800 underline underline-offset-4">ändern</span>
    </button>
  );
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
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState('');
  const [query, setQuery] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState<string | null>(null); // '' = egal
  const [date, setDate] = useState(initialDate);
  const [slot, setSlot] = useState<Slot>();
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { data: categories } = useData((db) => db.listCategories(), []);

  // Bei jedem Öffnen frisch beginnen
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setCat('');
    setQuery('');
    setServiceId('');
    setStaffId(null);
    setDate(initialDate);
    setSlot(undefined);
    setCustomerQuery('');
    setCustomerId('');
    setIsNewCustomer(false);
    setNewCustomer({ firstName: '', lastName: '', email: '', phone: '' });
    setError('');
  }, [open, initialDate]);

  const bookable = useMemo(() => services.filter((s) => s.active && s.bookable), [services]);
  const service = services.find((s) => s.id === serviceId);
  const offering = staff.filter((p) =>
    staffServices.some((r) => r.serviceId === serviceId && r.staffId === p.id),
  );
  const slots = useSlots(step >= 2 ? date : '', serviceId ? [serviceId] : [], staffId || undefined);
  const existing = customers.find((c) => c.id === customerId);

  const q = query.trim().toLowerCase();
  const serviceList = q
    ? bookable.filter((s) => `${s.name} ${s.group ?? ''}`.toLowerCase().includes(q))
    : cat
      ? bookable.filter((s) => s.categoryId === cat)
      : [];
  const cq = customerQuery.trim().toLowerCase();
  const customerList = cq
    ? customers
        .filter((c) =>
          `${c.firstName} ${c.lastName} ${c.email} ${c.phone ?? ''}`.toLowerCase().includes(cq),
        )
        .slice(0, 6)
    : [];

  const save = async () => {
    setError('');
    if (!slot) return setError('Bitte zuerst eine Uhrzeit wählen.');
    const customer = existing ?? newCustomer;
    if (!customer.firstName.trim() || !customer.email.trim())
      return setError('Bitte Vorname und E-Mail der Kundin eintragen.');
    setSaving(true);
    try {
      await getAdapter().createBooking({
        customer: existing ? { ...existing } : newCustomer,
        items: slot.items,
        discountCents: 0,
        payment: { mode: 'karte-hinterlegt', method: 'vor-ort' },
        source: 'team',
      });
      notify('Termin eingetragen.');
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Das hat nicht geklappt. Bitte noch einmal versuchen.',
      );
    } finally {
      setSaving(false);
    }
  };

  const canSave = Boolean(slot && (existing || isNewCustomer));
  const footer = (
    <div className="flex gap-2">
      {step > 0 && (
        <Button variant="ghost" size="lg" onClick={() => setStep(step - 1)}>
          ← Zurück
        </Button>
      )}
      {step === 3 ? (
        <Button size="lg" className="flex-1" onClick={save} disabled={!canSave || saving}>
          {saving ? (
            <InlineLoading variant="light" label="Wird gespeichert …" />
          ) : (
            'Termin speichern'
          )}
        </Button>
      ) : (
        <p className="text-muted flex min-h-14 flex-1 items-center justify-end text-base">
          Schritt {step + 1} von 4
        </p>
      )}
    </div>
  );

  return (
    <Drawer open={open} onClose={onClose} title="Termin eintragen" footer={footer}>
      <div className="space-y-5">
        {/* Bisherige Auswahl */}
        {step > 0 && (
          <div>
            {service && (
              <Picked
                label="Leistung"
                value={`${service.name} · ${formatDuration(service.durationMin)}`}
                onEdit={() => setStep(0)}
              />
            )}
            {step > 1 && (
              <Picked
                label="Bei"
                value={
                  staffId ? (staff.find((p) => p.id === staffId)?.name ?? '') : 'Egal, wer frei ist'
                }
                onEdit={() => setStep(1)}
              />
            )}
            {step > 2 && slot && (
              <Picked
                label="Wann"
                value={`${formatDateLong(slot.start)}, ${berlinTime(slot.start)} Uhr`}
                onEdit={() => setStep(2)}
              />
            )}
          </div>
        )}

        <h3 className="font-serif text-2xl">
          {step + 1}. {STEPS[step]}
        </h3>

        {step === 0 && (
          <div className="space-y-4">
            <div className="relative">
              <Search
                className="text-muted pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2"
                strokeWidth={1.5}
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Leistung suchen, z. B. Beine"
                className="!pl-12"
                aria-label="Leistung suchen"
              />
            </div>
            {!q && !cat && (
              <div className="grid gap-2">
                {(categories ?? [])
                  .filter((c) => bookable.some((s) => s.categoryId === c.id))
                  .map((c) => (
                    <Choice
                      key={c.id}
                      title={c.name}
                      sub={`${bookable.filter((s) => s.categoryId === c.id).length} Leistungen`}
                      aside="→"
                      onClick={() => setCat(c.id)}
                    />
                  ))}
              </div>
            )}
            {!q && cat && (
              <button
                type="button"
                onClick={() => setCat('')}
                className="min-h-12 text-base text-amber-800 underline underline-offset-4"
              >
                ← Alle Bereiche
              </button>
            )}
            {(q || cat) && (
              <div className="grid gap-2">
                {serviceList.map((s) => (
                  <Choice
                    key={s.id}
                    selected={s.id === serviceId}
                    title={s.name}
                    sub={[s.group, formatDuration(s.durationMin)].filter(Boolean).join(' · ')}
                    aside={formatEuro(s.priceCents, { from: s.priceFrom })}
                    onClick={() => {
                      setServiceId(s.id);
                      setStaffId(null);
                      setSlot(undefined);
                      setStep(1);
                    }}
                  />
                ))}
                {serviceList.length === 0 && (
                  <p className="text-muted text-base">Nichts gefunden.</p>
                )}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-2">
            <Choice
              selected={staffId === ''}
              title="Egal, wer frei ist"
              sub="Zeigt alle freien Uhrzeiten"
              onClick={() => {
                setStaffId('');
                setSlot(undefined);
                setStep(2);
              }}
            />
            {offering.map((p) => (
              <Choice
                key={p.id}
                selected={staffId === p.id}
                title={p.name}
                sub={p.role}
                onClick={() => {
                  setStaffId(p.id);
                  setSlot(undefined);
                  setStep(2);
                }}
              />
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <DayPicker
              value={date}
              onChange={(d) => {
                setDate(d);
                setSlot(undefined);
              }}
            />
            <div>
              <p className="mb-2 text-base font-medium">Uhrzeit wählen</p>
              <TimePicker
                slots={slots}
                value={slot}
                staff={staff}
                onChange={(s) => {
                  setSlot(s);
                  setStep(3);
                }}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {!isNewCustomer && (
              <>
                <div className="relative">
                  <Search
                    className="text-muted pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2"
                    strokeWidth={1.5}
                  />
                  <Input
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    placeholder="Name, E-Mail oder Telefon"
                    className="!pl-12"
                    aria-label="Kundin suchen"
                  />
                </div>
                <div className="grid gap-2">
                  {customerList.map((c) => (
                    <Choice
                      key={c.id}
                      selected={c.id === customerId}
                      title={`${c.firstName} ${c.lastName}`}
                      sub={c.email}
                      onClick={() => setCustomerId(c.id)}
                    />
                  ))}
                  {cq && customerList.length === 0 && (
                    <p className="text-muted text-base">Keine Kundin gefunden.</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setIsNewCustomer(true);
                    setCustomerId('');
                    const [first = '', ...rest] = customerQuery.trim().split(' ');
                    if (first && !first.includes('@'))
                      setNewCustomer({
                        ...newCustomer,
                        firstName: first,
                        lastName: rest.join(' '),
                      });
                  }}
                >
                  + Neue Kundin anlegen
                </Button>
              </>
            )}
            {isNewCustomer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Vorname">
                    <Input
                      value={newCustomer.firstName}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, firstName: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Nachname">
                    <Input
                      value={newCustomer.lastName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="E-Mail" hint="Für die Terminbestätigung">
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </Field>
                <Field label="Telefon (freiwillig)">
                  <Input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => setIsNewCustomer(false)}
                  className="min-h-12 text-base text-amber-800 underline underline-offset-4"
                >
                  ← Doch eine bestehende Kundin suchen
                </button>
              </div>
            )}
          </div>
        )}
        {error && <p className="bg-danger/10 text-danger rounded-2xl p-4 text-base">{error}</p>}
      </div>
    </Drawer>
  );
}

export function MoveBookingDrawer({
  booking,
  onClose,
  staff,
}: {
  booking: Booking | null;
  onClose: () => void;
  staff: Staff[];
}) {
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState<Slot>();
  const [keepStaff, setKeepStaff] = useState(true);
  useEffect(() => {
    if (booking) {
      setDate(berlinDate(booking.start));
      setSlot(undefined);
      setKeepStaff(true);
    }
  }, [booking]);
  const sameStaff = booking
    ? booking.items.every((i) => i.staffId === booking.items[0].staffId)
    : false;
  const slots = useSlots(
    date,
    booking ? booking.items.map((i) => i.serviceId) : [],
    booking && sameStaff && keepStaff ? booking.items[0].staffId : undefined,
    booking?.id,
  );
  const save = async () => {
    if (!booking || !slot) return;
    await getAdapter().rescheduleBooking(booking.id, slot);
    notify('Termin verschoben.');
    onClose();
  };
  return (
    <Drawer
      open={Boolean(booking)}
      onClose={onClose}
      title="Termin verschieben"
      footer={
        <Button size="lg" className="w-full" onClick={save} disabled={!slot}>
          {slot ? `Auf ${berlinTime(slot.start)} Uhr verschieben` : 'Erst neue Uhrzeit wählen'}
        </Button>
      }
    >
      {booking && (
        <div className="space-y-5">
          <p className="bg-cream-100 rounded-2xl p-4 text-base">
            Bisher: {formatDateLong(booking.start)}, {berlinTime(booking.start)} Uhr
          </p>
          <DayPicker
            label="Neuer Tag"
            value={date}
            onChange={(d) => {
              setDate(d);
              setSlot(undefined);
            }}
          />
          {sameStaff && (
            <label className="flex min-h-12 items-center gap-3 text-base">
              <input
                type="checkbox"
                className="h-6 w-6 accent-amber-600"
                checked={keepStaff}
                onChange={(e) => setKeepStaff(e.target.checked)}
              />
              Bei {staff.find((s) => s.id === booking.items[0].staffId)?.name} bleiben
            </label>
          )}
          <div>
            <p className="mb-2 text-base font-medium">Neue Uhrzeit wählen</p>
            <TimePicker slots={slots} value={slot} onChange={setSlot} staff={staff} />
          </div>
        </div>
      )}
    </Drawer>
  );
}

const sourceLabels: Record<Booking['source'], string> = {
  web: 'über die Website',
  app: 'über die App',
  team: 'vom Team eingetragen',
  treatwell: 'über Treatwell',
};

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
    if (
      !booking ||
      !confirm('Termin wirklich absagen? Die Kundin zahlt nichts, weil das Team absagt.')
    )
      return;
    await getAdapter().cancelBooking(booking.id, 'team');
    notify('Termin abgesagt.');
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
            <Button variant="ghost" size="lg" onClick={cancel}>
              Absagen
            </Button>
            <Button size="lg" onClick={() => booking && onMove(booking)}>
              Verschieben
            </Button>
          </div>
        )
      }
    >
      {booking && (
        <div className="space-y-5 text-base">
          <div>
            <p className="text-muted text-base">{formatDateLong(booking.start)}</p>
            <p className="mt-1 font-serif text-4xl">
              {berlinTime(booking.start)} – {berlinTime(booking.end)} Uhr
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {booking.status !== 'bestaetigt' && (
                <Badge tone={booking.status === 'storniert' ? 'danger' : 'line'}>
                  {booking.status === 'storniert' ? 'abgesagt' : statusLabels[booking.status]}
                </Badge>
              )}
              <Badge tone={booking.source === 'treatwell' ? 'honey' : 'line'}>
                {sourceLabels[booking.source] ?? booking.source}
              </Badge>
            </div>
          </div>
          {c && (
            <div className="bg-cream-100 rounded-2xl p-4">
              <p className="text-lg font-medium">
                {c.firstName} {c.lastName}
              </p>
              <p className="text-muted">{c.email}</p>
              {c.phone && (
                <a
                  href={`tel:${c.phone}`}
                  className="inline-flex min-h-12 items-center text-amber-800 underline underline-offset-4"
                >
                  {c.phone}
                </a>
              )}
              {c.laserConsultationDone && (
                <p className="text-success mt-1">Laser-Vorgespräch erledigt</p>
              )}
            </div>
          )}
          <ul className="divide-line-soft border-line-soft divide-y border-y">
            {booking.items.map((i) => (
              <li key={i.start + i.serviceId} className="flex justify-between gap-3 py-3">
                <span>
                  {services.find((s) => s.id === i.serviceId)?.name}
                  <span className="text-muted block">
                    {berlinTime(i.start)} Uhr · bei {staff.find((s) => s.id === i.staffId)?.name}
                  </span>
                </span>
                {formatEuro(i.priceCents)}
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-serif text-2xl">
            <span>Gesamt</span>
            <span>{formatEuro(booking.totalCents)}</span>
          </div>
          {booking.note && (
            <p className="border-line-soft text-muted rounded-2xl border p-4 italic">
              „{booking.note}“
            </p>
          )}
          <MoreOptions label="Zahlung & Details">
            <dl className="space-y-2">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Zahlung</dt>
                <dd className="text-right">
                  {booking.payment.mode === 'vorab' ? 'vorab online' : 'Karte hinterlegt'} ·{' '}
                  {paymentMethodLabels[booking.payment.method] ?? booking.payment.method} ·{' '}
                  {paymentStatusLabels[booking.payment.status] ?? booking.payment.status}
                </dd>
              </div>
              {booking.voucherCents > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Gutschein {booking.voucherCode}</dt>
                  <dd>−{formatEuro(booking.voucherCents)}</dd>
                </div>
              )}
              {booking.cancellation && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Gebühr für die Absage</dt>
                  <dd>{formatEuro(booking.cancellation.feeCents)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Raum</dt>
                <dd>{[...new Set(booking.items.map((i) => i.roomId))].join(', ')}</dd>
              </div>
            </dl>
          </MoreOptions>
        </div>
      )}
    </Drawer>
  );
}

export function BlockDrawer({
  open,
  onClose,
  date: initialDate,
  staff,
  staffId: initialStaff,
}: {
  open: boolean;
  onClose: () => void;
  date: string;
  staff: Staff[];
  staffId?: string;
}) {
  const [form, setForm] = useState({
    staffId: initialStaff ?? '',
    date: initialDate,
    from: '12:00',
    to: '13:00',
    reason: 'treatwell' as TimeOff['reason'],
    note: '',
  });
  useEffect(() => {
    if (open)
      setForm((f) => ({ ...f, date: initialDate, staffId: initialStaff ?? f.staffId, note: '' }));
  }, [open, initialDate, initialStaff]);
  const valid = Boolean(form.staffId) && form.from < form.to;
  const save = async () => {
    if (!valid) return;
    await getAdapter().addTimeOff({
      staffId: form.staffId,
      start: berlinToISO(form.date, form.from),
      end: berlinToISO(form.date, form.to),
      reason: form.reason,
      note: form.note || (form.reason === 'treatwell' ? 'Treatwell-Buchung' : undefined),
    });
    notify('Zeit geblockt.');
    onClose();
  };
  const reasons: TimeOff['reason'][] = ['treatwell', 'pause', 'urlaub', 'block'];
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Zeit blocken"
      footer={
        <Button size="lg" className="w-full" onClick={save} disabled={!valid}>
          {!form.staffId
            ? 'Erst Mitarbeiterin wählen'
            : form.from >= form.to
              ? '„Bis“ muss nach „Von“ liegen'
              : `${form.from}–${form.to} Uhr blocken`}
        </Button>
      }
    >
      <div className="space-y-6">
        <p className="bg-honey-200/40 rounded-2xl p-4 text-base">
          Geblockte Zeit kann online niemand buchen. So wird ein Treatwell-Termin nicht doppelt
          vergeben.
        </p>
        <div>
          <p className="mb-2 text-base font-medium">Wer?</p>
          <div className="grid grid-cols-2 gap-2">
            {staff
              .filter((s) => s.bookable)
              .map((s) => (
                <Choice
                  key={s.id}
                  selected={form.staffId === s.id}
                  title={s.name}
                  onClick={() => setForm({ ...form, staffId: s.id })}
                />
              ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-base font-medium">Warum?</p>
          <div className="grid grid-cols-2 gap-2">
            {reasons.map((r) => (
              <Choice
                key={r}
                selected={form.reason === r}
                title={timeOffLabels[r]}
                onClick={() => setForm({ ...form, reason: r })}
              />
            ))}
          </div>
        </div>
        <DayPicker value={form.date} onChange={(d) => setForm({ ...form, date: d })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Von">
            <Input
              type="time"
              step={900}
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
            />
          </Field>
          <Field label="Bis">
            <Input
              type="time"
              step={900}
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
            />
          </Field>
        </div>
        <MoreOptions label="Notiz hinzufügen">
          <Field label="Notiz (freiwillig)">
            <Textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="z. B. Name der Treatwell-Kundin"
            />
          </Field>
        </MoreOptions>
      </div>
    </Drawer>
  );
}

export function TimeOffDrawer({
  entry,
  onClose,
  staff,
}: {
  entry: TimeOff | null;
  onClose: () => void;
  staff: Staff[];
}) {
  const remove = async () => {
    if (!entry) return;
    await getAdapter().removeTimeOff(entry.id);
    notify('Zeit wieder freigegeben.');
    onClose();
  };
  return (
    <Drawer
      open={Boolean(entry)}
      onClose={onClose}
      title="Geblockte Zeit"
      footer={
        <Button variant="ghost" size="lg" className="w-full" onClick={remove}>
          Zeit wieder freigeben
        </Button>
      }
    >
      {entry && (
        <div className="space-y-2 text-base">
          <p className="font-serif text-3xl">{timeOffLabels[entry.reason]}</p>
          <p className="text-lg">{staff.find((s) => s.id === entry.staffId)?.name}</p>
          <p className="text-muted">
            {formatDateLong(entry.start)}, {berlinTime(entry.start)} –{' '}
            {formatDateLong(entry.end) === formatDateLong(entry.start)
              ? ''
              : `${formatDateLong(entry.end)}, `}
            {berlinTime(entry.end)} Uhr
          </p>
          {entry.note && <p className="text-muted italic">{entry.note}</p>}
        </div>
      )}
    </Drawer>
  );
}
