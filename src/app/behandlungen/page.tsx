import type { Metadata } from 'next';
import { CountUp } from '@/components/ui/motion';
import { Eyebrow, Title } from '@/components/ui/typography';
import { categories, services, servicesOf, treatmentCategories } from '@/content';
import { ServiceSearch } from '@/features/treatments/service-search';
import { ComingSoon, StackPanels, type PanelData } from '@/features/treatments/stack-panels';

export const metadata: Metadata = {
  title: 'Behandlungen & Preise',
  description: 'Waxing mit Honigwachs, Laser-Haarentfernung, Gesichtsbehandlungen, Massagen, Mani- & Pediküre und Wohlfühl-Pakete in Berlin-Kreuzberg.',
};

export default function TreatmentsPage() {
  const live = treatmentCategories.filter((c) => !c.isPlaceholder);
  const soon = treatmentCategories.filter((c) => c.isPlaceholder);
  const panels: PanelData[] = live.map((c) => {
    const list = servicesOf(c.id).filter((s) => s.bookable && s.priceCents > 0);
    // Beispiele: die ersten Leistungen der ersten Gruppe, ohne Extras
    const examples = list.filter((s) => s.group !== 'Extras').slice(0, 3);
    return {
      id: c.id,
      name: c.name,
      eyebrow: c.eyebrow,
      teaser: c.teaser,
      image: c.image,
      count: list.length,
      minCents: Math.min(...list.map((s) => s.priceCents)),
      examples: examples.map((s) => ({ name: s.name, priceCents: s.priceCents, from: s.priceFrom })),
    };
  });
  const bookableCount = live.reduce((n, c) => n + servicesOf(c.id).filter((s) => s.bookable).length, 0);

  return (
    <>
      <section className="honey-light pb-16 pt-16 md:pb-24 md:pt-24">
        <div className="wrap">
          <Eyebrow>Behandlungen & Preise</Eyebrow>
          <Title as="h1" size="display" className="mt-8 max-w-[14ch]">
            Alles, was Dir *guttut*.
          </Title>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-end">
            <p className="max-w-md text-lg text-muted md:text-xl">
              <CountUp to={bookableCount} className="font-serif text-4xl text-honey-950" /> Behandlungen in {live.length} Bereichen – alle mit unserer eigenen Naturkosmetik und mit ganz viel Zeit für Dich.
            </p>
            <ServiceSearch initialServices={services} categories={categories} />
          </div>
        </div>
      </section>

      <StackPanels panels={panels} />
      {soon.length > 0 && (
        <>
          <div className="wrap pb-8 pt-16 md:pt-24">
            <Eyebrow>Bald in der Honigseele</Eyebrow>
          </div>
          <ComingSoon items={soon.map((c) => ({ id: c.id, name: c.name, eyebrow: c.eyebrow, image: c.image }))} />
        </>
      )}
    </>
  );
}
