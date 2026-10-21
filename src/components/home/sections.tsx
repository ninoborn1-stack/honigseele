'use client';
import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { NewsletterForm } from '@/components/layout/footer';
import { Avatar } from '@/components/ui/avatar';
import { Placeholder } from '@/components/ui/badge';
import { ArrowLink, ButtonLink } from '@/components/ui/button';
import { CountUp, Marquee, Parallax, RevealHeading, RevealImage, useInView } from '@/components/ui/motion';
import { Photo } from '@/components/ui/photo';
import { Reveal } from '@/components/ui/reveal';
import { Eyebrow, Section, Title } from '@/components/ui/typography';
import { block, courses, packages, site, staff, treatmentCategories } from '@/content';
import { formatDateShort } from '@/domain/time';
import { cn } from '@/lib/cn';
import { berlinTime, formatDuration, formatEuro } from '@/lib/format';
import { useBlock, useData } from '@/lib/use-data';

/** Willkommen: mittig, groß, ruhig */
export function Intro() {
  const title = useBlock('home.intro.title', block('home.intro.title'));
  const text = useBlock('home.intro.text', block('home.intro.text'));
  return (
    <section className="bg-cream-50 pb-24 pt-28 md:pb-36 md:pt-40">
      <div className="wrap flex flex-col items-center text-center">
        <Eyebrow>Willkommen in der Honigseele</Eyebrow>
        <RevealHeading
          as="h2"
          text={title.replace('Waxing und Beauty', '*Waxing und Beauty*')}
          className="mt-10 max-w-[18ch] text-[clamp(2.4rem,5.4vw,5.8rem)] leading-[1.02] tracking-[-0.015em]"
        />
        <Reveal delay={200}>
          <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{text}</p>
        </Reveal>
        <Reveal delay={350} className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          <ButtonLink href="/buchen/" size="lg" arrow data-label="Buchen">
            Termin buchen
          </ButtonLink>
          <ArrowLink href="/ueber-uns/">Wer wir sind</ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}

/** Laufband mit den Bereichen */
export function AreaMarquee() {
  const names = treatmentCategories.filter((c) => !c.isPlaceholder).map((c) => c.name);
  return (
    <div className="border-y border-line bg-cream-50 py-6 md:py-8" aria-hidden>
      <Marquee
        speed={55}
        items={[...names, 'Yoga', 'Coaching', 'Naturkosmetik'].map((n, i) => (
          <span key={n} className={cn('whitespace-nowrap font-serif text-[clamp(2.2rem,5vw,4.6rem)] leading-none', i % 2 ? 'italic text-amber-600' : 'text-honey-950')}>
            {n}
          </span>
        ))}
      />
    </div>
  );
}

/** Bereiche als großer, redaktioneller Index mit mitlaufendem Bild */
export function Areas() {
  const [active, setActive] = useState(0);
  const list = treatmentCategories.filter((c) => !c.isPlaceholder);
  return (
    <Section tone="cream2" id="bereiche">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <Eyebrow>Behandlungen</Eyebrow>
          <Title className="mt-6">Was Dir *guttut*.</Title>
        </div>
        <ArrowLink href="/behandlungen/">Alle Behandlungen</ArrowLink>
      </div>
      <div className="mt-16 grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
        <ol className="border-t border-honey-950/20">
          {list.map((c, i) => (
            <li key={c.id} className="border-b border-honey-950/20">
              <Link
                href={`/behandlungen/${c.id}/`}
                data-label={c.name}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-5 py-7 md:gap-10 md:py-9"
              >
                <span className="font-serif text-lg text-amber-800 md:text-2xl">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 [hyphens:auto]" lang="de">
                  <span className="block font-serif text-[clamp(2rem,4.2vw,4.4rem)] leading-none transition-[color,transform] duration-500 ease-[var(--ease-soft)] group-hover:translate-x-3 group-hover:text-amber-600">
                    {c.name}
                  </span>
                  <span className="mt-3 block max-w-md text-sm text-muted md:text-base">{c.teaser}</span>
                </span>
                <span className="flex items-center gap-4">
                  <Photo src={c.image} alt="" className="h-20 w-16 rounded-full lg:hidden" />
                  <span className="hidden h-12 w-12 place-items-center rounded-full border border-honey-950/25 transition-all duration-500 group-hover:rotate-45 sm:grid group-hover:border-honey-950 group-hover:bg-honey-950 group-hover:text-cream-50">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="relative hidden lg:block">
          <div className="sticky top-[calc(var(--top-h,96px)+2rem)] aspect-[4/5] overflow-hidden rounded-t-full">
            {list.map((c, i) => (
              <Photo
                key={c.id}
                src={c.image}
                alt={c.name}
                className={cn('!absolute inset-0 transition-all duration-[1200ms] ease-[var(--ease-soft)]', i === active ? 'scale-100 opacity-100' : 'scale-110 opacity-0')}
              />
            ))}
            <p className="absolute inset-x-0 bottom-8 text-center font-serif text-3xl italic text-cream-50 [text-shadow:0_2px_20px_rgb(28_21_15/0.6)]">{list[active].eyebrow}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/** Wohlfühl-Pakete: Karussell mit Pfeilen, Fortschritt und Zähler. Kein Konflikt mit dem Seiten-Scroll. */
export function Packages() {
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [index, setIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const { ref, visible } = useInView<HTMLDivElement>();

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
      setAtEnd(el.scrollLeft >= max - 4);
      const card = el.querySelector<HTMLElement>('[data-card]');
      if (card) setIndex(Math.round(el.scrollLeft / (card.offsetWidth + 24)));
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      removeEventListener('resize', update);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector<HTMLElement>('[data-card]');
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: 'smooth' });
  };

  return (
    <section className="honey-glow on-dark overflow-hidden py-24 text-cream-50 md:py-36">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <Eyebrow>Wohlfühl-Pakete</Eyebrow>
            <Title className="mt-6">Ein paar Stunden, die *nur Dir* gehören.</Title>
          </div>
          <div className="flex flex-col gap-8 lg:items-end">
            <p className="max-w-md text-lg text-cream-100/80 lg:text-right">Allein, zu zweit, mit Mama, als Braut oder für die Kleinen. Ein Willkommensgetränk wartet immer.</p>
            <div className="flex items-center gap-3">
              <span className="mr-3 font-serif text-2xl tabular-nums text-cream-100/80">
                <span className="text-honey-300">{String(Math.min(index + 1, packages.length)).padStart(2, '0')}</span> / {String(packages.length).padStart(2, '0')}
              </span>
              <button onClick={() => go(-1)} disabled={progress <= 0.001} aria-label="Vorheriges Paket" className="grid h-14 w-14 place-items-center rounded-full border border-cream-50/30 transition-all duration-300 hover:border-honey-300 hover:bg-honey-300 hover:text-honey-950 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-cream-50">
                <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button onClick={() => go(1)} disabled={atEnd} aria-label="Nächstes Paket" className="grid h-14 w-14 place-items-center rounded-full border border-cream-50/30 transition-all duration-300 hover:border-honey-300 hover:bg-honey-300 hover:text-honey-950 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-cream-50">
                <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobil: Wischen. Desktop: nur Pfeile (overflow hidden), damit das Mausrad nie seitlich scrollt. */}
      <div ref={ref} className="mt-16">
        <div
          ref={track}
          className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-[clamp(1.25rem,3.5vw,4rem)] pb-2 md:snap-none md:overflow-x-hidden"
          data-lenis-prevent-wheel
        >
          {packages.map((p, i) => (
            <Link
              key={p.id}
              data-card
              href={`/buchen/?leistung=${p.id}`}
              data-label="Buchen"
              style={{ transitionDelay: `${Math.min(i, 4) * 90}ms` }}
              className={cn(
                'group relative flex min-h-[30rem] w-[82vw] max-w-[26rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[2rem] border border-cream-50/15 p-8 transition-[transform,opacity,border-color,background-color] duration-[900ms] ease-[var(--ease-soft)] hover:border-honey-300/60 hover:bg-cream-50/[0.04] md:w-[26rem]',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0',
              )}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-serif text-xl text-honey-300">{String(i + 1).padStart(2, '0')}</span>
                  <span className="rounded-full border border-cream-50/20 px-3 py-1 text-xs tracking-wide text-cream-100/80">{formatDuration(p.durationMin)}</span>
                </div>
                <h3 className="mt-10 font-serif text-4xl leading-[1.05]">{p.name}</h3>
                <p className="mt-3 font-serif text-xl italic text-cream-100/70">{p.tagline}</p>
                <ul className="mt-8 space-y-2.5 border-t border-cream-50/10 pt-6 text-sm text-cream-100/80">
                  {p.includes.slice(0, 4).map((x) => (
                    <li key={x} className="flex gap-3">
                      <span className="mt-2.5 h-px w-4 shrink-0 bg-honey-300/70" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 flex items-end justify-between">
                <span className="font-serif text-5xl text-honey-300">{formatEuro(p.priceCents)}</span>
                <span className="grid h-12 w-12 place-items-center rounded-full border border-cream-50/30 transition-all duration-500 group-hover:rotate-45 group-hover:border-honey-300 group-hover:bg-honey-300 group-hover:text-honey-950">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </div>
            </Link>
          ))}
          <div className="w-px shrink-0" aria-hidden />
        </div>
      </div>

      <div className="wrap mt-12">
        <div className="relative h-px w-full bg-cream-50/15">
          <div className="absolute inset-y-0 left-0 -top-px h-[3px] rounded-full bg-honey-300 transition-[width] duration-500 ease-[var(--ease-soft)]" style={{ width: `${Math.max(8, progress * 100)}%` }} />
        </div>
        <div className="mt-8 flex justify-end">
          <ArrowLink href="/behandlungen/wohlfuehl-pakete/" light>
            Alle {packages.length} Pakete
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}

export function Trust() {
  const productsTitle = useBlock('home.products.title', block('home.products.title'));
  const productsText = useBlock('home.products.text', block('home.products.text'));
  return (
    <Section tone="light">
      <div className="grid gap-20 lg:grid-cols-2 lg:gap-28">
        <div>
          <Eyebrow>Was andere sagen</Eyebrow>
          <div className="mt-10 flex flex-wrap items-end gap-x-8 gap-y-4">
            <CountUp to={site.brand.rating.value} decimals={1} className="font-serif text-[clamp(7rem,15vw,13rem)] leading-[0.78] tracking-[-0.04em]" />
            <div className="pb-3">
              <div className="flex gap-1 text-amber-600">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-current" strokeWidth={1} />
                ))}
              </div>
              <p className="mt-2 text-muted">
                aus ca. <CountUp to={site.brand.rating.count} className="font-medium text-honey-950" /> Bewertungen
                <br />
                auf {site.brand.rating.source}
              </p>
            </div>
          </div>
          <div className="mt-16 space-y-12">
            {site.reviews.map((r, i) => (
              <Reveal key={r.text} delay={i * 120}>
                <figure className="border-l-2 border-honey-400 pl-8">
                  <blockquote className="font-serif text-[clamp(1.6rem,2.4vw,2.3rem)] italic leading-snug">„{r.text}“</blockquote>
                  <figcaption className="mt-3 text-sm uppercase tracking-[0.16em] text-muted">
                    {r.name} {r.placeholder && <Placeholder label="Beispiel" />}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <Parallax speed={0.06}>
            <RevealImage src="/images/stock/products.jpg" alt="Naturkosmetik in Glasflaschen" className="aspect-[4/5] rounded-t-full" />
          </Parallax>
          <Eyebrow className="mt-14">Handgemacht in Berlin</Eyebrow>
          <RevealHeading as="h3" text={productsTitle} className="mt-5 text-[clamp(2rem,3.4vw,3.4rem)] leading-[1.05]" />
          <p className="mt-6 max-w-lg text-lg text-muted">{productsText}</p>
          <ArrowLink href="/shop/" className="mt-10 self-start">
            Zur Pflegeserie
          </ArrowLink>
        </div>
      </div>
      <div className="mt-28 grid gap-12 border-t border-line pt-14 sm:grid-cols-2 lg:grid-cols-4">
        {site.trust.map((t, i) => (
          <Reveal key={t.title} delay={i * 100}>
            <span className="font-serif text-6xl text-honey-400">{String(i + 1).padStart(2, '0')}</span>
            <p className="mt-6 font-serif text-3xl">{t.title}</p>
            <p className="mt-3 text-muted">{t.text}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function TeamTeaser() {
  const shown = staff.filter((s) => s.visible);
  return (
    <Section>
      <div className="grid gap-16 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-24">
        <div>
          <Eyebrow>Unser Team</Eyebrow>
          <Title className="mt-6">Die Hände hinter der *Honigseele*.</Title>
          <p className="mt-8 max-w-md text-lg text-muted">
            Depiladoras, Kosmetikerinnen, Masseurinnen, eine Podologin, Coaches und Yogalehrerinnen. Jede bringt ihre eigene Gabe mit – und alle nehmen sich Zeit für Dich.
          </p>
          <ArrowLink href="/ueber-uns/#team" className="mt-10">
            Lerne uns kennen
          </ArrowLink>
        </div>
        <div>
          <ul className="flex flex-wrap gap-3">
            {shown.map((s, i) => (
              <Reveal as="li" key={s.id} delay={i * 45} className="flex items-center gap-3 rounded-full border border-line-soft bg-card py-2 pl-2 pr-6 transition-colors hover:border-honey-400">
                <Avatar name={s.name} tone={s.avatarTone} size="sm" className="!h-12 !w-12 text-base" />
                <span>
                  <span className="block font-serif text-xl leading-tight">{s.name}</span>
                  <span className="block text-xs text-muted">{s.title ?? s.role.split(' · ')[0]}</span>
                </span>
              </Reveal>
            ))}
          </ul>
          <p className="mt-6">
            <Placeholder label="Teamfotos folgen" />
          </p>
        </div>
      </div>
    </Section>
  );
}

export function CoursePreview() {
  const { data: sessions } = useData((db) => db.listSessions({ from: new Date().toISOString() }), []);
  const next = (sessions ?? []).slice(0, 5);
  return (
    <section className="bg-cream-100">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[60svh] lg:min-h-full">
          <RevealImage src="/images/stock/yoga.jpg" alt="Yoga in warmem Licht" className="!absolute inset-0" />
        </div>
        <div className="px-[clamp(1.25rem,3.5vw,4rem)] py-24 md:py-36 lg:pl-20">
          <Eyebrow>Kurse & Coaching</Eyebrow>
          <Title className="mt-6">Bewegen, atmen, *verbinden*.</Title>
          <p className="mt-8 max-w-lg text-lg text-muted">Yoga mit Kati und Maria, Pränatal und Postnatal, Breathwork, Kakaozeremonie und unser Bienenstock Frauen-Netzwerk.</p>
          <ul className="mt-12 border-t border-honey-950/20">
            {next.length === 0 &&
              courses.slice(0, 4).map((c) => (
                <li key={c.id} className="border-b border-honey-950/20 py-6 font-serif text-3xl">
                  {c.name}
                </li>
              ))}
            {next.map((s) => {
              const course = courses.find((c) => c.id === s.courseId);
              const free = s.capacity - s.booked;
              return (
                <li key={s.id} className="border-b border-honey-950/20">
                  <Link href={`/kurse/#${s.id}`} className="group grid min-h-20 grid-cols-[6rem_1fr_auto] items-center gap-4 py-5">
                    <span className="text-sm">
                      <span className="block uppercase tracking-[0.14em] text-muted">{formatDateShort(s.start)}</span>
                      <span className="font-serif text-2xl">{berlinTime(s.start)}</span>
                    </span>
                    <span className="font-serif text-[clamp(1.6rem,2.2vw,2.2rem)] leading-tight transition-transform duration-500 group-hover:translate-x-2">{course?.name}</span>
                    <span className={cn('rounded-full px-3 py-1 text-xs', free === 0 ? 'bg-danger/10 text-danger' : 'bg-honey-200/60 text-honey-950')}>{free === 0 ? 'ausgebucht' : `${free} frei`}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ArrowLink href="/kurse/" className="mt-10">
            Zum Kursplan
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}

export function NewsletterSection() {
  return (
    <section className="honey-glow on-dark relative overflow-hidden py-28 text-cream-50 md:py-40">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-[0.07]" aria-hidden>
        <Marquee speed={70} items={['Post aus der Honigseele', 'Neue Kurse', 'Pflege-Tipps', 'Kleine Überraschungen'].map((t) => <span key={t} className="whitespace-nowrap font-serif text-[16vw] italic leading-none">{t}</span>)} />
      </div>
      <div className="wrap relative flex flex-col items-center text-center">
        <Eyebrow>Newsletter</Eyebrow>
        <Title className="mt-6 max-w-[14ch]">Bleib mit uns in *Verbindung*.</Title>
        <p className="mx-auto mt-8 max-w-md text-lg text-cream-100/80">Neue Kurse, Pflege-Tipps und kleine Überraschungen – etwa einmal im Monat. Abmelden jederzeit.</p>
        <div className="mt-12 w-full max-w-lg">
          <NewsletterForm dark />
        </div>
      </div>
    </section>
  );
}
