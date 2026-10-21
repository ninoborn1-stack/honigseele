import type { Metadata } from 'next';
import { Star } from 'lucide-react';
import { Placeholder } from '@/components/ui/badge';
import { ArrowLink } from '@/components/ui/button';
import { CountUp, Marquee, Parallax, RevealHeading, RevealImage } from '@/components/ui/motion';
import { Reveal } from '@/components/ui/reveal';
import { Eyebrow, Section, Title } from '@/components/ui/typography';
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
      {/* Kopf */}
      <section className="honey-light pb-20 pt-16 md:pb-32 md:pt-24">
        <div className="wrap">
          <Eyebrow>Über uns</Eyebrow>
          <Title as="h1" size="display" className="mt-8 max-w-[12ch]">
            Wir sind die *Honigseelen*.
          </Title>
          <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-24">
            <Reveal>
              <p className="max-w-xl text-lg leading-relaxed text-muted md:text-xl">{block('about.text')}</p>
              <p className="mt-8 font-serif text-2xl italic text-amber-600">– Anna Kaiser, Gründerin</p>
            </Reveal>
            <Parallax speed={0.08}>
              <RevealImage src="/images/stock/room.jpg" alt="Heller Raum mit Pflanzen" className="aspect-[5/4] rounded-[2.5rem]" />
            </Parallax>
          </div>
        </div>
      </section>

      {/* Haltung */}
      <Section tone="dark">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div className="lg:sticky lg:top-[calc(var(--top-h,96px)+2rem)] lg:self-start">
            <Eyebrow>Haltung</Eyebrow>
            <Title className="mt-6">Was uns *ausmacht*.</Title>
          </div>
          <ol>
            {values.map((v, i) => (
              <Reveal as="li" key={v.title} delay={i * 80} className="grid grid-cols-[auto_1fr] gap-8 border-t border-cream-50/15 py-10 md:gap-14 md:py-14">
                <span className="font-serif text-6xl leading-none text-honey-300 md:text-8xl">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-serif text-[clamp(2rem,3.4vw,3.4rem)] leading-tight">{v.title}</h3>
                  <p className="mt-4 max-w-lg text-lg text-cream-100/80">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* Team */}
      <Section id="team">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Das Team</Eyebrow>
            <Title className="mt-6">Wer Dich *empfängt*.</Title>
          </div>
          <Placeholder label="Teamfotos & Porträts folgen" />
        </div>
        <TeamGrid initialStaff={staff} />
        <p className="mt-14 text-muted">Dazu kommen externe Masseur*innen und Therapeut*innen, die bei uns Räume mieten.</p>
      </Section>

      {/* Bewertungen */}
      <section className="overflow-hidden border-y border-line bg-cream-100 py-24 md:py-36">
        <div className="wrap grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div>
            <Eyebrow>Bewertungen</Eyebrow>
            <CountUp to={site.brand.rating.value} decimals={1} className="mt-8 block font-serif text-[clamp(8rem,18vw,15rem)] leading-[0.78] tracking-[-0.04em]" />
            <div className="mt-6 flex gap-1 text-amber-600">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-6 w-6 fill-current" strokeWidth={1} />
              ))}
            </div>
            <p className="mt-3 text-lg text-muted">
              aus ca. <CountUp to={site.brand.rating.count} className="font-medium text-honey-950" /> Bewertungen auf {site.brand.rating.source}
            </p>
          </div>
          <div className="space-y-14">
            {site.reviews.map((r, i) => (
              <Reveal key={r.text} delay={i * 120}>
                <figure className="border-l-2 border-honey-400 pl-8">
                  <blockquote className="font-serif text-[clamp(1.8rem,2.8vw,2.8rem)] italic leading-snug">„{r.text}“</blockquote>
                  <figcaption className="mt-4 text-sm uppercase tracking-[0.16em] text-muted">
                    {r.name} {r.placeholder && <Placeholder label="Beispiel" />}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Raum mieten */}
      <section id="raum-mieten" className="bg-cream-50">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[55svh]">
            <RevealImage src="/images/stock/towels.jpg" alt="Gerollte Handtücher" className="!absolute inset-0" />
          </div>
          <div className="px-[clamp(1.25rem,3.5vw,4rem)] py-24 md:py-36 lg:pl-20">
            <Eyebrow>Raum mieten</Eyebrow>
            <Title className="mt-6">Dein Raum in der *Honigseele*.</Title>
            <p className="mt-8 max-w-lg text-lg text-muted">{block('about.rent.text')}</p>
            <div className="mt-12 max-w-xl">
              <InquiryForm kind="raum-mieten" cta="Anfrage senden" placeholder="Was bietest Du an, wann und wie oft möchtest Du den Raum nutzen?" />
            </div>
            <p className="mt-5 text-sm text-muted">Bald mit eigenem Profil in der Honigseele-Community.</p>
          </div>
        </div>
      </section>

      <div className="border-y border-line bg-cream-50 py-6" aria-hidden>
        <Marquee
          speed={60}
          items={['Wir suchen Honigseelen', 'Depiladoras', 'Kosmetiker*innen', 'Masseur*innen'].map((t, i) => (
            <span key={t} className={`whitespace-nowrap font-serif text-[clamp(2rem,4.5vw,4rem)] leading-none ${i % 2 ? 'italic text-amber-600' : ''}`}>
              {t}
            </span>
          ))}
        />
      </div>

      {/* Jobs */}
      <Section tone="light" id="jobs">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <Eyebrow>Jobs</Eyebrow>
            <RevealHeading as="h2" text="Werde eine *Honigseele*." className="mt-6 text-[clamp(2.5rem,5.6vw,6.2rem)] leading-[0.98]" />
            <p className="mt-8 max-w-lg text-lg text-muted">{block('jobs.text')}</p>
            <Placeholder label="Stellenanzeigen folgen" className="mt-5" />
            <ArrowLink href="/kontakt/" className="mt-10">
              Lieber persönlich?
            </ArrowLink>
          </div>
          <div className="rounded-[2rem] border border-line bg-card p-8 md:p-12">
            <InquiryForm kind="job" cta="Bewerbung senden" placeholder="Erzähl uns von Dir." />
          </div>
        </div>
      </Section>
    </>
  );
}
