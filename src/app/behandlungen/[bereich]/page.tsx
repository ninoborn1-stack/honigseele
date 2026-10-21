import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Placeholder } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { FaqList } from '@/components/ui/faq-list';
import { Photo } from '@/components/ui/photo';
import { Eyebrow, Numeral, Section, Title } from '@/components/ui/typography';
import { care, categories, faq, getCategory, servicesOf, staff, staffServices, treatmentCategories } from '@/content';
import { PriceList } from '@/features/treatments/price-list';
import { StickyBook } from '@/features/treatments/sticky-book';
import { formatEuro } from '@/lib/format';

export function generateStaticParams() {
  return treatmentCategories.map((c) => ({ bereich: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ bereich: string }> }): Promise<Metadata> {
  const c = getCategory((await params).bereich);
  if (!c) return {};
  return { title: `${c.name} in Berlin-Kreuzberg`, description: `${c.teaser} ${c.intro.slice(0, 110)}…` };
}

export default async function AreaPage({ params }: { params: Promise<{ bereich: string }> }) {
  const { bereich } = await params;
  const category = getCategory(bereich);
  if (!category) notFound();
  const services = servicesOf(category.id);
  const info = care[category.id];
  const questions = faq[category.id] ?? (category.isPlaceholder ? [] : faq.allgemein);
  const firstBookable = services.find((s) => s.bookable && !s.isConsultation) ?? services[0];
  const others = categories.filter((c) => c.inTreatments && c.id !== category.id && !c.isPlaceholder).slice(0, 3);
  const offerJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: category.name,
    itemListElement: services.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.name },
      price: (s.priceCents / 100).toFixed(2),
      priceCurrency: 'EUR',
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerJsonLd) }} />
      {/* 1. Einstieg */}
      <section className="honey-glow on-dark text-cream-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-14 md:grid-cols-[1.1fr_0.9fr] md:items-end md:px-10 md:pb-24 md:pt-24">
          <div>
            <Eyebrow>{category.eyebrow}</Eyebrow>
            <h1 className="mt-5 text-6xl md:text-8xl">{category.name}</h1>
            <p className="mt-8 max-w-xl text-lg text-cream-100/85">{category.intro}</p>
            {category.isPlaceholder && <Placeholder label="Inhalte folgen von Anna" className="mt-6" />}
            {!category.isPlaceholder && firstBookable && (
              <div className="mt-10 flex flex-wrap gap-3">
                <ButtonLink href={`/buchen/?kategorie=${category.id}`} variant="honey" size="lg" data-label="Buchen">
                  Jetzt buchen
                </ButtonLink>
                <ButtonLink href="#preise" variant="light" size="lg">
                  Preise ansehen
                </ButtonLink>
              </div>
            )}
          </div>
          <Photo src={category.image} alt={category.name} className="aspect-[4/5] rounded-t-full md:max-h-[560px]" priority />
        </div>
      </section>

      {/* 2. Preisliste */}
      {services.length > 0 && (
        <Section id="preise">
          <div className="grid gap-12 md:grid-cols-[0.6fr_1.4fr] md:gap-16">
            <div>
              <Eyebrow>Preise</Eyebrow>
              <Title className="mt-4">{`Unsere *Preisliste*`}</Title>
              <p className="mt-5 text-sm text-muted">
                Alle Preise inkl. MwSt. Dauer ca.-Angaben. {category.id === 'laser' && 'Ab 2 Zonen pro Termin 10 %, ab 3 Zonen 20 % Rabatt – wird beim Buchen automatisch abgezogen.'}
              </p>
              {category.id === 'laser' && (
                <p className="mt-6 border-l-2 border-honey-400 pl-4 text-sm">
                  <strong className="font-medium">Ganzkörper Damen</strong> zum Festpreis von {formatEuro(49900)}. Vor der ersten Behandlung steht immer ein Vorgespräch.
                </p>
              )}
            </div>
            <PriceList categoryId={category.id} initialServices={services} initialStaffServices={staffServices} initialStaff={staff} />
          </div>
        </Section>
      )}

      {/* 3. Vorbereitung & Nachsorge */}
      {info && (
        <Section tone="cream2">
          <div className="flex items-center gap-3">
            <Eyebrow>Vorbereitung & Nachsorge</Eyebrow>
            {info.placeholder && <Placeholder />}
          </div>
          <div className="mt-10 grid gap-12 md:grid-cols-3">
            {[
              { title: 'Vorher', items: info.preparation },
              { title: 'Nachher', items: info.aftercare },
              { title: 'Rhythmus', items: [info.rhythm] },
            ].map((col, i) => (
              <div key={col.title}>
                <Numeral n={i + 1} />
                <h3 className="mt-4 text-3xl">{col.title}</h3>
                <ul className="mt-5 space-y-3 text-muted">
                  {col.items.map((x) => (
                    <li key={x} className="flex gap-3">
                      <span className="mt-3 h-px w-4 shrink-0 bg-amber-600" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 4. FAQ */}
      {questions.length > 0 && (
        <Section>
          <div className="grid gap-10 md:grid-cols-[0.6fr_1.4fr] md:gap-16">
            <div>
              <Eyebrow>Häufige Fragen</Eyebrow>
              <Title className="mt-4">Gut zu *wissen*</Title>
              <Placeholder label="Antworten: Entwurf" className="mt-5" />
            </div>
            <FaqList items={questions} />
          </div>
        </Section>
      )}

      {/* 5. Weiter */}
      <Section tone="light" className="text-center">
        <Title className="mx-auto max-w-2xl">{category.isPlaceholder ? 'Lust auf mehr?' : 'Bereit für *Deine* Auszeit?'}</Title>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!category.isPlaceholder && (
            <ButtonLink href={`/buchen/?kategorie=${category.id}`} size="lg" data-label="Buchen">
              {category.name} buchen
            </ButtonLink>
          )}
          {others.map((o) => (
            <ButtonLink key={o.id} href={`/behandlungen/${o.id}/`} variant="ghost" size="lg">
              {o.name}
            </ButtonLink>
          ))}
        </div>
      </Section>
      {!category.isPlaceholder && <StickyBook href={`/buchen/?kategorie=${category.id}`} label={`${category.name} buchen`} />}
    </>
  );
}
