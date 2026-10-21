import type { Metadata } from 'next';
import { Star } from 'lucide-react';
import { Placeholder } from '@/components/ui/badge';
import { Photo } from '@/components/ui/photo';
import { Reveal } from '@/components/ui/reveal';
import { Eyebrow, Numeral, Section, Title } from '@/components/ui/typography';
import { block, site, staff } from '@/content';
import { InquiryForm } from '@/features/about/inquiry-form';
import { TeamGrid } from '@/features/about/team-grid';

export const metadata: Metadata = {
  title: 'Über uns – die Honigseelen',
  description: 'Das Team der Honigseele in Berlin-Kreuzberg: Depiladoras, Kosmetikerinnen, Masseurinnen, Podologin, Coaches und Yogalehrerinnen.',
};

const values = [
  { title: 'Alle sind willkommen', text: 'Frauen, Männer, Kinder, Teens, Paare – und alle dazwischen. Bei uns wird niemand bewertet.' },
  { title: 'Selbstbestimmt', text: 'Ein zeitgemäßes Verständnis von Weiblichkeit. Du entscheidest, was Dir guttut.' },
  { title: 'Ganzheitlich', text: 'Haut, Körper und Seele gehören zusammen. Deshalb gibt es bei uns Waxing und Coaching unter einem Dach.' },
  { title: 'Natürlich', text: 'Unsere eigene Naturkosmetik, handgemacht in der Crememanufaktur Berlin, in jeder Anwendung.' },
];

export default function AboutPage() {
  return (
    <>
      <section className="honey-light">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-14 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-10 md:pb-28 md:pt-24">
          <div>
            <Eyebrow>Über uns</Eyebrow>
            <h1 className="mt-5 text-6xl md:text-8xl">
              Wir sind die <em>Honigseelen</em>.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-muted">{block('about.text')}</p>
            <p className="mt-6 font-serif text-xl italic">– Anna Kaiser, Gründerin</p>
          </div>
          <Photo src="/images/stock/room.jpg" alt="Heller Raum mit Pflanzen" className="aspect-[4/5] rounded-t-full" priority />
        </div>
      </section>

      <Section tone="dark">
        <Eyebrow>Haltung</Eyebrow>
        <Title className="mt-4 max-w-3xl">Was uns *ausmacht*</Title>
        <div className="mt-14 grid gap-12 sm:grid-cols-2">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 80} className="border-t border-cream-50/15 pt-6">
              <Numeral n={i + 1} className="!text-honey-300" />
              <h3 className="mt-4 text-4xl">{v.title}</h3>
              <p className="mt-3 text-cream-100/80">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="team">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Das Team</Eyebrow>
            <Title className="mt-4">Wer Dich *empfängt*</Title>
          </div>
          <Placeholder label="Teamfotos & Porträts folgen" />
        </div>
        <TeamGrid initialStaff={staff} />
        <p className="mt-10 text-sm text-muted">Dazu kommen externe Masseur*innen und Therapeut*innen, die bei uns Räume mieten.</p>
      </Section>

      <Section tone="cream2">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Bewertungen</Eyebrow>
            <p className="mt-6 font-serif text-[8rem] leading-[0.8]">{site.brand.rating.value.toLocaleString('de-DE')}</p>
            <div className="mt-3 flex gap-1 text-amber-600">
              {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-5 w-5 fill-current" strokeWidth={1} />)}
            </div>
            <p className="mt-2 text-muted">aus ca. {site.brand.rating.count.toLocaleString('de-DE')} Bewertungen auf {site.brand.rating.source}</p>
          </div>
          <div className="space-y-8">
            {site.reviews.map((r) => (
              <figure key={r.text} className="border-l border-line pl-6">
                <blockquote className="font-serif text-3xl italic leading-snug">„{r.text}“</blockquote>
                <figcaption className="mt-2 text-sm text-muted">{r.name} {r.placeholder && <Placeholder label="Beispiel" />}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Section>

      <Section id="raum-mieten">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <Eyebrow>Raum mieten</Eyebrow>
            <Title className="mt-4">Dein Raum in der *Honigseele*</Title>
            <p className="mt-5 text-muted">{block('about.rent.text')}</p>
            <Photo src="/images/stock/towels.jpg" alt="Gerollte Handtücher" className="mt-8 aspect-[3/2] rounded-[2rem]" />
          </div>
          <div className="md:pt-24">
            <InquiryForm kind="raum-mieten" cta="Anfrage senden" placeholder="Was bietest Du an, wann und wie oft möchtest Du den Raum nutzen?" />
            <p className="mt-4 text-xs text-muted">Bald mit eigenem Profil in der Honigseele-Community.</p>
          </div>
        </div>
      </Section>

      <Section tone="light" id="jobs">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <Eyebrow>Jobs</Eyebrow>
            <Title className="mt-4">Werde eine *Honigseele*</Title>
            <p className="mt-5 text-muted">{block('jobs.text')}</p>
            <Placeholder label="Stellenanzeigen folgen" className="mt-4" />
          </div>
          <InquiryForm kind="job" cta="Bewerbung senden" placeholder="Erzähl uns von Dir." />
        </div>
      </Section>
    </>
  );
}
