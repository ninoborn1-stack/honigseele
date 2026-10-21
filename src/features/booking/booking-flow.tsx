'use client';
// Buchungs-Flow: Leistung → Anbieterin → Termin → Daten → Zahlung → Bestätigung.
// Mobil als Vollbild-Schritte mit fester Fußleiste, Desktop mit Zusammenfassung rechts.
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { site } from '@/content';
import { getAdapter } from '@/data';
import type { Booking } from '@/domain/types';
import { cn } from '@/lib/cn';
import { berlinTime, formatDateShort, formatDuration, formatEuro } from '@/lib/format';
import { useData, useSession } from '@/lib/use-data';
import { PaymentSheet } from '../payment/payment-sheet';
import { draftQuote, emptyDraft, slotTotals, STEPS, type BookingDraft, type StepIndex } from './booking-state';
import { StepDetails, StepDone, StepPayment } from './step-details-payment';
import { StepServices } from './step-services';
import { StepStaff, StepTime } from './step-staff-time';

export function BookingFlow() {
  const params = useSearchParams();
  const router = useRouter();
  const presetService = params.get('leistung');
  const presetCategory = params.get('kategorie') ?? undefined;
  const rescheduleId = params.get('umbuchen') ?? undefined;

  const { data: services = [] } = useData((db) => db.listServices(), []);
  const { data: categories = [] } = useData((db) => db.listCategories(), []);
  const { data: staff = [] } = useData((db) => db.listStaff(), []);
  const { data: staffServices = [] } = useData((db) => db.listStaffServices(), []);
  const { data: settings = site.settings } = useData((db) => db.getSettings(), [], site.settings);
  const { session } = useSession();
  const { data: customer = null } = useData((db) => (session?.customerId ? db.getCustomer(session.customerId) : Promise.resolve(null)), [session?.customerId], null);

  const [draft, setDraft] = useState<BookingDraft>(() => ({ ...emptyDraft, serviceIds: presetService ? [presetService] : [] }));
  const [step, setStep] = useState<StepIndex>(0);
  const [paying, setPaying] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [original, setOriginal] = useState<Booking | null>(null);

  // Umbuchen: Leistungen und Anbieterin übernehmen, direkt zur Terminwahl
  useEffect(() => {
    if (!rescheduleId) return;
    getAdapter()
      .getBooking(rescheduleId)
      .then((b) => {
        if (!b) return;
        setOriginal(b);
        const sameStaff = b.items.every((i) => i.staffId === b.items[0].staffId);
        setDraft({ ...emptyDraft, serviceIds: b.items.map((i) => i.serviceId), staffId: sameStaff ? b.items[0].staffId : undefined });
        setStep(2);
      });
  }, [rescheduleId]);

  // Paket oder Coaching direkt verlinkt → Leistung ist gewählt
  useEffect(() => {
    if (presetService && step === 0 && draft.serviceIds.length === 1 && services.length) {
      const s = services.find((x) => x.id === presetService);
      if (s && !s.requiresConsultation) setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services.length]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const q = useMemo(() => draftQuote(draft, services, staffServices), [draft, services, staffServices]);
  const selected = draft.serviceIds.map((id) => services.find((s) => s.id === id)).filter(Boolean);
  const needsConsultation = selected.some((s) => s?.requiresConsultation) && !customer?.laserConsultationDone;
  const totals = draft.slot ? slotTotals(draft.slot, services) : null;

  const canNext = [draft.serviceIds.length > 0 && !needsConsultation, true, Boolean(draft.slot), false, false, false][step];
  const next = async () => {
    if (step === 2 && original && draft.slot) {
      const b = await getAdapter().rescheduleBooking(original.id, draft.slot);
      setBooking(b);
      setStep(5);
      return;
    }
    setStep((s) => Math.min(5, s + 1) as StepIndex);
  };
  const back = () => {
    if (step === 0 || step === 5 || (original && step === 2)) router.back();
    else setStep((s) => (s - 1) as StepIndex);
  };

  const finalize = async () => {
    if (!draft.slot || !draft.customer) return;
    setError('');
    const b = await getAdapter().createBooking({
      customer: draft.customer,
      items: draft.slot.items,
      discountCents: totals?.discount ?? 0,
      voucherCode: draft.voucherCode,
      payment: { mode: draft.payMode, method: draft.payMethod },
      note: draft.note,
      source: window.matchMedia('(display-mode: standalone)').matches ? 'app' : 'web',
    });
    setBooking(b);
    setPaying(false);
    setStep(5);
  };

  const due = Math.max(0, (totals?.total ?? 0) - draft.voucherCents);
  const titles = ['Was darf es sein?', 'Bei wem?', 'Wann passt es Dir?', 'Deine Daten', 'Zahlung', 'Gebucht!'];

  return (
    <div className="min-h-svh bg-cream-50">
      {/* Kopf mit Fortschritt */}
      <div className="pt-safe sticky top-0 z-30 border-b border-line-soft bg-cream-50/95 backdrop-blur-md">
        <div className="wrap flex h-16 items-center justify-between md:h-20">
          <button onClick={back} className="grid h-11 w-11 place-items-center rounded-full hover:bg-cream-100" aria-label="Zurück">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <Link href="/" className="hidden md:block" aria-label="Startseite">
            <Logo />
          </Link>
          <p className="text-sm text-muted md:hidden">
            {step < 5 ? `Schritt ${step + 1} von 5` : 'Fertig'} {original && '· Umbuchen'}
          </p>
          <Link href="/" className="grid h-11 w-11 place-items-center rounded-full hover:bg-cream-100" aria-label="Buchung abbrechen">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        </div>
        <ol className="wrap hidden gap-8 pb-4 md:flex" aria-label="Fortschritt">
          {STEPS.slice(0, 5).map((label, i) => (
            <li key={label} className={cn('flex items-center gap-2 text-sm', i === step ? 'text-honey-950' : i < step ? 'text-amber-800' : 'text-muted/60')}>
              <span className={cn('grid h-6 w-6 place-items-center rounded-full border font-serif text-sm', i === step ? 'border-honey-950 bg-honey-950 text-cream-50' : i < step ? 'border-amber-800' : 'border-line')}>{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>
        <div className="h-0.5 bg-line-soft md:hidden">
          <div className="h-full bg-amber-600 transition-all duration-500" style={{ width: `${((step + 1) / 6) * 100}%` }} />
        </div>
      </div>

      <div className="wrap grid gap-12 pb-40 pt-10 md:grid-cols-[1.6fr_1fr] md:pb-24 md:pt-16 xl:gap-20">
        <div key={step} className="min-w-0 animate-rise">
          {step < 5 && (
            <>
              <p className="eyebrow">{original ? 'Termin umbuchen' : STEPS[step]}</p>
              <h1 className="mb-10 mt-4 text-[clamp(2.6rem,5vw,5.2rem)] leading-[0.98]">{titles[step]}</h1>
            </>
          )}
          {step === 0 && <StepServices draft={draft} setDraft={setDraft} services={services} categories={categories} consultationDone={Boolean(customer?.laserConsultationDone)} initialCategory={presetCategory} />}
          {step === 1 && <StepStaff draft={draft} setDraft={setDraft} services={services} staff={staff} staffServices={staffServices} onNext={() => setStep(2)} />}
          {step === 2 && <StepTime draft={draft} setDraft={setDraft} staff={staff} ignoreBookingId={original?.id} />}
          {step === 3 && <StepDetails draft={draft} setDraft={setDraft} services={services} session={session} customer={customer} onNext={() => setStep(4)} />}
          {step === 4 && <StepPayment draft={draft} setDraft={setDraft} services={services} settings={settings} onPay={() => (due === 0 ? void finalize() : setPaying(true))} />}
          {step === 5 && booking && <StepDone booking={booking} services={services} staff={staff} />}
          {error && <p className="mt-4 text-danger">{error}</p>}
        </div>

        {/* Zusammenfassung */}
        {step < 5 && (
          <aside className="hidden md:block">
            <div className="sticky top-36 rounded-[2rem] border border-line bg-card p-6">
              <p className="eyebrow">Deine Auswahl</p>
              {selected.length === 0 ? (
                <p className="mt-4 text-sm text-muted">Noch nichts gewählt. Du kannst mehrere Leistungen kombinieren, z. B. Achseln und Beine.</p>
              ) : (
                <ul className="mt-4 space-y-2 text-sm">
                  {q.lines.map((l) => (
                    <li key={l.serviceId} className="flex justify-between gap-4">
                      <span>{l.name}</span>
                      <span className="whitespace-nowrap">{formatEuro(l.priceCents)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {draft.staffId && <p className="mt-4 text-sm text-muted">bei {staff.find((s) => s.id === draft.staffId)?.name}</p>}
              {draft.slot && (
                <p className="mt-4 font-serif text-2xl">
                  {formatDateShort(draft.slot.start)}, {berlinTime(draft.slot.start)}
                </p>
              )}
              {selected.length > 0 && (
                <div className="mt-5 border-t border-line-soft pt-4">
                  {(totals?.discount ?? q.discountCents) > 0 && (
                    <p className="flex justify-between text-sm text-success">
                      <span>{q.discountLabel}</span>
                      <span>−{formatEuro(totals?.discount ?? q.discountCents)}</span>
                    </p>
                  )}
                  <p className="mt-1 flex items-end justify-between">
                    <span className="text-sm text-muted">{formatDuration(q.durationMin)}</span>
                    <span className="font-serif text-3xl">{formatEuro(totals?.total ?? q.totalCents)}</span>
                  </p>
                </div>
              )}
              {step !== 3 && step !== 4 && step !== 1 && (
                <Button className="mt-6 w-full" size="lg" disabled={!canNext} onClick={next}>
                  {original && step === 2 ? 'Umbuchen bestätigen' : 'Weiter'}
                </Button>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Fußleiste */}
      {(step === 0 || step === 2) && (
        <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line-soft bg-cream-50/95 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="text-sm">
              <p className="font-serif text-2xl leading-none">{formatEuro(totals?.total ?? q.totalCents)}</p>
              <p className="text-muted">
                {selected.length} {selected.length === 1 ? 'Leistung' : 'Leistungen'} · {formatDuration(q.durationMin)}
              </p>
            </div>
            <Button size="lg" disabled={!canNext} onClick={next}>
              {original && step === 2 ? 'Umbuchen' : 'Weiter'}
            </Button>
          </div>
        </div>
      )}

      <PaymentSheet
        open={paying}
        onClose={() => setPaying(false)}
        amountCents={due}
        method={draft.payMethod}
        mode={draft.payMode}
        onPaid={async () => {
          try {
            await finalize();
          } catch (e) {
            setPaying(false);
            setError(e instanceof Error ? e.message : 'Das hat leider nicht geklappt.');
            setStep(2);
            throw e;
          }
        }}
      />
    </div>
  );
}
