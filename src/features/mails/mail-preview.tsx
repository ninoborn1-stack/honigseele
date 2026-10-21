'use client';
// Vorschau der automatischen E-Mails (später über Resend/Brevo verschickt).
import { useSearchParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { site } from '@/content';
import { policyText } from '@/domain/cancellation';
import type { Booking, Order, Service, Staff } from '@/domain/types';
import { berlinTime, formatDateLong, formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';

type Kind = 'bestaetigung' | 'erinnerung' | 'bewertung' | 'bestellung';

function Mail({ subject, preheader, children }: { subject: string; preheader: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[620px] overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="border-b border-line-soft bg-cream-100 px-5 py-3 text-xs text-muted">
        <p><span className="font-medium text-honey-950">Von:</span> Honigseele &lt;{site.settings.contact.email}&gt;</p>
        <p><span className="font-medium text-honey-950">Betreff:</span> {subject}</p>
        <p className="truncate">{preheader}</p>
      </div>
      <div className="honey-glow px-8 py-10 text-center">
        <p className="font-serif text-4xl text-cream-50"><em className="text-honey-300">Honig</em>seele</p>
      </div>
      <div className="space-y-4 px-8 py-8 text-[15px] leading-relaxed text-honey-950">{children}</div>
      <div className="border-t border-line-soft bg-cream-50 px-8 py-6 text-center text-xs text-muted">
        {site.location.street} · {site.location.zip} {site.location.city} · {site.settings.contact.phone}
        <br />Du bekommst diese Mail, weil Du bei uns gebucht hast.
      </div>
    </div>
  );
}

function Details({ booking, services, staff }: { booking: Booking; services: Service[]; staff: Staff[] }) {
  return (
    <div className="rounded-xl bg-cream-50 p-5">
      <p className="font-serif text-2xl">{formatDateLong(booking.start)}</p>
      <p className="font-serif text-xl">{berlinTime(booking.start)} – {berlinTime(booking.end)} Uhr</p>
      <ul className="mt-3 text-sm">
        {booking.items.map((i) => (
          <li key={i.start + i.serviceId}>{services.find((s) => s.id === i.serviceId)?.name} · mit {staff.find((s) => s.id === i.staffId)?.name}</li>
        ))}
      </ul>
      <p className="mt-2 text-sm">{formatEuro(booking.totalCents)} · {booking.payment.mode === 'vorab' ? 'bezahlt' : 'Zahlung vor Ort'}</p>
    </div>
  );
}

const Btn = ({ children }: { children: ReactNode }) => (
  <p className="pt-2 text-center"><span className="inline-block rounded-full bg-honey-950 px-6 py-3 text-sm text-cream-50">{children}</span></p>
);

export function MailPreview() {
  const params = useSearchParams();
  const bookingId = params.get('buchung');
  const orderId = params.get('bestellung');
  const [kind, setKind] = useState<Kind>(orderId ? 'bestellung' : 'bestaetigung');
  const { data: bookings = [] } = useData((db) => db.listBookings({ customerId: 'kundin-lena' }), []);
  const { data: booking } = useData((db) => (bookingId ? db.getBooking(bookingId) : Promise.resolve(null)), [bookingId]);
  const { data: orders = [] } = useData((db) => db.listOrders(), []);
  const { data: services = [] } = useData((db) => db.listServices(), []);
  const { data: staff = [] } = useData((db) => db.listStaff(), []);
  const { data: customers = [] } = useData((db) => db.listCustomers(), []);
  const { data: settings = site.settings } = useData((db) => db.getSettings(), [], site.settings);

  const b = booking ?? bookings.find((x) => x.status === 'bestaetigt' && x.start > new Date().toISOString()) ?? bookings[0];
  const order: Order | undefined = orders.find((o) => o.id === orderId) ?? orders[0];
  const firstName = customers.find((c) => c.id === (kind === 'bestellung' ? order?.customerId : b?.customerId))?.firstName ?? 'Du';

  return (
    <div className="wrap py-14 md:py-20">
      <p className="eyebrow">Demo · E-Mails</p>
      <h1 className="mt-4 text-[clamp(2.6rem,5.5vw,5.5rem)] leading-[0.98]">Was Deine Kundinnen bekommen</h1>
      <p className="mt-3 max-w-xl text-muted">Automatisch nach Buchung, einen Tag vorher und am Tag danach. Später auch als Push in der App.</p>
      <Tabs
        className="mt-8"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'bestaetigung', label: 'Bestätigung' },
          { value: 'erinnerung', label: 'Erinnerung' },
          { value: 'bewertung', label: 'Bewertungsbitte' },
          { value: 'bestellung', label: 'Bestellung' },
        ]}
      />
      <div className="mt-8">
        {kind === 'bestaetigung' && b && (
          <Mail subject="Dein Termin in der Honigseele ist bestätigt" preheader="Wir freuen uns auf Dich – hier alle Details.">
            <p>Hallo {firstName},</p>
            <p>wie schön, dass Du Dir Zeit für Dich nimmst. Dein Termin ist fest eingetragen:</p>
            <Details booking={b} services={services} staff={staff} />
            <p className="text-sm text-muted">{policyText(settings.cancellation)}</p>
            <Btn>Termin verwalten</Btn>
            <p>Bis bald,<br />Deine Honigseelen</p>
          </Mail>
        )}
        {kind === 'erinnerung' && b && (
          <Mail subject="Morgen ist es so weit" preheader="Eine kleine Erinnerung an Deinen Termin.">
            <p>Hallo {firstName},</p>
            <p>morgen sehen wir uns – wir freuen uns schon.</p>
            <Details booking={b} services={services} staff={staff} />
            <p className="text-sm">Kleiner Tipp zur Vorbereitung: Komm ein paar Minuten früher, trink etwas Wasser und lass den Alltag draußen.</p>
            <Btn>Route anzeigen</Btn>
          </Mail>
        )}
        {kind === 'bewertung' && b && (
          <Mail subject="Wie war es bei uns?" preheader="Zwei Minuten für Deine Bewertung würden uns sehr freuen.">
            <p>Hallo {firstName},</p>
            <p>wir hoffen, Du hattest eine schöne Zeit bei uns. Magst Du uns erzählen, wie es Dir gefallen hat? Deine Bewertung hilft anderen, uns zu finden.</p>
            <p className="text-center font-serif text-4xl tracking-widest text-amber-600">★★★★★</p>
            <Btn>Jetzt bewerten</Btn>
            <p className="text-sm text-muted">Als Dankeschön: 10 % auf Dein nächstes Produkt aus unserer Pflegeserie.</p>
          </Mail>
        )}
        {kind === 'bestellung' && order && (
          <Mail subject={`Deine Bestellung ${order.number}`} preheader="Danke für Deine Bestellung!">
            <p>Hallo {firstName},</p>
            <p>danke für Deine Bestellung. Wir packen sie mit Liebe ein.</p>
            <div className="rounded-xl bg-cream-50 p-5 text-sm">
              {order.items.map((i, k) => (
                <p key={k} className="flex justify-between">
                  <span>{i.quantity} × {i.name}{i.meta?.code ? ` – Code ${i.meta.code}` : ''}</span>
                  <span>{formatEuro(i.unitCents * i.quantity)}</span>
                </p>
              ))}
              <p className="mt-2 flex justify-between border-t border-line-soft pt-2 font-medium"><span>Gesamt</span><span>{formatEuro(order.totalCents)}</span></p>
            </div>
            <Btn>Bestellung ansehen</Btn>
          </Mail>
        )}
        {!b && kind !== 'bestellung' && <p className="text-muted">Noch keine Buchung vorhanden.</p>}
      </div>
    </div>
  );
}
