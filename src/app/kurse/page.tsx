import type { Metadata } from 'next';
import { Placeholder } from '@/components/ui/badge';
import { ArrowLink, ButtonLink } from '@/components/ui/button';
import { CountUp, RevealHeading } from '@/components/ui/motion';
import { PageHero } from '@/components/ui/page-hero';
import { Reveal } from '@/components/ui/reveal';
import { StackCards, type StackCard } from '@/components/ui/stack-cards';
import { Eyebrow, Title } from '@/components/ui/typography';
import { courses, products, servicesOf } from '@/content';
import type { Course } from '@/domain/types';
import { CoursePlan } from '@/features/courses/course-plan';
import { formatDuration, formatEuro } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Kurse, Yoga & Coaching',
  description: 'Yoga mit Kati und Maria, Pränatal & Postnatal Yoga, Breathwork, Kakaozeremonie, Bienenstock Frauen-Netzwerk und Coaching in Berlin-Kreuzberg.',
};

/** Kurs- oder Coaching-Liste innerhalb einer Stapelkarte (erbt die Textfarbe der Karte) */
function OfferList({ rows, cta }: { rows: { name: string; meta: string; priceCents: number; href?: string }[]; cta: { href: string; label: string } }) {
  return (
    <div className="mt-6">
      <ul className="border-t border-current/15">
        {rows.slice(0, 3).map((r) => (
          <li key={r.name} className="flex items-baseline justify-between gap-6 border-b border-current/10 py-2.5">
            <span className="min-w-0 truncate">
              <span className="font-serif text-xl">{r.name}</span>
              <span className="ml-3 hidden text-sm opacity-60 xl:inline">{r.meta}</span>
            </span>
            <span className="font-serif text-xl whitespace-nowrap">{formatEuro(r.priceCents)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <ArrowLink href={cta.href} className="!text-current" data-no-curtain={cta.href.startsWith('#') ? true : undefined}>
          {cta.label}
        </ArrowLink>
      </div>
    </div>
  );
}

const courseRow = (c: Course) => ({ name: c.name, meta: `mit ${c.leaderName} · ${formatDuration(c.durationMin)}`, priceCents: c.priceCents });

export default function CoursesPage() {
  const yoga = courses.filter((c) => c.kind === 'yoga');
  const community = courses.filter((c) => c.kind === 'workshop');
  const training = courses.filter((c) => c.kind === 'schulung' || c.kind === 'event');
  const coaching = servicesOf('coaching');
  const cards = products.filter((p) => p.kind === 'karte' && p.active);
  const beehive = courses.find((c) => c.id === 'bienenstock');

  const facts = [
    { value: courses.length, label: 'Kurse & Workshops' },
    { value: courses.reduce((n, c) => n + c.schedule.length, 0), label: 'Termine pro Woche' },
    { value: Math.max(...yoga.map((c) => c.capacity)), label: 'Plätze je Yoga-Gruppe' },
    { value: coaching.length, label: 'Coaching-Angebote' },
  ];

  const formats: StackCard[] = [
    {
      title: 'Yoga',
      kicker: `${yoga.length} Kurse · mit Kati & Maria`,
      text: 'Für alle Level, in kleinen Gruppen. Auch in der Schwangerschaft und danach – Babys sind willkommen.',
      image: '/images/stock/yoga.jpg',
      extra: <OfferList rows={yoga.map(courseRow)} cta={{ href: '#kursplan', label: 'Zum Kursplan' }} />,
    },
    {
      title: 'Gemeinschaft',
      kicker: `${community.length} Formate`,
      text: 'Atmen, bewegen, teilen: Breathwork, Kakaozeremonie, gemeinsame Spaziergänge und unser Frauen-Netzwerk.',
      image: '/images/stock/plants.jpg',
      extra: <OfferList rows={community.map(courseRow)} cta={{ href: '#kursplan', label: 'Termine ansehen' }} />,
    },
    {
      title: 'Coaching',
      kicker: 'Honigseelengeflüster',
      text: 'Mit Asita im Coaching, mit Larissa in der ganzheitlichen Ernährungsberatung. Einzeln, vertraulich, in Ruhe.',
      image: '/images/stock/coaching.jpg',
      extra: <OfferList rows={coaching.map((s) => ({ name: s.name, meta: formatDuration(s.durationMin), priceCents: s.priceCents }))} cta={{ href: '/buchen/?kategorie=coaching', label: 'Coaching buchen' }} />,
    },
    {
      title: 'Schulungen',
      kicker: 'Von Anna lernen',
      text: 'Waxing mit Honigwachs – mit allem, was Anna in sieben Jahren gelernt hat. Kleine Gruppen, viel Praxis.',
      image: '/images/stock/waxing.jpg',
      extra: <OfferList rows={training.map(courseRow)} cta={{ href: '/kontakt/', label: 'Anfragen' }} />,
    },
  ];

  return (
    <>
      {/* 1. Seitenkopf */}
      <PageHero
        image="/images/stock/yoga.jpg"
        alt="Yoga in warmem Licht"
        imageClassName="object-[50%_30%]"
        eyebrow="Kurse & Coaching · Gemeinschaft in Kreuzberg"
        title="Bewegen, atmen, *verbinden*."
        lead="Yoga, Breathwork, Kakaozeremonie, unser Frauen-Netzwerk – und Coaching für das, was Dich innen bewegt."
        actions={
          <ArrowLink href="#kursplan" light data-no-curtain>
            Zum Kursplan
          </ArrowLink>
        }
      />

      {/* 2. Statement */}
      <section className="bg-cream-50 py-24 md:py-36">
        <div className="wrap flex flex-col items-center text-center">
          <Eyebrow className="justify-center">Mehr als Pflege</Eyebrow>
          <Reveal delay={100}>
            <p className="mx-auto mt-10 max-w-4xl font-serif text-[clamp(1.7rem,3vw,3rem)] leading-[1.25]">
              „Die Honigseele ist auch ein Ort der Gemeinschaft. Hier wird geatmet, gedehnt, geteilt – und manchmal einfach nur still zusammen Kakao getrunken.“
            </p>
          </Reveal>
          <Reveal delay={250}>
            <p className="mt-10 text-xs font-medium uppercase tracking-[0.22em] text-muted">Die Honigseelen</p>
          </Reveal>
        </div>
      </section>

      {/* 3. Zahlen */}
      <section className="border-y border-line-soft bg-cream-50">
        <ul className="wrap grid grid-cols-2 lg:grid-cols-4">
          {facts.map((f, i) => (
            <li key={f.label} className={`flex flex-col items-center gap-3 py-12 text-center md:py-16 ${i % 2 ? 'border-l border-line-soft' : ''} ${i === 2 ? 'border-t border-line-soft lg:border-l lg:border-t-0' : ''} ${i === 3 ? 'border-t border-line-soft lg:border-t-0' : ''}`}>
              <CountUp to={f.value} className="font-serif text-[clamp(3.2rem,6vw,5.5rem)] leading-none" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">{f.label}</span>
            </li>
          ))}
        </ul>
        <p className="wrap pb-6 text-center">
          <Placeholder label="Termine, Preise & Plätze: Demo-Werte" />
        </p>
      </section>

      {/* 4. Kursplan */}
      <section id="kursplan" className="scroll-mt-[var(--top-h,96px)] bg-cream-50 py-24 md:py-36">
        <div className="wrap">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <Eyebrow className="justify-center">Kursplan</Eyebrow>
            <Title className="mt-7">Die nächsten *drei Wochen*.</Title>
            <p className="mt-6 text-muted md:text-lg">Tippe auf einen Termin, um Deinen Platz zu buchen – einzeln oder mit Deiner 5er- oder 10er-Karte.</p>
          </div>
          <CoursePlan initialCourses={courses} />
        </div>
      </section>

      {/* 5. Formate als Stapelkarten */}
      <section id="coaching" className="scroll-mt-[var(--top-h,96px)] bg-cream-50 pb-10">
        <div className="wrap mb-14 text-center md:mb-20">
          <Eyebrow className="justify-center">Formate</Eyebrow>
          <Title className="mt-7">Finde, was Dich *bewegt*.</Title>
        </div>
        <StackCards cards={formats} />
      </section>

      {/* 6. Bienenstock */}
      {beehive && (
        <section className="bg-cream-50 py-24 md:py-36">
          <div className="wrap flex flex-col items-center text-center">
            <Eyebrow className="justify-center">{beehive.name}</Eyebrow>
            <RevealHeading as="h2" text="Frauen, die sich *gegenseitig* stärken." className="mx-auto mt-8 max-w-[16ch] text-[clamp(2.6rem,6vw,6.4rem)] leading-[0.96]" />
            <Reveal delay={200}>
              <p className="mx-auto mt-8 max-w-xl text-muted md:text-lg">{beehive.description} Einmal im Monat, mit {beehive.leaderName}.</p>
              <div className="mt-10 flex justify-center">
                <ButtonLink href="#kursplan" size="lg" arrow data-no-curtain>
                  Nächsten Abend finden
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* 7. Karten & Events */}
      <section className="bg-cream-50 px-[clamp(0.75rem,1.6vw,1.75rem)] pb-24 md:pb-36">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="honey-glow on-dark flex min-h-[440px] flex-col justify-between gap-10 rounded-t-[2.5rem] rounded-b-[1.5rem] p-8 text-cream-50 sm:p-12 md:rounded-t-[4rem] lg:p-16">
            <div>
              <Eyebrow>Yoga-Karten</Eyebrow>
              <RevealHeading as="h2" text="Öfter kommen, *weniger* zahlen." className="mt-7 text-[clamp(2.4rem,4.4vw,4.6rem)] leading-[0.98]" />
              <ul className="mt-8 border-t border-cream-50/15">
                {cards.map((p) => (
                  <li key={p.id} className="flex items-baseline justify-between gap-6 border-b border-cream-50/10 py-4">
                    <span>
                      <span className="block font-serif text-2xl">{p.name}</span>
                      <span className="text-sm text-cream-100/60">{p.description.split('.')[0]}.</span>
                    </span>
                    <span className="font-serif text-2xl whitespace-nowrap text-honey-300">{formatEuro(p.priceCents)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <ButtonLink href="/shop/#karten" variant="honey" size="lg" arrow data-label="Shop">
                Karte kaufen
              </ButtonLink>
            </div>
          </div>
          <div className="flex min-h-[440px] flex-col justify-between gap-10 rounded-t-[2.5rem] rounded-b-[1.5rem] bg-cream-100 p-8 sm:p-12 md:rounded-t-[4rem] lg:p-16">
            <div>
              <Eyebrow>Events</Eyebrow>
              <RevealHeading as="h2" text="Lesungen, Märkte, *Abende*." className="mt-7 text-[clamp(2.4rem,4.4vw,4.6rem)] leading-[0.98]" />
              <p className="mt-6 max-w-md text-lg text-muted">Hier stehen bald unsere Events. Melde Dich zum Newsletter an, dann verpasst Du nichts.</p>
              <Placeholder label="Event-Inhalte folgen" className="mt-4" />
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <ButtonLink href="/#newsletter" size="lg" arrow>
                Zum Newsletter
              </ButtonLink>
              <ArrowLink href="/kontakt/">Event-Idee?</ArrowLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
