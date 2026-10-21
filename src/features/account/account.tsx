'use client';
import { CalendarClock, Gift, LogOut, Package, Sparkles, Ticket, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge, Placeholder } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Checkbox, Field, Input } from '@/components/ui/form';
import { Tabs } from '@/components/ui/tabs';
import { getAdapter } from '@/data';
import { cancellationQuote } from '@/domain/cancellation';
import type { Booking, Customer, Settings } from '@/domain/types';
import { cn } from '@/lib/cn';
import { berlinTime, formatDateLong, formatDateShort, formatEuro } from '@/lib/format';
import { useData, useSession } from '@/lib/use-data';
import { LoginCard } from './login-card';

type Tab = 'termine' | 'kurse' | 'gutscheine' | 'bestellungen' | 'profil';

export function Account() {
  const { session, loading } = useSession();
  const [tab, setTab] = useState<Tab>('termine');
  if (loading) return <div className="min-h-[60svh]" />;
  if (!session || session.role !== 'kundin' || !session.customerId)
    return (
      <div className="honey-light px-5 py-16 md:py-24">
        <LoginCard />
      </div>
    );
  const id = session.customerId;
  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-10 md:px-10 md:pt-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Mein Konto</p>
          <h1 className="mt-3 text-5xl md:text-6xl">
            Hallo <em>{session.name}</em>.
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => getAdapter().logout()}>
          <LogOut className="h-4 w-4" strokeWidth={1.5} /> Abmelden
        </Button>
      </div>
      <Tabs
        className="mt-8 border-b border-line-soft pb-3"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'termine', label: 'Termine' },
          { value: 'kurse', label: 'Kurse' },
          { value: 'gutscheine', label: 'Gutscheine & Karten' },
          { value: 'bestellungen', label: 'Bestellungen' },
          { value: 'profil', label: 'Profil' },
        ]}
      />
      <div className="mt-8">
        {tab === 'termine' && <Appointments customerId={id} />}
        {tab === 'kurse' && <Tickets customerId={id} />}
        {tab === 'gutscheine' && <Vouchers customerId={id} />}
        {tab === 'bestellungen' && <Orders customerId={id} />}
        {tab === 'profil' && <Profile customerId={id} />}
      </div>
      <div className="mt-16 grid gap-4 md:grid-cols-2">
        <div className="honey-glow on-dark rounded-[2rem] p-7 text-cream-50">
          <Sparkles className="h-6 w-6 text-honey-300" strokeWidth={1.5} />
          <p className="mt-4 font-serif text-3xl">
            Community <em>– bald</em>
          </p>
          <p className="mt-2 text-sm text-cream-100/80">Affirmationen, Zykluskalender und unser Frauen-Netzwerk. Als Mitgliedschaft direkt in der App.</p>
        </div>
        <div className="rounded-[2rem] border border-line p-7">
          <User className="h-6 w-6 text-amber-800" strokeWidth={1.5} />
          <p className="mt-4 font-serif text-3xl">Honigseele als App</p>
          <p className="mt-2 text-sm text-muted">Im Browser „Zum Home-Bildschirm“ wählen – bald auch im App Store, mit Erinnerungen per Push.</p>
        </div>
      </div>
    </div>
  );
}

function Empty({ icon: Icon, text, href, cta }: { icon: typeof Gift; text: string; href: string; cta: string }) {
  return (
    <div className="rounded-[2rem] bg-cream-100 p-10 text-center">
      <Icon className="mx-auto h-7 w-7 text-amber-800" strokeWidth={1.5} />
      <p className="mt-3 font-serif text-2xl">{text}</p>
      <ButtonLink href={href} variant="ghost" className="mt-5">
        {cta}
      </ButtonLink>
    </div>
  );
}

function Appointments({ customerId }: { customerId: string }) {
  const { data: bookings = [] } = useData((db) => db.listBookings({ customerId }), [customerId]);
  const { data: services = [] } = useData((db) => db.listServices(), []);
  const { data: staff = [] } = useData((db) => db.listStaff(), []);
  const { data: settings } = useData((db) => db.getSettings(), []);
  const [cancel, setCancel] = useState<Booking | null>(null);
  const now = new Date().toISOString();
  const upcoming = bookings.filter((b) => b.end >= now && b.status === 'bestaetigt');
  const past = bookings.filter((b) => b.end < now || b.status !== 'bestaetigt').reverse();
  const name = (b: Booking) => b.items.map((i) => services.find((s) => s.id === i.serviceId)?.name).join(' + ');
  const who = (b: Booking) => [...new Set(b.items.map((i) => staff.find((s) => s.id === i.staffId)?.name))].join(' & ');

  if (bookings.length === 0) return <Empty icon={CalendarClock} text="Noch keine Termine." href="/buchen/" cta="Jetzt buchen" />;
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl">Kommende Termine</h2>
        {upcoming.length === 0 && <p className="mt-4 text-muted">Gerade nichts geplant. <Link className="underline" href="/buchen/">Lust auf eine Auszeit?</Link></p>}
        <ul className="mt-5 space-y-4">
          {upcoming.map((b) => (
            <li key={b.id} className="grid gap-4 rounded-[1.75rem] border border-line bg-card p-5 md:grid-cols-[auto_1fr_auto] md:items-center md:p-6">
              <div className="flex items-baseline gap-3 md:block md:w-28">
                <p className="eyebrow">{formatDateShort(b.start)}</p>
                <p className="font-serif text-3xl">{berlinTime(b.start)}</p>
              </div>
              <div>
                <p className="font-serif text-2xl leading-tight">{name(b)}</p>
                <p className="text-sm text-muted">
                  mit {who(b)} · {formatEuro(b.totalCents)} · {b.payment.mode === 'vorab' ? 'bezahlt' : 'Zahlung vor Ort'}
                </p>
              </div>
              <div className="flex gap-2">
                <ButtonLink href={`/buchen/?umbuchen=${b.id}`} variant="ghost" size="sm">
                  Umbuchen
                </ButtonLink>
                <Button variant="ghost" size="sm" onClick={() => setCancel(b)}>
                  Stornieren
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      {past.length > 0 && (
        <section>
          <h2 className="text-3xl">Vergangen & storniert</h2>
          <ul className="mt-5 divide-y divide-line-soft border-y border-line-soft">
            {past.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
                <span>
                  <span className="block font-medium">{name(b)}</span>
                  <span className="text-muted">{formatDateLong(b.start)} · {who(b)}</span>
                </span>
                <span className="flex items-center gap-3">
                  {b.status === 'storniert' ? (
                    <Badge tone="danger">storniert{b.cancellation?.feeCents ? ` · Gebühr ${formatEuro(b.cancellation.feeCents)}` : ''}</Badge>
                  ) : (
                    <ButtonLink href={`/buchen/?leistung=${b.items[0].serviceId}`} variant="link" size="sm">
                      Nochmal buchen
                    </ButtonLink>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {settings && <CancelDrawer booking={cancel} settings={settings} label={cancel ? name(cancel) : ''} onClose={() => setCancel(null)} />}
    </div>
  );
}

function CancelDrawer({ booking, settings, label, onClose }: { booking: Booking | null; settings: Settings; label: string; onClose: () => void }) {
  const [done, setDone] = useState<Booking | null>(null);
  const q = booking ? cancellationQuote(booking, settings.cancellation) : null;
  const close = () => {
    setDone(null);
    onClose();
  };
  return (
    <Drawer open={Boolean(booking)} onClose={close} title={done ? 'Storniert' : 'Termin stornieren'} side="bottom">
      {booking && q && (
        <div className="mx-auto max-w-md pb-6">
          <p className="font-serif text-2xl">{label}</p>
          <p className="text-muted">{formatDateLong(booking.start)}, {berlinTime(booking.start)} Uhr</p>
          {done ? (
            <p className="mt-6 rounded-2xl bg-cream-100 p-5">
              Dein Termin ist storniert. {done.cancellation?.refundCents ? `${formatEuro(done.cancellation.refundCents)} erstatten wir auf Dein Zahlungsmittel.` : ''}{' '}
              {done.cancellation?.feeCents ? `Die Gebühr beträgt ${formatEuro(done.cancellation.feeCents)}.` : ''}
            </p>
          ) : (
            <>
              <div className={cn('mt-6 rounded-2xl p-5', q.free ? 'bg-success/10' : 'bg-danger/10')}>
                {q.free ? (
                  <p>
                    <strong className="font-medium">Kostenlos.</strong> Dein Termin ist noch mehr als {settings.cancellation.freeUntilHours} Stunden entfernt.
                    {booking.payment.paidCents > 0 && ` Du bekommst ${formatEuro(q.refundCents)} zurück.`}
                  </p>
                ) : (
                  <p>
                    Dein Termin ist in weniger als {settings.cancellation.freeUntilHours} Stunden. Laut Storno-Regel berechnen wir <strong className="font-medium">{settings.cancellation.feePercent} % = {formatEuro(q.feeCents)}</strong>.
                    {q.refundCents > 0 && ` Erstattung: ${formatEuro(q.refundCents)}.`}
                    {q.chargeCents > 0 && ` Wir belasten Deine hinterlegte Karte mit ${formatEuro(q.chargeCents)}.`}
                  </p>
                )}
              </div>
              <p className="mt-4 text-sm text-muted">Lieber verschieben? <Link className="underline" href={`/buchen/?umbuchen=${booking.id}`}>Termin umbuchen</Link></p>
              <Button variant="primary" size="lg" className="mt-6 w-full" onClick={async () => setDone(await getAdapter().cancelBooking(booking.id, 'kundin'))}>
                {q.free ? 'Kostenlos stornieren' : `Stornieren (${formatEuro(q.feeCents)} Gebühr)`}
              </Button>
            </>
          )}
        </div>
      )}
    </Drawer>
  );
}

function Tickets({ customerId }: { customerId: string }) {
  const { data: tickets = [] } = useData((db) => db.listTickets(customerId), [customerId]);
  const { data: sessions = [] } = useData((db) => db.listSessions(), []);
  const { data: courses = [] } = useData((db) => db.listCourses(), []);
  const valid = tickets.filter((t) => t.status === 'gueltig');
  if (valid.length === 0) return <Empty icon={Ticket} text="Noch keine Kurs-Tickets." href="/kurse/" cta="Zum Kursplan" />;
  return (
    <ul className="space-y-3">
      {valid.map((t) => {
        const s = sessions.find((x) => x.id === t.sessionId);
        const c = courses.find((x) => x.id === s?.courseId);
        return (
          <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-line p-5">
            <span>
              <span className="block font-serif text-2xl">{c?.name}</span>
              <span className="text-sm text-muted">{s && `${formatDateLong(s.start)}, ${berlinTime(s.start)} Uhr`} · {t.paidWith === 'karte' ? 'mit Karte' : 'Einzelticket'}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={() => getAdapter().cancelTicket(t.id)}>
              Absagen
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function Vouchers({ customerId }: { customerId: string }) {
  const { data: vouchers = [] } = useData((db) => db.listVouchers(customerId), [customerId]);
  const { data: cards = [] } = useData((db) => db.listPunchCards(customerId), [customerId]);
  if (vouchers.length === 0 && cards.length === 0) return <Empty icon={Gift} text="Noch keine Gutscheine oder Karten." href="/shop/gutscheine/" cta="Gutschein verschenken" />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {vouchers.map((v) => (
        <div key={v.code} className="honey-glow on-dark relative overflow-hidden rounded-[1.75rem] p-6 text-cream-50">
          <p className="eyebrow">Gutschein {v.kind !== 'allgemein' && `· ${v.kind}`}</p>
          <p className="mt-3 font-serif text-5xl text-honey-300">{formatEuro(v.remainingCents)}</p>
          <p className="text-sm text-cream-100/75">Restwert von {formatEuro(v.initialCents)}</p>
          <p className="mt-6 font-mono tracking-widest">{v.code}</p>
          <p className="text-xs text-cream-100/60">gültig bis {new Date(v.validUntil).toLocaleDateString('de-DE')}</p>
          {v.message && <p className="mt-3 font-serif italic text-cream-100/85">„{v.message}“</p>}
        </div>
      ))}
      {cards.map((c) => (
        <div key={c.id} className="rounded-[1.75rem] border border-line bg-card p-6">
          <p className="eyebrow">Yoga {c.size}er-Karte</p>
          <p className="mt-3 font-serif text-5xl">
            {c.remaining} <span className="text-2xl text-muted">von {c.size}</span>
          </p>
          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: c.size }, (_, i) => (
              <span key={i} className={cn('h-2 flex-1 rounded-full', i < c.remaining ? 'bg-honey-400' : 'bg-line-soft')} />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">gültig bis {new Date(c.validUntil).toLocaleDateString('de-DE')}</p>
        </div>
      ))}
    </div>
  );
}

function Orders({ customerId }: { customerId: string }) {
  const { data: orders = [] } = useData((db) => db.listOrders(customerId), [customerId]);
  if (orders.length === 0) return <Empty icon={Package} text="Noch keine Bestellungen." href="/shop/" cta="Zum Shop" />;
  const labels = { bezahlt: 'bezahlt', versendet: 'versendet', abgeschlossen: 'zugestellt', storniert: 'storniert' };
  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id} className="rounded-[1.5rem] border border-line p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">Bestellung {o.number}</p>
            <Badge tone={o.status === 'versendet' ? 'honey' : 'line'}>{labels[o.status]}</Badge>
          </div>
          <p className="text-sm text-muted">{formatDateLong(o.createdAt)}</p>
          <ul className="mt-3 space-y-1 text-sm">
            {o.items.map((i, k) => (
              <li key={k} className="flex justify-between">
                <span>
                  {i.quantity} × {i.name} {i.meta?.code && <span className="font-mono text-xs text-amber-800">({i.meta.code})</span>}
                </span>
                <span>{formatEuro(i.unitCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-line-soft pt-3 text-sm font-medium">
            <span>Gesamt</span>
            <span>{formatEuro(o.totalCents)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

function Profile({ customerId }: { customerId: string }) {
  const { data: customer } = useData((db) => db.getCustomer(customerId), [customerId]);
  if (!customer) return null;
  return <ProfileForm key={customer.id} customer={customer} />;
}

function ProfileForm({ customer }: { customer: Customer }) {
  const [c, setC] = useState(customer);
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await getAdapter().saveCustomer(c);
        setSaved(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vorname"><Input value={c.firstName} onChange={(e) => setC({ ...c, firstName: e.target.value })} /></Field>
        <Field label="Nachname"><Input value={c.lastName} onChange={(e) => setC({ ...c, lastName: e.target.value })} /></Field>
        <Field label="E-Mail"><Input type="email" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} /></Field>
        <Field label="Telefon"><Input type="tel" value={c.phone ?? ''} onChange={(e) => setC({ ...c, phone: e.target.value })} /></Field>
      </div>
      <Checkbox checked={Boolean(c.newsletter)} onChange={(e) => setC({ ...c, newsletter: e.target.checked })} label="Ich möchte Post aus der Honigseele (Newsletter)." />
      <Checkbox checked={Boolean(c.student)} onChange={(e) => setC({ ...c, student: e.target.checked })} label="Ich bin Schüler*in oder studiere (Ermäßigung beim Waxing)." />
      <p className="text-sm text-muted">
        Laser-Vorgespräch: {c.laserConsultationDone ? 'erledigt – Du kannst Laser-Behandlungen direkt buchen.' : 'noch offen.'} <Placeholder label="Demo" />
      </p>
      <Button type="submit">{saved ? 'Gespeichert' : 'Speichern'}</Button>
    </form>
  );
}
