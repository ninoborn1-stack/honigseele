import type { Metadata } from 'next';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Eyebrow, Section } from '@/components/ui/typography';
import { site } from '@/content';
import { InquiryForm } from '@/features/about/inquiry-form';

export const metadata: Metadata = { title: 'Kontakt & Anfahrt', description: 'Honigseele, Hornstraße 1, 10963 Berlin-Kreuzberg. Telefon, E-Mail, WhatsApp.' };

export default function ContactPage() {
  const c = site.settings.contact;
  return (
    <Section tone="light">
      <div className="grid gap-14 md:grid-cols-2">
        <div>
          <Eyebrow>Kontakt</Eyebrow>
          <h1 className="mt-5 text-6xl md:text-7xl">
            Schreib uns, <em>ruf an</em> oder komm vorbei.
          </h1>
          <ul className="mt-10 space-y-4 text-lg">
            <li className="flex gap-4"><MapPin className="mt-1 h-5 w-5 text-amber-800" strokeWidth={1.5} />{site.location.street}, {site.location.zip} {site.location.city}<br />U-Bahn Mehringdamm / Möckernbrücke</li>
            <li><a className="flex gap-4" href={`tel:${c.phone.replace(/\s/g, '')}`}><Phone className="mt-1 h-5 w-5 text-amber-800" strokeWidth={1.5} />{c.phone}</a></li>
            <li><a className="flex gap-4" href={`mailto:${c.email}`}><Mail className="mt-1 h-5 w-5 text-amber-800" strokeWidth={1.5} />{c.email}</a></li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={c.whatsapp} variant="ghost"><MessageCircle className="h-4 w-4" strokeWidth={1.5} /> WhatsApp</ButtonLink>
            <ButtonLink href="/buchen/">Termin buchen</ButtonLink>
          </div>
          <p className="mt-8 text-sm text-muted">Wir sprechen {site.brand.teamLanguages.join(', ')}.</p>
        </div>
        <div className="rounded-[2rem] border border-line bg-card p-7 md:p-10">
          <p className="mb-6 font-serif text-3xl">Nachricht an uns</p>
          <InquiryForm kind="kontakt" cta="Nachricht senden" />
        </div>
      </div>
    </Section>
  );
}
