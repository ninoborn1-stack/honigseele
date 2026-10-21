import type { Metadata } from 'next';
import { Star } from 'lucide-react';
import { Placeholder } from '@/components/ui/badge';
import { ArrowLink } from '@/components/ui/button';
import { CountUp, Parallax, RevealHeading } from '@/components/ui/motion';
import { Photo } from '@/components/ui/photo';
import { Reveal } from '@/components/ui/reveal';
import { StackCards } from '@/components/ui/stack-cards';
import { Eyebrow, Title } from '@/components/ui/typography';
import { block, site, staff } from '@/content';
import { InquiryButton } from '@/features/about/inquiry-drawer';
import { TeamGrid } from '@/features/about/team-grid';

export const metadata: Metadata = {
  title: 'Über uns – die Honigseelen',
  description: 'Das Team der Honigseele in Berlin-Kreuzberg: Depiladoras, Kosmetikerinnen, Masseurinnen, Podologin, Coaches und Yogalehrerinnen.',
};

const values = [
  { title: 'Alle sind willkommen', text: 'Frauen, Männer, Kinder, Teens, Paare – und alle dazwischen. Bei uns wird niemand bewertet.', image: '/images/stock/room.jpg' },
  { title: 'Selbstbestimmt', text: 'Ein zeitgemäßes Verständnis von Weiblichkeit. Du entscheidest, was Dir guttut – wir begleiten Dich dabei.', image: '/images/stock/plants.jpg' },
  { title: 'Ganzheitlich', text: 'Haut, Körper und Seele gehören zusammen. Deshalb gibt es bei uns Waxing und Coaching unter einem Dach.', image: '/images/stock/towels.jpg' },
  { title: 'Natürlich', text: 'Unsere eigene Naturkosmetik, handgemacht in der Crememanufaktur Berlin, steckt in jeder Anwendung.', image: '/images/stock/honey.jpg' },
];

export default function AboutPage() {
  const team = staff.filter((s) => s.visible);
  const facts = [
    { value: 7, label: 'Jahre in Kreuzberg' },
    { value: team.length, label: 'Honigseelen' },
    { value: site.brand.rating.value, decimals: 1, label: `Sterne bei ${site.brand.rating.source}` },
    { value: site.brand.teamLanguages.length, label: 'Sprachen im Team' },
  ];

  return (
    <>
      {/* 1. Vollbild-Kopf */}
      <section className="relative flex min-h-[560px] items-end overflow-hidden bg-honey-950 text-cream-50 md:h-[calc(88svh-var(--top-h,96px))]">
        <Parallax speed={-0.18} className="absolute -inset-y-[12%] inset-x-0">
          <Photo src="/images/stock/room.jpg" alt="Heller Raum mit Pflanzen in der Honigseele" priority className="h-full w-full !bg-honey-950" imgClassName="animate-fade" />
        </Parallax>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgb(28_21_15/0.94)_0%,rgb(28_21_15/0.66)_42%,rgb(28_21_15/0.4)_72%,rgb(28_21_15/0.6)_100%)]" />
        <div className="wrap relative pb-12 pt-40 md:pb-16">
          <Eyebrow className="!text-honey-300">Über uns · seit sieben Jahren in Kreuzberg</Eyebrow>
          <RevealHeading as="h1" text="Wir sind die *Honigseelen*." className="mt-6 max-w-[11ch] font-serif text-[clamp(3rem,10vw,11rem)] leading-[0.88] tracking-[-0.03em]" />
          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-xl text-lg text-cream-100/90 md:text-xl">Ein Ort für Frauen und für alle Menschen, die sich Zeit für sich nehmen wollen.</p>
            <ArrowLink href="#team" light data-no-curtain>
              Das Team
            </ArrowLink>
          </div>
        </div>
      </section>

      {/* 2. Geschichte als ruhiges Statement */}
      <section className="bg-cream-50 py-24 md:py-36">
        <div className="wrap flex flex-col items-center text-center">
          <Eyebrow className="justify-center">Unsere Geschichte</Eyebrow>
          <Reveal delay={100}>
            <p className="mx-auto mt-10 max-w-4xl font-serif text-[clamp(1.7rem,3vw,3rem)] leading-[1.25]">„{block('about.text')}“</p>
          </Reveal>
          <Reveal delay={250}>
            <p className="mt-10 text-xs font-medium uppercase tracking-[0.22em] text-muted">Anna Kaiser · Gründerin, „Die Seele des Honigs“</p>
          </Reveal>
        </div>
      </section>

      {/* 3. Zahlen */}
      <section className="border-y border-line-soft bg-cream-50">
        <ul className="wrap grid grid-cols-2 lg:grid-cols-4">
          {facts.map((f, i) => (
            <li key={f.label} className={`flex flex-col items-center gap-3 py-12 text-center md:py-16 ${i % 2 ? 'border-l border-line-soft' : ''} ${i === 2 ? 'border-t border-line-soft lg:border-l lg:border-t-0' : ''} ${i === 3 ? 'border-t border-line-soft lg:border-t-0' : ''}`}>
              <span className="flex items-center gap-2 font-serif text-[clamp(3.2rem,6vw,5.5rem)] leading-none">
                <CountUp to={f.value} decimals={f.decimals ?? 0} />
                {f.decimals && <Star className="h-6 w-6 fill-amber-600 text-amber-600" strokeWidth={1} />}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">{f.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Haltung als Stapelkarten */}
      <section className="bg-cream-50 pb-10 pt-24 md:pt-36">
        <div className="wrap mb-14 text-center md:mb-20">
          <Eyebrow className="justify-center">Haltung</Eyebrow>
          <Title className="mt-7">Was uns *ausmacht*.</Title>
        </div>
        <StackCards cards={values} kicker="Was uns ausmacht" />
      </section>

      {/* 5. Team */}
      <section id="team" className="bg-cream-50 py-24 md:py-36">
        <div className="wrap">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <Eyebrow className="justify-center">Das Team</Eyebrow>
            <Title className="mt-7">Wer Dich *empfängt*.</Title>
            <p className="mt-6 text-muted md:text-lg">Dazu kommen externe Masseur*innen und Therapeut*innen, die bei uns Räume mieten.</p>
            <Placeholder label="Teamfotos & Porträts folgen" className="mt-5" />
          </div>
          <TeamGrid initialStaff={staff} />
        </div>
      </section>

      {/* 6. Raum mieten & Jobs */}
      <section className="bg-cream-50 px-[clamp(0.75rem,1.6vw,1.75rem)] pb-24 md:pb-36">
        <div className="grid gap-4 lg:grid-cols-2">
          <div id="raum-mieten" className="honey-glow on-dark flex min-h-[440px] flex-col justify-between gap-10 rounded-t-[2.5rem] rounded-b-[1.5rem] p-8 text-cream-50 sm:p-12 md:rounded-t-[4rem] lg:p-16">
            <div>
              <Eyebrow>Raum mieten</Eyebrow>
              <RevealHeading as="h2" text="Dein Raum in der *Honigseele*." className="mt-7 text-[clamp(2.4rem,4.4vw,4.6rem)] leading-[0.98]" />
              <p className="mt-6 max-w-md text-lg text-cream-100/80">{block('about.rent.text')}</p>
            </div>
            <div>
              <InquiryButton kind="raum-mieten" label="Raum anfragen" title="Raum mieten" variant="honey" placeholder="Was bietest Du an, wann und wie oft möchtest Du den Raum nutzen?" />
              <p className="mt-4 text-sm text-cream-100/60">Bald mit eigenem Profil in der Honigseele-Community.</p>
            </div>
          </div>
          <div id="jobs" className="flex min-h-[440px] flex-col justify-between gap-10 rounded-t-[2.5rem] rounded-b-[1.5rem] bg-cream-100 p-8 sm:p-12 md:rounded-t-[4rem] lg:p-16">
            <div>
              <Eyebrow>Jobs</Eyebrow>
              <RevealHeading as="h2" text="Werde eine *Honigseele*." className="mt-7 text-[clamp(2.4rem,4.4vw,4.6rem)] leading-[0.98]" />
              <p className="mt-6 max-w-md text-lg text-muted">{block('jobs.text')}</p>
              <Placeholder label="Stellenanzeigen folgen" className="mt-4" />
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <InquiryButton kind="job" label="Bewerben" title="Bewerbung" placeholder="Erzähl uns von Dir." />
              <ArrowLink href="/kontakt/">Lieber persönlich</ArrowLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
