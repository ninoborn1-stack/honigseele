'use client';
import { ArrowUpRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NewsletterForm } from '@/components/layout/footer';
import { Avatar } from '@/components/ui/avatar';
import { Placeholder } from '@/components/ui/badge';
import { Bloom } from '@/components/ui/bloom';
import { ArrowLink, ButtonLink } from '@/components/ui/button';
import { CountUp, Marquee, RevealHeading, RevealImage } from '@/components/ui/motion';
import { BigNumeral, Panel } from '@/components/ui/panel';
import { Photo } from '@/components/ui/photo';
import { Reveal } from '@/components/ui/reveal';
import { Eyebrow, Title } from '@/components/ui/typography';
import { block, courses, packages, servicesOf, site, staff, treatmentCategories } from '@/content';
import { formatDateShort } from '@/domain/time';
import { cn } from '@/lib/cn';
import { berlinTime, formatDuration, formatEuro } from '@/lib/format';
import { useBlock, useData } from '@/lib/use-data';

/** Willkommen: mittig, kompakt */
export function Intro() {
  const title = useBlock('home.intro.title', block('home.intro.title'));
  const text = useBlock('home.intro.text', block('home.intro.text'));
  return (
    <section className="bg-cream-50 py-20 md:py-28">
      <div className="wrap flex flex-col items-center text-center">
        <Eyebrow>Willkommen in der Honigseele</Eyebrow>
        <RevealHeading
          as="h2"
          text={title.replace('Waxing und Beauty', '*Waxing und Beauty*')}
          className="mt-7 max-w-[24ch] text-[clamp(1.9rem,3.4vw,3.4rem)] leading-[1.12] tracking-[-0.01em]"
        />
        <Reveal delay={200}>
          <p className="mx-auto mt-7 max-w-xl leading-relaxed text-muted md:text-lg">{text}</p>
        </Reveal>
        <Reveal delay={350} className="mt-9 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          <ButtonLink href="/buchen/" size="lg" arrow data-label="Buchen">
            Termin buchen
          </ButtonLink>
          <ArrowLink href="/ueber-uns/">Wer wir sind</ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}

/** Dezentes Laufband: kleine Versalien, viel Luft */
export function AreaMarquee() {
  const names = treatmentCategories.filter((c) => !c.isPlaceholder).map((c) => c.name);
  return (
    <div className="border-y border-line-soft bg-cream-50 py-4 text-muted" aria-hidden>
      <Marquee
        speed={70}
        items={[...names, 'Yoga', 'Coaching', 'Naturkosmetik'].map((n) => (
          <span key={n} className="whitespace-nowrap px-6 text-[0.72rem] font-medium uppercase tracking-[0.32em]">
            {n}
          </span>
        ))}
      />
    </div>
  );
}

/** Was Dir guttut: schmale Bildstreifen, der aktive öffnet sich (Klick, Fokus oder Hover). Mobil: schlichte Zeilen. */
export function Areas() {
  const list = treatmentCategories.filter((c) => !c.isPlaceholder);
  const [active, setActive] = useState(0);
  const minPrice = (id: string) => Math.min(...servicesOf(id).filter((s) => s.priceCents > 0).map((s) => s.priceCents));
  return (
    <section id="bereiche" className="bg-cream-50 py-24 md:py-36">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Eyebrow>Behandlungen</Eyebrow>
            <Title className="mt-6">Was Dir *guttut*.</Title>
          </div>
          <div className="flex flex-col gap-6 md:items-end md:text-right">
            <p className="max-w-sm text-muted">Sechs Bereiche, über 120 Behandlungen – alle mit unserer eigenen Naturkosmetik.</p>
            <ArrowLink href="/behandlungen/">Alle Behandlungen</ArrowLink>
          </div>
        </div>

        {/* Desktop: Streifen */}
        <div className="mt-14 hidden h-[min(72svh,720px)] gap-3 md:flex">
          {list.map((c, i) => {
            const on = i === active;
            return (
              <div
                key={c.id}
                onMouseEnter={() => setActive(i)}
                className={cn('relative min-w-0 overflow-hidden rounded-[1.75rem] transition-[flex-grow] duration-[900ms] ease-[var(--ease-soft)]', on ? 'grow-[5]' : 'grow')}
                style={{ flexBasis: 0 }}
              >
                <Photo src={c.image} alt="" className="!absolute inset-0" imgClassName={cn('transition-transform duration-[1.4s] ease-[var(--ease-soft)]', on ? 'scale-100' : 'scale-110')} />
                <div aria-hidden className={cn('absolute inset-0 transition-opacity duration-700', on ? 'bg-[linear-gradient(0deg,rgb(28_21_15/0.88),rgb(28_21_15/0.15)_60%,transparent)]' : 'bg-honey-950/55')} />
                {/* geschlossen: Nummer + Name senkrecht */}
                <button
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  aria-expanded={on}
                  aria-label={c.name}
                  className={cn('absolute inset-0 flex flex-col items-center justify-between py-8 text-cream-50 transition-opacity duration-500', on ? 'pointer-events-none opacity-0' : 'opacity-100')}
                >
                  <span className="font-serif text-xl text-honey-300">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-serif text-2xl whitespace-nowrap [writing-mode:vertical-rl] rotate-180">{c.name}</span>
                </button>
                {/* offen: Inhalt */}
                <div className={cn('absolute inset-x-0 bottom-0 p-8 text-cream-50 transition-all duration-700 lg:p-10', on ? 'translate-y-0 opacity-100 delay-300' : 'pointer-events-none translate-y-6 opacity-0')}>
                  <div className="flex items-baseline gap-4 text-xs font-medium uppercase tracking-[0.2em] text-honey-300">
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <span className="h-px w-8 bg-honey-300/60" />
                    <span>ab {formatEuro(minPrice(c.id))}</span>
                  </div>
                  <h3 className="mt-4 font-serif text-[clamp(2.4rem,3.6vw,4rem)] leading-[0.95] whitespace-nowrap">{c.name}</h3>
                  <p className="mt-3 max-w-sm text-cream-100/85">{c.teaser}</p>
                  <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">
                    <ButtonLink href={`/behandlungen/${c.id}/`} variant="honey" arrow data-label={c.name} tabIndex={on ? 0 : -1}>
                      Ansehen
                    </ButtonLink>
                    <ArrowLink href={`/buchen/?kategorie=${c.id}`} light data-label="Buchen" tabIndex={on ? 0 : -1}>
                      Buchen
                    </ArrowLink>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobil: schlichte Zeilen */}
        <ul className="mt-12 border-t border-honey-950/15 md:hidden">
          {list.map((c, i) => (
            <li key={c.id} className="border-b border-honey-950/15">
              <Link href={`/behandlungen/${c.id}/`} data-label={c.name} className="flex items-center gap-5 py-5">
                <Photo src={c.image} alt="" className="h-16 w-16 shrink-0 rounded-full" />
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-2xl leading-tight">{c.name}</span>
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-amber-800">
                    {String(i + 1).padStart(2, '0')} · ab {formatEuro(minPrice(c.id))}
                  </span>
                </span>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-amber-800" strokeWidth={1.5} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Wohlfühl-Pakete nur als Teaser – Details stehen auf der Paket-Seite */
export function Packages() {
  const featured = ['paket-deine-kleine-auszeit', 'paket-dein-wohlfuehltag-in-der-honigseele', 'paket-von-kopf-bis-fuss-auf-liebe-eingestellt-paare']
    .map((id) => packages.find((p) => p.id === id))
    .filter((p): p is (typeof packages)[number] => Boolean(p));
  const min = Math.min(...packages.map((p) => p.priceCents));
  return (
    <Panel dark>
      <div className="grid md:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col justify-between gap-12 p-8 sm:p-12 lg:px-16 lg:py-20">
          <div>
            <div className="flex items-baseline justify-between gap-6">
              <Eyebrow>Wohlfühl-Pakete</Eyebrow>
              <span className="text-right text-xs font-medium uppercase tracking-[0.2em] text-cream-100/70">
                {packages.length} Pakete · ab {formatEuro(min)}
              </span>
            </div>
            <Title className="mt-8">Ein paar Stunden, die *nur Dir* gehören.</Title>
            <p className="mt-6 max-w-md text-lg text-cream-100/80">Allein, zu zweit, mit Mama, als Braut oder für die Kleinen. Ein Willkommensgetränk wartet immer.</p>
          </div>
          <div>
            <ul className="border-t border-cream-50/15">
              {featured.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-6 border-b border-cream-50/10 py-4">
                  <span>
                    <span className="block font-serif text-2xl">{p.name}</span>
                    <span className="text-sm text-cream-100/60">{formatDuration(p.durationMin)}</span>
                  </span>
                  <span className="font-serif text-2xl whitespace-nowrap text-honey-300">{formatEuro(p.priceCents)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <ButtonLink href="/behandlungen/wohlfuehl-pakete/" variant="honey" size="lg" arrow data-label="Wohlfühl-Pakete">
                Alle Pakete ansehen
              </ButtonLink>
              <ArrowLink href="/buchen/?kategorie=wohlfuehl-pakete" light data-label="Buchen">
                Direkt buchen
              </ArrowLink>
            </div>
          </div>
        </div>
        <div className="relative min-h-[46vh] md:min-h-0">
          <RevealImage src="/images/stock/package.jpg" alt="Handtuch, Kerze und Pflege" className="!absolute inset-0 md:inset-6 md:rounded-[2rem] lg:inset-8 lg:rounded-t-[3rem]" />
        </div>
      </div>
    </Panel>
  );
}

/** Bewertungen: ruhig, mittig, ein Zitat nach dem anderen */
export function Trust() {
  const [i, setI] = useState(0);
  const reviews = site.reviews;
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % reviews.length), 7000);
    return () => clearInterval(t);
  }, [reviews.length]);
  const r = reviews[i];
  return (
    <section className="bg-cream-50 py-28 md:py-44">
      <div className="wrap flex flex-col items-center text-center">
        <Eyebrow className="justify-center">Was andere sagen</Eyebrow>
        <div className="mt-10 flex items-center gap-5">
          <CountUp to={site.brand.rating.value} decimals={1} className="font-serif text-7xl leading-none md:text-8xl" />
          <span className="text-left">
            <span className="flex gap-0.5 text-amber-600">
              {[0, 1, 2, 3, 4].map((k) => (
                <Star key={k} className="h-4 w-4 fill-current" strokeWidth={1} />
              ))}
            </span>
            <span className="mt-1 block text-sm text-muted">
              ca. {site.brand.rating.count.toLocaleString('de-DE')} Bewertungen · {site.brand.rating.source}
            </span>
          </span>
        </div>
        <figure key={i} className="mt-16 max-w-4xl animate-fade">
          <blockquote className="font-serif text-[clamp(1.8rem,3.4vw,3.4rem)] italic leading-[1.2]">„{r.text}“</blockquote>
          <figcaption className="mt-6 text-xs font-medium uppercase tracking-[0.22em] text-muted">
            {r.name} {r.placeholder && <Placeholder label="Beispiel" />}
          </figcaption>
        </figure>
        <div className="mt-12 flex items-center gap-4">
          <button onClick={() => setI((i - 1 + reviews.length) % reviews.length)} aria-label="Vorherige Bewertung" className="grid h-11 w-11 place-items-center rounded-full border border-honey-950/20 transition-colors hover:border-honey-950">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <div className="flex gap-2">
            {reviews.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Bewertung ${k + 1}`} className="grid h-11 w-6 place-items-center">
                <span className={cn('h-1.5 rounded-full transition-all duration-500', k === i ? 'w-6 bg-honey-950' : 'w-1.5 bg-honey-950/25')} />
              </button>
            ))}
          </div>
          <button onClick={() => setI((i + 1) % reviews.length)} aria-label="Nächste Bewertung" className="grid h-11 w-11 place-items-center rounded-full border border-honey-950/20 transition-colors hover:border-honey-950">
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}

/** Eigene Pflegeserie als helles Panel */
export function Manufaktur() {
  const title = useBlock('home.products.title', block('home.products.title'));
  const text = useBlock('home.products.text', block('home.products.text'));
  return (
    <Panel>
      <div className="grid md:grid-cols-[1fr_1.05fr]">
        <div className="relative order-2 min-h-[46vh] md:order-1 md:min-h-0">
          <RevealImage src="/images/stock/products.jpg" alt="Naturkosmetik in Glasflaschen" className="!absolute inset-0 md:inset-6 md:rounded-[2rem] lg:inset-8 lg:rounded-t-[3rem]" />
        </div>
        <div className="order-1 flex flex-col justify-between gap-12 p-8 sm:p-12 md:order-2 lg:px-16 lg:py-20">
          <div>
            <div className="flex items-baseline justify-between gap-6">
              <BigNumeral n={12} className="text-[clamp(3rem,7vw,7rem)]" />
              <span className="text-right text-xs font-medium uppercase tracking-[0.2em] text-amber-800">
                Produkte
                <br />
                handgemacht in Berlin
              </span>
            </div>
            <Eyebrow className="mt-8">Die Crememanufaktur</Eyebrow>
            <RevealHeading as="h2" text={title.replace('handgemacht', '*handgemacht*')} className="mt-5 text-[clamp(2.2rem,4vw,4.2rem)] leading-[1.02]" />
            <p className="mt-6 max-w-md text-lg text-muted">{text}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <ButtonLink href="/shop/" size="lg" arrow data-label="Shop">
              Zur Pflegeserie
            </ButtonLink>
            <ArrowLink href="/shop/gutscheine/">Gutschein verschenken</ArrowLink>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/** Team: Avatare überlappend, mittig, ruhig */
export function TeamTeaser() {
  const shown = staff.filter((s) => s.visible);
  return (
    <section className="bg-cream-50 py-28 md:py-44">
      <div className="wrap flex flex-col items-center text-center">
        <Eyebrow className="justify-center">Unser Team</Eyebrow>
        <Title className="mt-7 max-w-[16ch]">Die Hände hinter der *Honigseele*.</Title>
        <Reveal delay={150}>
          <ul className="mt-12 flex justify-center" aria-label={`${shown.length} Honigseelen`}>
            {shown.map((s, i) => (
              <li key={s.id} className={cn('-ml-3.5 first:ml-0', i >= 6 && 'hidden md:block')} style={{ zIndex: shown.length - i }}>
                <Avatar name={s.name} tone={s.avatarTone} className="!h-14 !w-14 text-lg ring-4 ring-cream-50 lg:!h-16 lg:!w-16 lg:text-xl" />
                <span className="sr-only">{s.name}</span>
              </li>
            ))}
            <li className="-ml-3.5 md:hidden" aria-hidden>
              <span className="grid h-14 w-14 place-items-center rounded-full bg-honey-950 text-sm font-medium text-cream-50 ring-4 ring-cream-50">+{shown.length - 6}</span>
            </li>
          </ul>
        </Reveal>
        <Reveal delay={250}>
          <p className="mx-auto mt-10 max-w-lg text-muted md:text-lg">
            Depiladoras, Kosmetikerinnen, Masseurinnen, eine Podologin, Coaches und Yogalehrerinnen – jede mit ihrer eigenen Gabe und mit Zeit für Dich.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            <ArrowLink href="/ueber-uns/#team">Lerne uns kennen</ArrowLink>
          </div>
          <p className="mt-6">
            <Placeholder label="Teamfotos folgen" />
          </p>
        </Reveal>
      </div>
    </section>
  );
}

const formats = [
  { title: 'Yoga', text: 'Mit Kati und Maria – auch pränatal und postnatal.', kinds: ['yoga'] },
  { title: 'Gemeinschaft', text: 'Breathwork, Kakaozeremonie und das Bienenstock Frauen-Netzwerk.', kinds: ['workshop'] },
  { title: 'Coaching', text: 'Seelengeflüster, Stress-Coaching und Ernährungsberatung.', kinds: [] },
];

export function CoursePreview() {
  const { data: sessions } = useData((db) => db.listSessions({ from: new Date().toISOString() }), []);
  const next = (sessions ?? []).find((s) => s.booked < s.capacity);
  const nextCourse = courses.find((c) => c.id === next?.courseId);
  return (
    <section className="bg-cream-50 pb-6">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[60svh] lg:min-h-full">
          <RevealImage src="/images/stock/yoga.jpg" alt="Yoga in warmem Licht" className="!absolute inset-0" />
        </div>
        <div className="flex flex-col justify-center px-[clamp(1.25rem,3.5vw,4rem)] py-24 md:py-36 lg:pl-24">
          <Eyebrow>Kurse & Coaching</Eyebrow>
          <Title className="mt-7">Bewegen, atmen, *verbinden*.</Title>
          <ol className="mt-14">
            {formats.map((f, i) => (
              <Reveal as="li" key={f.title} delay={i * 110} className="grid grid-cols-[auto_1fr] gap-x-7 border-t border-honey-950/15 py-7 last:border-b">
                <BigNumeral n={i + 1} className="text-5xl" />
                <div>
                  <p className="font-serif text-3xl leading-none">{f.title}</p>
                  <p className="mt-2 text-muted">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          {next && nextCourse && (
            <Link href={`/kurse/#${next.id}`} className="mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-cream-100 py-2 pl-2 pr-5 text-sm transition-colors hover:bg-honey-200/60">
              <span className="rounded-full bg-honey-950 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-cream-50">Nächster Termin</span>
              {nextCourse.name} · {formatDateShort(next.start)}, {berlinTime(next.start)}
            </Link>
          )}
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            <ButtonLink href="/kurse/" size="lg" arrow data-label="Kurse & Coaching">
              Zum Kursplan
            </ButtonLink>
            <ArrowLink href="/kurse/#coaching">Coaching</ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Newsletter: Blüten aus dem Hero ziehen sanft vorbei – gefüllt und als Linie im Wechsel */
export function NewsletterSection() {
  return (
    <section id="newsletter" className="honey-glow on-dark relative mt-6 overflow-hidden py-28 text-cream-50 md:py-40">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-honey-300 opacity-[0.09]" aria-hidden>
        <Marquee
          speed={90}
          items={Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="px-[3vw]">
              <Bloom outline={i % 2 === 1} className={cn('h-[30vw] w-[30vw] md:h-[22vw] md:w-[22vw]', i % 2 ? 'rotate-12' : '-rotate-6')} />
            </span>
          ))}
          dots={false}
        />
      </div>
      <div className="wrap relative flex flex-col items-center text-center">
        <Eyebrow className="justify-center">Newsletter</Eyebrow>
        <Title className="mt-6 max-w-[14ch]">Bleib mit uns in *Verbindung*.</Title>
        <p className="mx-auto mt-8 max-w-md text-lg text-cream-100/85">Neue Kurse, Pflege-Tipps und kleine Überraschungen – etwa einmal im Monat. Abmelden jederzeit.</p>
        <div className="mt-12 w-full max-w-lg">
          <NewsletterForm dark />
        </div>
      </div>
    </section>
  );
}
