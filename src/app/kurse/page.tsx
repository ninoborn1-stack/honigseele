import type { Metadata } from 'next';
import Link from 'next/link';
import { Placeholder } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Photo } from '@/components/ui/photo';
import { Reveal } from '@/components/ui/reveal';
import { Eyebrow, Numeral, Section, Title } from '@/components/ui/typography';
import { courses, servicesOf } from '@/content';
import { CoursePlan } from '@/features/courses/course-plan';
import { formatDuration, formatEuro } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Kurse, Yoga & Coaching',
  description: 'Yoga mit Kati und Maria, Pränatal & Postnatal Yoga, Breathwork, Kakaozeremonie, Bienenstock Frauen-Netzwerk und Coaching in Berlin-Kreuzberg.',
};

const groups = [
  { kind: 'yoga', title: 'Yoga', text: 'Für alle Level, in kleinen Gruppen. Auch in der Schwangerschaft und danach.' },
  { kind: 'workshop', title: 'Workshops & Gemeinschaft', text: 'Atmen, bewegen, teilen – und unser Bienenstock Frauen-Netzwerk.' },
  { kind: 'schulung', title: 'Schulungen', text: 'Lerne Waxing mit Honigwachs von Anna.' },
] as const;

export default function CoursesPage() {
  const coaching = servicesOf('coaching');
  return (
    <>
      <section className="honey-glow on-dark text-cream-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-14 md:grid-cols-[1.2fr_0.8fr] md:items-end md:px-10 md:pb-24 md:pt-24">
          <div>
            <Eyebrow>Kurse & Coaching</Eyebrow>
            <h1 className="mt-5 text-6xl md:text-8xl">
              Bewegen, atmen, <em>verbinden</em>.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-cream-100/85">Die Honigseele ist auch ein Ort der Gemeinschaft. Komm zum Yoga, zum Breathwork, zur Kakaozeremonie – oder nimm Dir Zeit für ein Coaching.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="#kursplan" variant="honey" size="lg">Zum Kursplan</ButtonLink>
              <ButtonLink href="#coaching" variant="light" size="lg">Coaching</ButtonLink>
            </div>
          </div>
          <Photo src="/images/stock/yoga.jpg" alt="Yoga in warmem Licht" className="aspect-[4/5] rounded-t-full md:max-h-[520px]" priority />
        </div>
      </section>

      <Section id="kursplan">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Kursplan</Eyebrow>
            <Title className="mt-4">Die nächsten *drei Wochen*</Title>
          </div>
          <Placeholder label="Termine & Preise: Demo-Werte" />
        </div>
        <CoursePlan initialCourses={courses} />
        <p className="mt-6 text-sm text-muted">
          Yoga mit 5er- oder 10er-Karte günstiger – <Link className="underline" href="/shop/#karten">zu den Karten</Link>. Später auch über Urban Sports Club und Eversports buchbar.
        </p>
      </Section>

      <Section tone="cream2">
        <div className="grid gap-14 md:grid-cols-3">
          {groups.map((g, i) => (
            <Reveal key={g.kind} delay={i * 100}>
              <Numeral n={i + 1} />
              <h2 className="mt-4 text-4xl">{g.title}</h2>
              <p className="mt-3 text-muted">{g.text}</p>
              <ul className="mt-6 border-t border-line">
                {courses
                  .filter((c) => c.kind === g.kind)
                  .map((c) => (
                    <li key={c.id} className="border-b border-line-soft py-4">
                      <p className="font-serif text-2xl">{c.name}</p>
                      <p className="text-sm text-muted">
                        mit {c.leaderName} · {formatDuration(c.durationMin)} · {formatEuro(c.priceCents)}
                      </p>
                    </li>
                  ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="coaching">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <Photo src="/images/stock/coaching.jpg" alt="Notizbuch und Tee" className="aspect-[4/3] rounded-[2rem]" />
          <div>
            <Eyebrow>Honigseelengeflüster</Eyebrow>
            <Title className="mt-4">Coaching & *Ernährung*</Title>
            <p className="mt-5 text-muted">Mit Asita im Coaching, mit Larissa in der ganzheitlichen Ernährungsberatung. Einzeln, vertraulich, in Ruhe.</p>
            <ul className="mt-8 border-t border-line">
              {coaching.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 border-b border-line-soft py-4">
                  <span>
                    <span className="block font-serif text-2xl">{s.name}</span>
                    <span className="text-sm text-muted">{formatDuration(s.durationMin)}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-serif text-xl">{formatEuro(s.priceCents)}</span>
                    <ButtonLink href={`/buchen/?leistung=${s.id}`} size="sm" variant="ghost" data-label="Buchen">Buchen</ButtonLink>
                  </span>
                </li>
              ))}
            </ul>
            <Placeholder label="Preise & Dauer folgen" className="mt-4" />
          </div>
        </div>
      </Section>

      <Section tone="dark" className="text-center">
        <Eyebrow>Events</Eyebrow>
        <Title className="mx-auto mt-4 max-w-2xl">Lesungen, Märkte, *Abende* in der Honigseele.</Title>
        <p className="mx-auto mt-5 max-w-lg text-cream-100/80">Hier stehen bald unsere Events. Melde Dich zum Newsletter an, dann verpasst Du nichts.</p>
        <Placeholder label="Event-Inhalte folgen" className="mt-6" />
      </Section>
    </>
  );
}
