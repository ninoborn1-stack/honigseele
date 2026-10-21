'use client';
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { NewsletterForm } from '@/components/layout/footer';
import { Avatar } from '@/components/ui/avatar';
import { Placeholder } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Photo } from '@/components/ui/photo';
import { Reveal } from '@/components/ui/reveal';
import { Eyebrow, Numeral, Section, Title } from '@/components/ui/typography';
import { block, courses, packages, site, staff, treatmentCategories } from '@/content';
import { formatDateShort } from '@/domain/time';
import { cn } from '@/lib/cn';
import { berlinTime, formatDuration, formatEuro } from '@/lib/format';
import { useBlock, useData } from '@/lib/use-data';

export function Intro() {
  const title = useBlock('home.intro.title', block('home.intro.title'));
  const text = useBlock('home.intro.text', block('home.intro.text'));
  return (
    <Section className="!pt-10 md:!pt-16">
      <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
        <Reveal>
          <Eyebrow>Willkommen</Eyebrow>
          <p className="mt-6 hidden font-serif text-7xl leading-none text-honey-200 md:block">“</p>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="text-[2.1rem] leading-[1.1] md:text-5xl">
            {title.split('Waxing und Beauty')[0]}
            {title.includes('Waxing und Beauty') && (
              <>
                <em>Waxing und Beauty</em>
                {title.split('Waxing und Beauty')[1]}
              </>
            )}
          </h2>
          <p className="mt-8 max-w-xl text-lg text-muted">{text}</p>
          <ButtonLink href="/ueber-uns/" variant="link" className="mt-6">
            Wer wir sind
          </ButtonLink>
        </Reveal>
      </div>
    </Section>
  );
}

/** Bereiche als redaktioneller Index statt Karten-Raster */
export function Areas() {
  const [active, setActive] = useState(0);
  const list = treatmentCategories.filter((c) => !c.isPlaceholder);
  return (
    <Section tone="cream2" id="bereiche">
      <div className="flex items-end justify-between gap-6">
        <div>
          <Eyebrow>Behandlungen</Eyebrow>
          <Title className="mt-4">Was Dir *guttut*</Title>
        </div>
        <span className="hidden md:block">
          <ButtonLink href="/behandlungen/" variant="link">
            Alle Behandlungen
          </ButtonLink>
        </span>
      </div>
      <div className="mt-14 grid gap-12 md:grid-cols-[1fr_0.85fr] md:gap-16">
        <ol className="border-t border-line">
          {list.map((c, i) => (
            <li key={c.id} className="border-b border-line">
              <Link
                href={`/behandlungen/${c.id}/`}
                data-label={c.name}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group grid min-h-24 grid-cols-[auto_1fr_auto] items-center gap-5 py-6"
              >
                <Numeral n={i + 1} className="self-start pt-2" />
                <span>
                  <span className="block font-serif text-3xl transition-colors group-hover:text-amber-600 md:text-4xl">{c.name}</span>
                  <span className="mt-1 block text-sm text-muted">{c.teaser}</span>
                </span>
                <span className="flex items-center gap-4">
                  <Photo src={c.image} alt="" className="h-16 w-14 rounded-full md:hidden" />
                  <ArrowUpRight className="h-5 w-5 text-amber-800 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="relative hidden md:block">
          <div className="sticky top-28 aspect-[4/5] overflow-hidden rounded-[2.5rem]">
            {list.map((c, i) => (
              <Photo
                key={c.id}
                src={c.image}
                alt={c.name}
                className={cn('!absolute inset-0 transition-all duration-1000', i === active ? 'scale-100 opacity-100' : 'scale-105 opacity-0')}
              />
            ))}
            <p className="absolute bottom-6 left-6 rounded-full bg-cream-50/85 px-4 py-2 font-serif text-lg italic backdrop-blur">{list[active].eyebrow}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function Packages() {
  return (
    <Section tone="dark" className="overflow-hidden">
      <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
        <Reveal>
          <Eyebrow>Wohlfühl-Pakete</Eyebrow>
          <Title className="mt-4">Ein paar Stunden, die *nur Dir* gehören.</Title>
        </Reveal>
        <Reveal delay={100}>
          <p className="max-w-md text-cream-100/80">
            Allein, zu zweit, mit Mama, als Braut oder für die Kleinen: Unsere Pakete verbinden mehrere Behandlungen zu einer Auszeit. Ein Willkommensgetränk wartet immer.
          </p>
        </Reveal>
      </div>
      <div className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:-mx-10 md:px-10" data-lenis-prevent>
        {packages.slice(0, 6).map((p, i) => (
          <Link
            key={p.id}
            href={`/buchen/?leistung=${p.id}`}
            data-label="Buchen"
            className="group flex w-[78vw] max-w-sm shrink-0 snap-start flex-col justify-between rounded-[2rem] border border-cream-50/15 p-7 transition-colors hover:border-honey-300/60 hover:bg-cream-50/[0.03] md:w-[340px]"
          >
            <div>
              <p className="font-serif text-lg text-honey-300">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-6 text-3xl leading-tight">{p.name}</h3>
              <p className="mt-2 text-sm italic text-cream-100/70">{p.tagline}</p>
              <ul className="mt-6 space-y-2 border-t border-cream-50/10 pt-5 text-sm text-cream-100/80">
                {p.includes.slice(0, 4).map((x) => (
                  <li key={x} className="flex gap-3">
                    <span className="mt-2.5 h-px w-3 shrink-0 bg-honey-300/70" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-sm text-cream-100/70">{formatDuration(p.durationMin)}</span>
              <span className="font-serif text-3xl text-honey-300">{formatEuro(p.priceCents)}</span>
            </div>
          </Link>
        ))}
        <Link href="/behandlungen/wohlfuehl-pakete/" className="flex w-60 shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-[2rem] border border-dashed border-cream-50/20 p-7 text-center text-cream-100/80 hover:text-cream-50">
          <ArrowRight strokeWidth={1.5} />
          Alle {packages.length} Pakete
        </Link>
      </div>
    </Section>
  );
}

export function Trust() {
  const productsTitle = useBlock('home.products.title', block('home.products.title'));
  const productsText = useBlock('home.products.text', block('home.products.text'));
  return (
    <Section tone="light">
      <div className="grid gap-16 md:grid-cols-2 md:gap-20">
        <Reveal>
          <Eyebrow>Was andere sagen</Eyebrow>
          <div className="mt-6 flex items-end gap-4">
            <span className="font-serif text-[7rem] leading-[0.8] md:text-[9rem]">{site.brand.rating.value.toLocaleString('de-DE')}</span>
            <div className="pb-2">
              <div className="flex gap-0.5 text-amber-600">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-current" strokeWidth={1} />
                ))}
              </div>
              <p className="mt-1 text-sm text-muted">aus ca. {site.brand.rating.count.toLocaleString('de-DE')} Bewertungen auf {site.brand.rating.source}</p>
            </div>
          </div>
          <div className="mt-10 space-y-8">
            {site.reviews.map((r) => (
              <figure key={r.text} className="border-l border-line pl-6">
                <blockquote className="font-serif text-2xl italic leading-snug">„{r.text}“</blockquote>
                <figcaption className="mt-2 text-sm text-muted">
                  {r.name} {r.placeholder && <Placeholder label="Beispiel" />}
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
        <Reveal delay={150} className="flex flex-col">
          <Photo src="/images/stock/products.jpg" alt="Naturkosmetik in Glasflaschen" className="aspect-[4/3] rounded-[2rem]" />
          <Eyebrow className="mt-10">Handgemacht in Berlin</Eyebrow>
          <h3 className="mt-3 text-4xl leading-tight">{productsTitle}</h3>
          <p className="mt-4 text-muted">{productsText}</p>
          <ButtonLink href="/shop/" variant="ghost" className="mt-8 self-start">
            Zur Pflegeserie
          </ButtonLink>
        </Reveal>
      </div>
      <div className="mt-20 grid gap-8 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
        {site.trust.map((t, i) => (
          <Reveal key={t.title} delay={i * 80}>
            <Numeral n={i + 1} />
            <p className="mt-4 font-serif text-2xl">{t.title}</p>
            <p className="mt-2 text-sm text-muted">{t.text}</p>
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
      <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-center">
        <Reveal>
          <Eyebrow>Die Honigseelen</Eyebrow>
          <Title className="mt-4">{`${shown.length} Menschen, *eine* Haltung.`}</Title>
          <p className="mt-6 max-w-md text-muted">
            Depiladoras, Kosmetikerinnen, Masseurinnen, eine Podologin, Coaches und Yogalehrerinnen. Jede bringt ihre eigene Gabe mit – und alle nehmen sich Zeit für Dich.
          </p>
          <ButtonLink href="/ueber-uns/#team" variant="ghost" className="mt-8">
            Lerne uns kennen
          </ButtonLink>
        </Reveal>
        <Reveal delay={120}>
          <ul className="flex flex-wrap gap-3">
            {shown.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-full border border-line-soft bg-card py-1.5 pl-1.5 pr-5">
                <Avatar name={s.name} tone={s.avatarTone} size="sm" />
                <span className="text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="block text-xs text-muted">{s.title ?? s.role.split(' · ')[0]}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            <Placeholder label="Teamfotos folgen" />
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

export function CoursePreview() {
  const { data: sessions } = useData((db) => db.listSessions({ from: new Date().toISOString() }), []);
  const next = (sessions ?? []).slice(0, 5);
  return (
    <Section tone="cream2">
      <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <Photo src="/images/stock/yoga.jpg" alt="Yoga in warmem Licht" className="aspect-[4/5] rounded-[2.5rem] md:aspect-auto md:h-full" />
        </Reveal>
        <Reveal delay={100}>
          <Eyebrow>Kurse & Coaching</Eyebrow>
          <Title className="mt-4">Bewegen, atmen, *verbinden*.</Title>
          <p className="mt-6 max-w-lg text-muted">Yoga mit Kati und Maria, Pränatal und Postnatal, Breathwork, Kakaozeremonie und unser Bienenstock Frauen-Netzwerk.</p>
          <ul className="mt-10 border-t border-line">
            {next.length === 0 &&
              courses.slice(0, 4).map((c) => (
                <li key={c.id} className="border-b border-line py-5 font-serif text-2xl">{c.name}</li>
              ))}
            {next.map((s) => {
              const course = courses.find((c) => c.id === s.courseId);
              const free = s.capacity - s.booked;
              return (
                <li key={s.id} className="border-b border-line">
                  <Link href={`/kurse/#${s.id}`} className="grid min-h-16 grid-cols-[5.5rem_1fr_auto] items-center gap-4 py-4">
                    <span className="text-sm">
                      <span className="block text-muted">{formatDateShort(s.start)}</span>
                      {berlinTime(s.start)}
                    </span>
                    <span className="font-serif text-2xl leading-tight">{course?.name}</span>
                    <span className={cn('text-xs', free === 0 ? 'text-danger' : 'text-muted')}>{free === 0 ? 'ausgebucht' : `${free} frei`}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ButtonLink href="/kurse/" variant="ghost" className="mt-8">
            Zum Kursplan
          </ButtonLink>
        </Reveal>
      </div>
    </Section>
  );
}

export function NewsletterSection() {
  return (
    <Section tone="light" className="text-center">
      <Reveal className="mx-auto max-w-2xl">
        <Eyebrow>Post aus der Honigseele</Eyebrow>
        <Title className="mt-4">Bleib in *Verbindung*.</Title>
        <p className="mx-auto mt-5 max-w-md text-muted">Neue Kurse, Pflege-Tipps und kleine Überraschungen – etwa einmal im Monat. Abmelden jederzeit.</p>
        <div className="mt-8 flex justify-center">
          <NewsletterForm />
        </div>
      </Reveal>
    </Section>
  );
}
