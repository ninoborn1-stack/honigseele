import type { Metadata } from 'next';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { RevealImage } from '@/components/ui/motion';
import { Eyebrow, Title } from '@/components/ui/typography';
import { site } from '@/content';
import { InquiryForm } from '@/features/about/inquiry-form';

export const metadata: Metadata = { title: 'Kontakt & Anfahrt', description: 'Honigseele, Hornstraße 1, 10963 Berlin-Kreuzberg. Telefon, E-Mail, WhatsApp.' };

export default function ContactPage() {
  const c = site.settings.contact;
  const rows = [
    { icon: MapPin, label: 'Adresse', value: `${site.location.street}, ${site.location.zip} ${site.location.city}`, hint: 'U-Bahn Mehringdamm / Möckernbrücke' },
    { icon: Phone, label: 'Telefon', value: c.phone, href: `tel:${c.phone.replace(/\s/g, '')}` },
    { icon: Mail, label: 'E-Mail', value: c.email, href: `mailto:${c.email}` },
    { icon: MessageCircle, label: 'WhatsApp', value: 'Schreib uns', href: c.whatsapp },
  ];
  return (
    <>
      <section className="honey-light pb-16 pt-16 md:pb-24 md:pt-24">
        <div className="wrap">
          <Eyebrow>Kontakt</Eyebrow>
          <Title as="h1" size="display" className="mt-8 max-w-[14ch]">
            Schreib uns, ruf an oder *komm vorbei*.
          </Title>
        </div>
      </section>
      <section className="bg-cream-50 pb-24 md:pb-36">
        <div className="wrap grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <ul className="border-t border-honey-950/20">
              {rows.map(({ icon: Icon, label, value, href, hint }) => {
                const inner = (
                  <>
                    <Icon className="mt-1 h-5 w-5 text-amber-800" strokeWidth={1.5} />
                    <span className="min-w-0">
                      <span className="block text-xs uppercase tracking-[0.18em] text-muted">{label}</span>
                      <span className="mt-1 block break-words font-serif text-[clamp(1.5rem,2.6vw,2.6rem)] leading-tight">{value}</span>
                      {hint && <span className="mt-1 block text-sm text-muted">{hint}</span>}
                    </span>
                  </>
                );
                return (
                  <li key={label} className="border-b border-honey-950/20">
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex gap-6 py-8 transition-colors hover:text-amber-600">
                        {inner}
                      </a>
                    ) : (
                      <div className="flex gap-6 py-8">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-8 text-muted">Wir sprechen {site.brand.teamLanguages.join(', ')}.</p>
            <RevealImage src="/images/stock/plants.jpg" alt="Pampasgras in warmem Licht" className="mt-14 hidden aspect-[16/10] rounded-[2rem] lg:block" />
          </div>
          <div className="lg:sticky lg:top-[calc(var(--top-h,96px)+2rem)] lg:self-start">
            <div className="rounded-[2rem] border border-line bg-card p-8 md:p-12">
              <p className="font-serif text-4xl">Nachricht an uns</p>
              <p className="mb-8 mt-2 text-muted">Wir antworten in der Regel innerhalb eines Werktags.</p>
              <InquiryForm kind="kontakt" cta="Nachricht senden" />
            </div>
            <ButtonLink href="/buchen/" size="lg" arrow className="mt-6 w-full">
              Lieber direkt einen Termin buchen
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
