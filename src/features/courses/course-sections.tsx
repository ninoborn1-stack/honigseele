'use client';
// Abschnitte der Seite Kurse & Coaching (außer dem Kursplan).
import { Minus, Plus, Ticket } from 'lucide-react';
import { useState } from 'react';
import { Placeholder } from '@/components/ui/badge';
import { ArrowLink, ButtonLink } from '@/components/ui/button';
import { CountUp, Marquee, RevealHeading, RevealImage } from '@/components/ui/motion';
import { Reveal } from '@/components/ui/reveal';
import { Eyebrow } from '@/components/ui/typography';
import { addDaysToDate, berlinDate, berlinToISO } from '@/domain/time';
import type { Course, Product, Service } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatDuration, formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';

/** Drei Kennzahlen unter dem Kopf – aus den Daten berechnet */
export function CourseStats({ courses }: { courses: Course[] }) {
  const today = berlinDate(new Date());
  const { data: sessions = [] } = useData(
    (db) => db.listSessions({ from: new Date().toISOString(), to: berlinToISO(addDaysToDate(today, 7), '23:59') }),
    [today],
  );
  const formats = new Set(courses.map((c) => c.kind)).size;
  const groupCaps = courses.filter((c) => c.kind === 'yoga').map((c) => c.capacity);
  const maxGroup = groupCaps.length ? Math.max(...groupCaps) : Math.max(...courses.map((c) => c.capacity));
  const stats = [
    { value: sessions.length, label: 'Termine in den nächsten 7 Tagen' },
    { value: formats, label: 'Formate – von Yoga bis Coaching' },
    { value: maxGroup, label: 'Plätze höchstens pro Yoga-Gruppe' },
  ];
  return (
    <dl className="grid gap-8 border-t border-cream-50/20 pt-8 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label}>
          <dt className="sr-only">{s.label}</dt>
          <dd>
            <CountUp to={s.value} className="font-serif text-[clamp(3rem,5vw,5rem)] leading-none text-honey-300" />
            <p className="mt-2 max-w-[16rem] text-sm text-cream-100/80">{s.label}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}

const FORMATS = [
  { kind: 'yoga', title: 'Yoga', text: 'Für alle Level, in kleinen Gruppen. Auch in der Schwangerschaft und danach.', image: '/images/stock/yoga.jpg' },
  { kind: 'workshop', title: 'Workshops & Gemeinschaft', text: 'Atmen, bewegen, teilen – Breathwork, Kakaozeremonie, gemeinsame Spaziergänge und unser Frauen-Netzwerk.', image: '/images/stock/plants.jpg' },
  { kind: 'schulung', title: 'Schulungen', text: 'Lerne Waxing mit Honigwachs von Anna – in kleiner Runde, mit viel Praxis.', image: '/images/stock/waxing.jpg' },
] as const;

/** Formate als großes Akkordeon: Klick öffnet, eins ist immer offen */
export function Formats({ courses }: { courses: Course[] }) {
  const [open, setOpen] = useState(0);
  return (
    <ol className="border-t border-honey-950/20">
      {FORMATS.map((f, i) => {
        const list = courses.filter((c) => c.kind === f.kind);
        const isOpen = open === i;
        return (
          <li key={f.kind} className="border-b border-honey-950/20">
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              aria-controls={`format-${f.kind}`}
              className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-5 py-8 text-left md:gap-12 md:py-10"
            >
              <span className="font-serif text-[clamp(2.4rem,5vw,5rem)] leading-none text-honey-400">{String(i + 1).padStart(2, '0')}</span>
              <span>
                <span className={cn('block font-serif text-[clamp(2.2rem,5vw,5.2rem)] leading-[0.95] transition-colors duration-500', isOpen ? 'text-honey-950' : 'text-honey-950/70 group-hover:text-honey-950')}>
                  {f.title}
                </span>
                <span className="mt-2 block text-sm uppercase tracking-[0.18em] text-muted">
                  {list.length} {list.length === 1 ? 'Angebot' : 'Angebote'}
                </span>
              </span>
              <span className={cn('grid h-14 w-14 place-items-center rounded-full border transition-all duration-500', isOpen ? 'border-honey-950 bg-honey-950 text-cream-50' : 'border-honey-950/25 group-hover:border-honey-950')}>
                {isOpen ? <Minus className="h-5 w-5" strokeWidth={1.5} /> : <Plus className="h-5 w-5" strokeWidth={1.5} />}
              </span>
            </button>
            <div id={`format-${f.kind}`} className={cn('grid transition-[grid-template-rows] duration-700 ease-[var(--ease-soft)]', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <div className="grid gap-10 pb-14 md:grid-cols-[0.8fr_1.4fr] md:gap-16 md:pl-[calc(clamp(2.4rem,5vw,5rem)+3rem)]">
                  <div>
                    {isOpen && <RevealImage src={f.image} alt={f.title} className="aspect-square max-w-sm rounded-full" />}
                  </div>
                  <div>
                    <p className="max-w-xl text-lg text-muted">{f.text}</p>
                    <ul className="mt-8 border-t border-line">
                      {list.map((c) => (
                        <li key={c.id} className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-line-soft py-5">
                          <span>
                            <span className="block font-serif text-[clamp(1.5rem,2.2vw,2.1rem)] leading-tight">{c.name}</span>
                            <span className="mt-1 block text-sm text-muted">
                              mit {c.leaderName} · {formatDuration(c.durationMin)} · bis {c.capacity} Personen
                            </span>
                          </span>
                          <span className="font-serif text-2xl">{formatEuro(c.priceCents)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 flex flex-wrap items-center gap-6">
                      <ButtonLink href="#kursplan" arrow data-no-curtain>
                        Termine ansehen
                      </ButtonLink>
                      {list.some((c) => c.isPlaceholder) && <Placeholder label="Termine & Preise: Demo-Werte" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Bienenstock Frauen-Netzwerk als besonderer Teaser */
export function Beehive({ course }: { course?: Course }) {
  if (!course) return null;
  return (
    <section className="honey-light overflow-hidden py-28 md:py-40">
      <div className="wrap grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:items-end">
        <div>
          <Eyebrow>Gemeinschaft</Eyebrow>
          <RevealHeading
            as="h2"
            text="Frauen, die sich *gegenseitig* stärken."
            className="mt-8 text-[clamp(3rem,8vw,9rem)] leading-[0.92] tracking-[-0.025em]"
          />
        </div>
        <Reveal delay={200} className="lg:pb-4">
          <p className="font-serif text-4xl italic text-amber-600">{course.name}</p>
          <p className="mt-5 text-lg text-muted">{course.description}</p>
          <p className="mt-4 text-sm uppercase tracking-[0.16em] text-muted">
            mit {course.leaderName} · {formatDuration(course.durationMin)} · {formatEuro(course.priceCents)}
          </p>
          <ArrowLink href="#kursplan" className="mt-8" data-no-curtain>
            Zum nächsten Abend
          </ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}

/** Coaching: dunkler Split mit Bild und buchbarer Liste */
export function Coaching({ services }: { services: Service[] }) {
  return (
    <section id="coaching" className="honey-glow on-dark text-cream-50">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[55svh] lg:min-h-full">
          <RevealImage src="/images/stock/coaching.jpg" alt="Notizbuch und Tee" className="!absolute inset-0 !bg-honey-900" />
        </div>
        <div className="px-[clamp(1.25rem,3.5vw,4rem)] py-24 md:py-36 lg:pl-20">
          <Eyebrow>Honigseelengeflüster</Eyebrow>
          <RevealHeading as="h2" text="Coaching & *Ernährung*" className="mt-6 text-[clamp(2.5rem,5.6vw,6.2rem)] leading-[0.98]" />
          <p className="mt-8 max-w-lg text-lg text-cream-100/80">Mit Asita im Coaching, mit Larissa in der ganzheitlichen Ernährungsberatung. Einzeln, vertraulich, in Ruhe.</p>
          <ul className="mt-12 border-t border-cream-50/15">
            {services.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-cream-50/15 py-6">
                <span>
                  <span className="block font-serif text-[clamp(1.6rem,2.4vw,2.4rem)] leading-tight">{s.name}</span>
                  <span className="text-sm text-cream-100/70">{formatDuration(s.durationMin)}</span>
                </span>
                <span className="flex items-center gap-5">
                  <span className="font-serif text-3xl text-honey-300">{formatEuro(s.priceCents)}</span>
                  <ButtonLink href={`/buchen/?leistung=${s.id}`} variant="light" size="sm" arrow data-label="Buchen">
                    Buchen
                  </ButtonLink>
                </span>
              </li>
            ))}
          </ul>
          {services.some((s) => s.isPlaceholder) && <Placeholder label="Preise & Dauer folgen" className="mt-6" />}
        </div>
      </div>
    </section>
  );
}

/** 5er- und 10er-Karten */
export function PunchCards({ cards }: { cards: Product[] }) {
  const { data: products = cards } = useData((db) => db.listProducts().then((all) => all.filter((p) => p.kind === 'karte' && p.active)), [], cards);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
      <div>
        <Eyebrow>Öfter dabei?</Eyebrow>
        <RevealHeading as="h2" text="Mit Karte *günstiger*." className="mt-6 text-[clamp(2.4rem,4.5vw,4.6rem)] leading-[1]" />
        <p className="mt-6 max-w-md text-lg text-muted">Mit einer 5er- oder 10er-Karte buchst Du Yoga-Stunden mit einem Tipp – die Karte liegt in Deinem Konto.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={i * 120}>
            <div className={cn('flex min-h-64 flex-col justify-between rounded-[2rem] p-8', i % 2 ? 'honey-glow on-dark text-cream-50' : 'border border-line bg-card')}>
              <Ticket className={cn('h-6 w-6', i % 2 ? 'text-honey-300' : 'text-amber-800')} strokeWidth={1.5} />
              <div>
                <p className="font-serif text-4xl leading-tight">{p.name}</p>
                <p className={cn('mt-2 text-sm', i % 2 ? 'text-cream-100/75' : 'text-muted')}>{p.description}</p>
                <p className={cn('mt-6 flex flex-wrap items-center gap-3 font-serif text-5xl', i % 2 ? 'text-honey-300' : '')}>
                  {formatEuro(p.priceCents)}
                  {p.isPlaceholder && <Placeholder label="Platzhalter" />}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
        <ArrowLink href="/shop/#karten" className="sm:col-span-2">
          Karte im Shop kaufen
        </ArrowLink>
      </div>
    </div>
  );
}

export function EventsBand() {
  return (
    <section className="overflow-hidden bg-cream-50 py-24 md:py-32">
      <div className="border-y border-line py-6 md:py-8" aria-hidden>
        <Marquee
          speed={50}
          items={['Lesungen', 'Märkte', 'Abende', 'Kakaozeremonie', 'Vollmond-Yoga', 'Netzwerken'].map((t, i) => (
            <span key={t} className={cn('whitespace-nowrap font-serif text-[clamp(2.4rem,6vw,5.6rem)] leading-none', i % 2 ? 'italic text-amber-600' : 'text-honey-950')}>
              {t}
            </span>
          ))}
        />
      </div>
      <div className="wrap mt-16 flex flex-col items-center text-center">
        <Eyebrow>Events</Eyebrow>
        <RevealHeading as="h2" text="Bald in der *Honigseele*." className="mt-6 text-[clamp(2.4rem,5vw,5.2rem)] leading-[1]" />
        <p className="mx-auto mt-6 max-w-lg text-lg text-muted">Hier stehen bald unsere Events. Melde Dich zum Newsletter an, dann verpasst Du nichts.</p>
        <Placeholder label="Event-Inhalte folgen" className="mt-6" />
      </div>
    </section>
  );
}
