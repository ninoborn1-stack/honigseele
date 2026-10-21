import type { Metadata } from 'next';
import { Placeholder } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Parallax, RevealHeading } from '@/components/ui/motion';
import { Photo } from '@/components/ui/photo';
import { Eyebrow, Section, Title } from '@/components/ui/typography';
import { courses, products, servicesOf } from '@/content';
import { CoursePlan } from '@/features/courses/course-plan';
import { Beehive, Coaching, CourseStats, EventsBand, Formats, PunchCards } from '@/features/courses/course-sections';

export const metadata: Metadata = {
  title: 'Kurse, Yoga & Coaching',
  description: 'Yoga mit Kati und Maria, Pränatal & Postnatal Yoga, Breathwork, Kakaozeremonie, Bienenstock Frauen-Netzwerk und Coaching in Berlin-Kreuzberg.',
};

export default function CoursesPage() {
  return (
    <>
      {/* Vollbild-Kopf */}
      <section className="on-dark relative isolate flex min-h-[calc(100svh-var(--top-h,96px))] flex-col justify-end overflow-hidden bg-honey-950 text-cream-50">
        <div className="absolute inset-0 -z-10">
          <Parallax speed={0.15} className="absolute -inset-y-[12%] inset-x-0">
            <Photo src="/images/stock/yoga.jpg" alt="" className="h-full w-full" priority />
          </Parallax>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(28_21_15/0.92)_0%,rgb(28_21_15/0.55)_45%,rgb(28_21_15/0.35)_100%)]" />
        </div>
        <div className="wrap pb-12 pt-24 md:pb-16">
          <Eyebrow>Kurse & Coaching</Eyebrow>
          <RevealHeading as="h1" text="Bewegen, atmen, *verbinden*." className="mt-8 max-w-[12ch] text-[clamp(3.4rem,9vw,10rem)] leading-[0.92] tracking-[-0.025em]" />
          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-xl text-lg text-cream-100/85 md:text-xl">Die Honigseele ist auch ein Ort der Gemeinschaft. Komm zum Yoga, zum Breathwork, zur Kakaozeremonie – oder nimm Dir Zeit für ein Coaching.</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="#kursplan" variant="honey" size="lg" arrow data-no-curtain>
                Zum Kursplan
              </ButtonLink>
              <ButtonLink href="#coaching" variant="light" size="lg" data-no-curtain>
                Coaching
              </ButtonLink>
            </div>
          </div>
          <div className="mt-14">
            <CourseStats courses={courses} />
          </div>
        </div>
      </section>

      {/* Kursplan */}
      <Section id="kursplan" className="scroll-mt-[var(--top-h,96px)]">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Kursplan</Eyebrow>
            <Title className="mt-6">Die nächsten *drei Wochen*</Title>
          </div>
          <Placeholder label="Termine & Preise: Demo-Werte" />
        </div>
        <CoursePlan initialCourses={courses} />
        <p className="mt-8 text-sm text-muted">Tippe auf einen Termin, um Deinen Platz zu buchen. Später auch über Urban Sports Club und Eversports buchbar.</p>
      </Section>

      {/* Formate */}
      <Section tone="cream2">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Formate</Eyebrow>
            <Title className="mt-6">Finde, was Dich *bewegt*.</Title>
          </div>
          <p className="max-w-sm text-lg text-muted">Drei Wege, Zeit mit Dir und anderen zu verbringen.</p>
        </div>
        <Formats courses={courses} />
      </Section>

      <Beehive course={courses.find((c) => c.id === 'bienenstock')} />

      <Coaching services={servicesOf('coaching')} />

      <Section>
        <PunchCards cards={products.filter((p) => p.kind === 'karte' && p.active)} />
      </Section>

      <EventsBand />
    </>
  );
}
