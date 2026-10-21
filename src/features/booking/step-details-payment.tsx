'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarCheck, CalendarPlus, Gift, Info, Mail, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ButtonLink, Button } from '@/components/ui/button';
import { Checkbox, Field, Input, Textarea } from '@/components/ui/form';
import { care, site } from '@/content';
import { getAdapter } from '@/data';
import { policyText } from '@/domain/cancellation';
import { voucherMessages } from '@/domain/vouchers';
import type { Booking, Customer, Service, Session, Settings, Staff } from '@/domain/types';
import { cn } from '@/lib/cn';
import { bookingIcs, downloadFile } from '@/lib/ics';
import { berlinTime, formatDateLong, formatEuro } from '@/lib/format';
import { payMethods } from '../payment/payment-sheet';
import { slotTotals, type BookingDraft } from './booking-state';
import { withBase } from '@/lib/config';

const detailsSchema = z.object({
  firstName: z.string().trim().min(1, 'Bitte gib Deinen Vornamen an.'),
  lastName: z.string().trim().min(1, 'Bitte gib Deinen Nachnamen an.'),
  email: z.string().trim().email('Bitte prüf Deine E-Mail-Adresse.'),
  phone: z.string().trim().min(6, 'Für kurzfristige Rückfragen brauchen wir Deine Nummer.'),
  note: z.string().max(500).optional(),
});
type Details = z.infer<typeof detailsSchema>;

export function StepDetails({
  draft,
  setDraft,
  services,
  session,
  customer,
  onNext,
}: {
  draft: BookingDraft;
  setDraft: (d: BookingDraft) => void;
  services: Service[];
  session: Session | null;
  customer: Customer | null;
  onNext: () => void;
}) {
  const { register, handleSubmit, reset, formState } = useForm<Details>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { ...draft.customer, note: draft.note },
  });
  useEffect(() => {
    if (customer && !draft.customer) reset({ firstName: customer.firstName, lastName: customer.lastName, email: customer.email, phone: customer.phone ?? '', note: draft.note });
  }, [customer, draft.customer, draft.note, reset]);

  const cats = [...new Set(draft.serviceIds.map((id) => services.find((s) => s.id === id)?.categoryId))];
  const prep = cats.flatMap((c) => (c && care[c] ? care[c].preparation : []));

  return (
    <form
      onSubmit={handleSubmit((v) => {
        setDraft({ ...draft, customer: { firstName: v.firstName, lastName: v.lastName, email: v.email, phone: v.phone, id: customer?.id }, note: v.note });
        onNext();
      })}
      className="space-y-6"
      noValidate
    >
      {!session && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            <span className="font-medium">Schon Kundin?</span> <span className="text-muted">Melde Dich an, dann ist alles ausgefüllt.</span>
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={() => getAdapter().loginAs('kundin')}>
            Demo-Login als Lena
          </Button>
        </div>
      )}
      {session?.role === 'kundin' && <p className="text-sm text-muted">Angemeldet als {session.name}. Du kannst die Angaben für diesen Termin ändern.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vorname" error={formState.errors.firstName?.message}>
          <Input autoComplete="given-name" {...register('firstName')} />
        </Field>
        <Field label="Nachname" error={formState.errors.lastName?.message}>
          <Input autoComplete="family-name" {...register('lastName')} />
        </Field>
        <Field label="E-Mail" error={formState.errors.email?.message}>
          <Input type="email" autoComplete="email" inputMode="email" {...register('email')} />
        </Field>
        <Field label="Telefon" error={formState.errors.phone?.message}>
          <Input type="tel" autoComplete="tel" inputMode="tel" {...register('phone')} />
        </Field>
      </div>
      <Field label="Nachricht an uns (optional)" hint="Allergien, Wünsche, Schwangerschaft – alles, was wir wissen sollten.">
        <Textarea {...register('note')} />
      </Field>
      {prep.length > 0 && (
        <div className="flex gap-3 rounded-2xl bg-honey-200/35 p-5 text-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" strokeWidth={1.5} />
          <div>
            <p className="font-medium">So bereitest Du Dich vor</p>
            <ul className="mt-2 space-y-1 text-muted">
              {prep.map((p) => (
                <li key={p}>– {p}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Weiter zur Zahlung
      </Button>
    </form>
  );
}

export function StepPayment({
  draft,
  setDraft,
  services,
  settings,
  onPay,
}: {
  draft: BookingDraft;
  setDraft: (d: BookingDraft) => void;
  services: Service[];
  settings: Settings;
  onPay: () => void;
}) {
  const [code, setCode] = useState(draft.voucherCode ?? '');
  const [voucherMsg, setVoucherMsg] = useState('');
  const [accepted, setAccepted] = useState(false);
  const totals = draft.slot ? slotTotals(draft.slot, services) : { subtotal: 0, discount: 0, total: 0, percent: 0 };
  const due = Math.max(0, totals.total - draft.voucherCents);

  const applyVoucher = async () => {
    const r = await getAdapter().checkVoucher(code, totals.total);
    if (r.ok) {
      setDraft({ ...draft, voucherCode: r.voucher.code, voucherCents: r.applicableCents });
      setVoucherMsg(`${formatEuro(r.applicableCents)} werden angerechnet. Restwert danach: ${formatEuro(r.voucher.remainingCents - r.applicableCents)}.`);
    } else {
      setDraft({ ...draft, voucherCode: undefined, voucherCents: 0 });
      setVoucherMsg(voucherMessages[r.reason]);
    }
  };

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="eyebrow mb-3">Wie möchtest Du zahlen?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { id: 'vorab' as const, title: 'Jetzt bezahlen', text: 'Alles erledigt, Du kommst einfach vorbei.' },
            { id: 'karte-hinterlegt' as const, title: 'Karte hinterlegen', text: 'Du zahlst vor Ort. Die Karte sichert nur die Storno-Regel ab.' },
          ].map((m) => (
            <label key={m.id} className={cn('flex min-h-20 cursor-pointer gap-3 rounded-2xl border p-4', draft.payMode === m.id ? 'border-honey-950 bg-card' : 'border-line')}>
              <input type="radio" name="mode" className="mt-1 accent-amber-600" checked={draft.payMode === m.id} onChange={() => setDraft({ ...draft, payMode: m.id, payMethod: m.id === 'karte-hinterlegt' ? 'karte' : draft.payMethod })} />
              <span>
                <span className="block font-medium">{m.title}</span>
                <span className="text-sm text-muted">{m.text}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {draft.payMode === 'vorab' && due > 0 && (
        <fieldset>
          <legend className="eyebrow mb-3">Zahlungsart</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {payMethods.map((m) => (
              <button key={m.id} type="button" onClick={() => setDraft({ ...draft, payMethod: m.id })} className={cn('min-h-16 rounded-xl border px-3 text-left text-sm', draft.payMethod === m.id ? 'border-honey-950 bg-card' : 'border-line')}>
                <span className="block font-medium">{m.label}</span>
                <span className="text-xs text-muted">{m.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <p className="eyebrow mb-3 flex items-center gap-2">
          <Gift className="h-3.5 w-3.5" strokeWidth={1.5} /> Gutschein
        </p>
        <div className="flex gap-2">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="z. B. HONIG50" className="uppercase" aria-label="Gutscheincode" />
          <Button type="button" variant="ghost" onClick={applyVoucher} disabled={!code.trim()}>
            Einlösen
          </Button>
        </div>
        {voucherMsg && <p className={cn('mt-2 text-sm', draft.voucherCents ? 'text-success' : 'text-danger')}>{voucherMsg}</p>}
      </div>

      <div className="rounded-2xl border border-line p-5">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Zwischensumme</dt>
            <dd>{formatEuro(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-success">
              <dt>Laser-Mehrzonen-Rabatt {totals.percent} %</dt>
              <dd>−{formatEuro(totals.discount)}</dd>
            </div>
          )}
          {draft.voucherCents > 0 && (
            <div className="flex justify-between text-success">
              <dt>Gutschein {draft.voucherCode}</dt>
              <dd>−{formatEuro(draft.voucherCents)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-line-soft pt-3 font-serif text-2xl">
            <dt>{draft.payMode === 'vorab' ? 'Jetzt zu zahlen' : 'Vor Ort zu zahlen'}</dt>
            <dd>{formatEuro(due)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl bg-cream-100 p-5 text-sm">
        <p className="font-medium">Storno-Regel</p>
        <p className="mt-1 text-muted">{policyText(settings.cancellation)}</p>
        <Checkbox checked={accepted} onChange={(e) => setAccepted(e.target.checked)} label={<>Ich habe die Storno-Regel und die <a href={withBase('/agb/')} target="_blank" rel="noreferrer" className="underline">AGB</a> gelesen und bin einverstanden.</>} />
      </div>

      <Button size="lg" className="w-full" disabled={!accepted} onClick={onPay}>
        {due === 0 ? 'Verbindlich buchen' : draft.payMode === 'vorab' ? `Zahlungspflichtig buchen · ${formatEuro(due)}` : 'Karte hinterlegen & buchen'}
      </Button>
    </div>
  );
}

export function StepDone({ booking, services, staff }: { booking: Booking; services: Service[]; staff: Staff[] }) {
  const names = booking.items.map((i) => services.find((s) => s.id === i.serviceId)?.name).join(', ');
  const ics = () =>
    downloadFile(
      'honigseele-termin.ics',
      bookingIcs({
        id: booking.id,
        title: `Honigseele: ${names}`,
        start: booking.start,
        end: booking.end,
        description: `${names}\nMit ${[...new Set(booking.items.map((i) => staff.find((s) => s.id === i.staffId)?.name))].join(' & ')}\nAbsage bis 24 Std. vorher kostenlos.`,
        location: `Honigseele, ${site.location.street}, ${site.location.zip} ${site.location.city}`,
      }),
    );
  return (
    <div className="text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-honey-950 text-honey-300">
        <CalendarCheck className="h-8 w-8" strokeWidth={1.5} />
      </span>
      <h2 className="mt-8 text-5xl">
        Wir freuen uns <em>auf Dich</em>.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-muted">Deine Bestätigung ist unterwegs. Hier noch einmal alles auf einen Blick.</p>
      <div className="mx-auto mt-10 max-w-md rounded-[2rem] border border-line bg-card p-6 text-left">
        <p className="eyebrow">{formatDateLong(booking.start)}</p>
        <p className="mt-2 font-serif text-4xl">
          {berlinTime(booking.start)} – {berlinTime(booking.end)}
        </p>
        <ul className="mt-5 space-y-2 border-t border-line-soft pt-5 text-sm">
          {booking.items.map((i) => (
            <li key={i.start + i.serviceId} className="flex justify-between gap-4">
              <span>
                {services.find((s) => s.id === i.serviceId)?.name}
                <span className="block text-xs text-muted">mit {staff.find((s) => s.id === i.staffId)?.name} · {berlinTime(i.start)}</span>
              </span>
              <span>{formatEuro(i.priceCents)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-between border-t border-line-soft pt-4 text-sm">
          <span className="text-muted">{booking.payment.mode === 'vorab' ? 'Bezahlt' : 'Karte hinterlegt, Zahlung vor Ort'}</span>
          <span className="font-medium">{formatEuro(booking.totalCents)}</span>
        </div>
        <p className="mt-4 text-xs text-muted">{site.location.street}, {site.location.zip} {site.location.city}</p>
      </div>
      <div className="mx-auto mt-8 grid max-w-md gap-3 sm:grid-cols-2">
        <Button variant="ghost" onClick={ics}>
          <CalendarPlus className="h-4 w-4" strokeWidth={1.5} /> In den Kalender
        </Button>
        <ButtonLink href={`/demo/mails/?buchung=${booking.id}`} variant="ghost">
          <Mail className="h-4 w-4" strokeWidth={1.5} /> Mail ansehen
        </ButtonLink>
      </div>
      <div className="mx-auto mt-8 flex max-w-md gap-3 rounded-2xl bg-cream-100 p-4 text-left text-sm">
        <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" strokeWidth={1.5} />
        <p>
          <span className="font-medium">Honigseele als App:</span> <span className="text-muted">Tippe im Browser auf „Teilen“ → „Zum Home-Bildschirm“. So hast Du Deine Termine immer dabei. Bald auch im App Store.</span>
        </p>
      </div>
      <ButtonLink href="/konto/" className="mt-8">
        Zu meinen Terminen
      </ButtonLink>
    </div>
  );
}
