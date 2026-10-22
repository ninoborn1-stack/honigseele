import type { Metadata } from 'next';
import Link from 'next/link';
import { TickerBand } from '@/components/ui/ticker';
import { notFound } from 'next/navigation';
import { Placeholder } from '@/components/ui/badge';
import { ArrowLink, ButtonLink } from '@/components/ui/button';
import { Parallax, RevealHeading } from '@/components/ui/motion';
import { Photo } from '@/components/ui/photo';
import { Reveal } from '@/components/ui/reveal';
import { Eyebrow, Title } from '@/components/ui/typography';
import { care, categories, faq, getCategory, servicesOf, staff, staffServices, treatmentCategories } from '@/content';
import { LASER_DISCOUNT_TIERS } from '@/domain/pricing';
import { Accordion } from '@/features/treatments/accordion';
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

/** Laser: Vorgespräch, Mehrzonen-Rabatt, Ganzkörper – alles aus content/ bzw. domain/ */
function LaserNotes({ consultationCents, fullBodyCents }: { consultationCents?: number; fullBodyCents?: number }) {
  const tiers = [...LASER_DISCOUNT_TIERS].sort((a, b) => a.minZones - b.minZones);
  return (
    <div className="honey-glow on-dark overflow-hidden rounded-[2rem] p-7 text-cream-50">
      <p className="eyebrow">Gut zu wissen</p>
      <ul className="mt-6 space-y-6">
        <li>
          <p className="font-serif text-3xl leading-tight">Erst das Vorgespräch</p>
          <p className="mt-2 text-sm text-cream-100/80">
            Wir lernen Deine Haut kennen und machen einen Probeschuss{consultationCents === 0 ? ' – inklusive' : consultationCents ? ` – ${formatEuro(consultationCents)}` : ''}.
          </p>
        </li>
        <li className="border-t border-cream-50/15 pt-6">
          <p className="font-serif text-3xl leading-tight">Mehrzonen-Rabatt</p>
          <div className="mt-3 flex gap-3">
            {tiers.map((t) => (
              <span key={t.minZones} className="flex-1 rounded-2xl border border-cream-50/15 p-3 text-center">
                <span className="block font-serif text-4xl text-honey-300">{t.percent} %</span>
                <span className="text-xs text-cream-100/75">ab {t.minZones} Zonen</span>
              </span>
            ))}
          </div>
        </li>
        {fullBodyCents && (
          <li className="border-t border-cream-50/15 pt-6">
            <p className="font-serif text-3xl leading-tight">
              Ganzkörper Damen <span className="text-honey-300">{formatEuro(fullBodyCents)}</span>
            </p>
            <p className="mt-2 text-sm text-cream-100/80">Festpreis, ohne zusätzlichen Zonen-Rabatt.</p>
          </li>
        )}
      </ul>
    </div>
  );
}

export default async function AreaPage({ params }: { params: Promise<{ bereich: string }> }) {
  const { bereich } = await params;
  const category = getCategory(bereich);
  if (!category) notFound();
  const services = servicesOf(category.id);
  const info = care[category.id];
  const questions = faq[category.id] ?? (category.isPlaceholder ? [] : faq.allgemein);
  const others = categories.filter((c) => c.inTreatments && c.id !== category.id && !c.isPlaceholder);
  const index = treatmentCategories.findIndex((c) => c.id === category.id);
  const lead = category.intro.split(/(?<=\.)\s/)[0];
  const isLaser = category.id === 'laser';
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

      {/* 1. Vollbild-Kopf */}
      <section className="relative flex min-h-[560px] items-end overflow-hidden bg-honey-950 text-cream-50 md:h-[calc(88svh-var(--top-h,96px))]">
        <Parallax speed={-0.18} className="absolute -inset-y-[12%] inset-x-0">
          <Photo src={category.image} alt={category.name} priority className="h-full w-full !bg-honey-950" imgClassName="animate-fade" />
        </Parallax>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgb(28_21_15/0.94)_0%,rgb(28_21_15/0.68)_40%,rgb(28_21_15/0.42)_72%,rgb(28_21_15/0.6)_100%)]" />
        <div className="wrap relative pb-12 pt-40 md:pb-16">
          <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.2em] text-cream-100/80">
            <Link href="/behandlungen/" className="hover:text-cream-50">Behandlungen</Link>
            <span className="h-px w-6 bg-cream-100/50" />
            <span className="text-honey-300">{String(index + 1).padStart(2, '0')} / {String(treatmentCategories.length).padStart(2, '0')}</span>
          </div>
          <Eyebrow className="mt-8 !text-honey-300">{category.eyebrow}</Eyebrow>
          <RevealHeading as="h1" onLoad text={category.name} className="mt-5 max-w-[12ch] font-serif text-[clamp(2.6rem,11vw,12rem)] leading-[0.88] tracking-[-0.03em]" />
          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-xl text-lg text-cream-100/90 md:text-xl">{category.teaser}</p>
            {category.isPlaceholder ? (
              <Placeholder label="Inhalte folgen von Anna" />
            ) : (
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <ButtonLink href={`/buchen/?kategorie=${category.id}`} variant="honey" size="lg" arrow data-label="Buchen">
                  Jetzt buchen
                </ButtonLink>
                {services.length > 0 && (
                  <ArrowLink href="#preise" light data-no-curtain>
                    Preise
                  </ArrowLink>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Statement */}
      <section className="bg-cream-50 py-24 md:py-40">
        <div className="wrap flex flex-col items-center text-center">
          <Eyebrow>{category.name}</Eyebrow>
          <RevealHeading as="p" text={category.intro.replace(lead, `*${lead.replace(/\*/g, '')}*`)} className="mt-10 max-w-[28ch] font-serif text-[clamp(1.9rem,3.6vw,3.6rem)] leading-[1.12]" />
        </div>
      </section>

      {/* 3. Preisliste */}
      {services.length > 0 && (
        <section id="preise" className="scroll-mt-24 border-t border-line bg-cream-50 pb-24 pt-20 md:pb-36 md:pt-28">
          <div className="wrap">
            <div className="mb-14 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end">
              <div>
                <Eyebrow>Preise</Eyebrow>
                <Title className="mt-6">{`Unsere *Preisliste*`}</Title>
              </div>
              <p className="max-w-sm text-sm text-muted md:text-right">Alle Preise inkl. MwSt., Dauer als ca.-Angabe. Mehrere Leistungen kannst Du beim Buchen kombinieren.</p>
            </div>
            <PriceList
              categoryId={category.id}
              initialServices={services}
              initialStaffServices={staffServices}
              initialStaff={staff}
              aside={
                isLaser ? (
                  <LaserNotes consultationCents={services.find((s) => s.isConsultation)?.priceCents} fullBodyCents={services.find((s) => s.id === 'laser-d-ganzkoerper')?.priceCents} />
                ) : undefined
              }
            />
          </div>
        </section>
      )}

      {/* 4. Vorbereitung & Nachsorge */}
      {info && (
        <section className="honey-glow on-dark py-24 text-cream-50 md:py-36">
          <div className="wrap">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow>Vorbereitung & Nachsorge</Eyebrow>
                <Title className="mt-6">So wird es *richtig schön*.</Title>
              </div>
              {info.placeholder && <Placeholder />}
            </div>
            <div className="mt-20 grid gap-16 md:grid-cols-3 md:gap-10 lg:gap-16">
              {[
                { title: 'Vorher', items: info.preparation },
                { title: 'Nachher', items: info.aftercare },
                { title: 'Rhythmus', items: [info.rhythm] },
              ].map((col, i) => (
                <Reveal key={col.title} delay={i * 140}>
                  <span className="font-serif text-[clamp(5rem,9vw,8.5rem)] leading-[0.8] text-honey-300/90">{String(i + 1).padStart(2, '0')}</span>
                  <div className="draw-line mt-8 h-px w-full bg-cream-50/40" />
                  <h3 className="mt-8 font-serif text-4xl">{col.title}</h3>
                  <ul className="mt-6 space-y-4 text-lg text-cream-100/85">
                    {col.items.map((x) => (
                      <li key={x} className="flex gap-4">
                        <span className="mt-3.5 h-px w-5 shrink-0 bg-honey-300" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. FAQ */}
      {questions.length > 0 && (
        <section className="bg-cream-100 py-24 md:py-36">
          <div className="wrap grid gap-14 lg:grid-cols-[0.8fr_1.6fr] lg:gap-24">
            <div className="lg:sticky lg:top-[calc(var(--top-h,96px)+2rem)] lg:self-start">
              <Eyebrow>Häufige Fragen</Eyebrow>
              <Title className="mt-6">Gut zu *wissen*.</Title>
              <p className="mt-6 max-w-sm text-muted">Noch etwas offen? Ruf uns an oder schreib uns auf WhatsApp – wir helfen gern.</p>
              <Placeholder label="Antworten: Entwurf" className="mt-6" />
            </div>
            <Accordion items={questions} />
          </div>
        </section>
      )}

      {/* 6. Abschluss */}
      <section className="bg-cream-50 pt-24 md:pt-36">
        <div className="wrap flex flex-col items-center text-center">
          <Eyebrow>{category.isPlaceholder ? 'Bald mehr' : 'Bereit?'}</Eyebrow>
          <Title size="display" className="mt-8 max-w-[12ch]">
            {category.isPlaceholder ? 'Lust auf *mehr*?' : 'Zeit für *Dich*.'}
          </Title>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {!category.isPlaceholder && (
              <ButtonLink href={`/buchen/?kategorie=${category.id}`} size="lg" arrow data-label="Buchen">
                {category.name} buchen
              </ButtonLink>
            )}
            <ArrowLink href="/behandlungen/">Alle Behandlungen</ArrowLink>
          </div>
        </div>
        <TickerBand className="mt-24 md:mt-32" items={others.map((o) => ({ label: o.name, href: `/behandlungen/${o.id}/` }))} />
      </section>

      {!category.isPlaceholder && <StickyBook href={`/buchen/?kategorie=${category.id}`} label={`${category.name} buchen`} />}
    </>
  );
}
