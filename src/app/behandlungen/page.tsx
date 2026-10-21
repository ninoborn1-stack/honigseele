import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Placeholder } from '@/components/ui/badge';
import { Photo } from '@/components/ui/photo';
import { Reveal } from '@/components/ui/reveal';
import { Eyebrow, Section, Title } from '@/components/ui/typography';
import { servicesOf, treatmentCategories } from '@/content';
import { formatEuro } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Behandlungen & Preise',
  description: 'Waxing mit Honigwachs, Laser-Haarentfernung, Gesichtsbehandlungen, Massagen, Mani- & Pediküre und Wohlfühl-Pakete in Berlin-Kreuzberg.',
};

export default function TreatmentsPage() {
  return (
    <>
      <Section tone="light" className="!pb-12">
        <Eyebrow>Behandlungen</Eyebrow>
        <Title as="h1" className="mt-4 max-w-3xl">Alles, was Dir *guttut*.</Title>
        <p className="mt-6 max-w-xl text-lg text-muted">Über 120 Behandlungen in acht Bereichen – alle mit unserer eigenen Naturkosmetik und mit ganz viel Zeit für Dich.</p>
      </Section>
      <Section className="!pt-4">
        <div className="grid gap-x-10 gap-y-16 md:grid-cols-2">
          {treatmentCategories.map((c, i) => {
            const list = servicesOf(c.id);
            const min = list.length ? Math.min(...list.filter((s) => s.priceCents > 0).map((s) => s.priceCents)) : 0;
            return (
              <Reveal key={c.id} delay={(i % 2) * 120} className={i % 2 ? 'md:mt-24' : ''}>
                <Link href={`/behandlungen/${c.id}/`} data-label={c.name} className="group block">
                  <Photo src={c.image} alt={c.name} className="aspect-[4/5] rounded-[2rem] transition-[border-radius] duration-700 group-hover:rounded-[3.5rem]" imgClassName="transition-transform duration-1000 group-hover:scale-105" />
                  <div className="mt-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">{c.eyebrow}</p>
                      <h2 className="mt-2 text-4xl">{c.name}</h2>
                      <p className="mt-2 text-muted">{c.teaser}</p>
                      <p className="mt-3 text-sm">
                        {c.isPlaceholder ? <Placeholder label="Inhalte folgen" /> : `${list.length} Leistungen · ab ${formatEuro(min)}`}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-8 h-6 w-6 shrink-0 text-amber-800 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" strokeWidth={1.5} />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>
    </>
  );
}
