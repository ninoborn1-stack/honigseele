'use client';
// Shop als „Die Crememanufaktur“: eigene Naturkosmetik nach Ritual, ein Liebling, Geschenke, Karten.
import { Check, Plus, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Placeholder } from '@/components/ui/badge';
import { ArrowLink, Button, ButtonLink } from '@/components/ui/button';
import { CountUp, Marquee, Parallax, RevealHeading, RevealImage } from '@/components/ui/motion';
import { Reveal } from '@/components/ui/reveal';
import { Eyebrow, Title } from '@/components/ui/typography';
import { care, site } from '@/content';
import type { Product } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { useCart } from './cart';
import { ProductTile } from './product-tile';
import { ProductVisual } from './product-visual';
import { FAVORITE_ID, rituals, ritualsOf, type Ritual } from './rituals';
import { Tilt } from './tilt';
import { VoucherCard } from './voucher-card';

export function ShopOverview({ initialProducts }: { initialProducts: Product[] }) {
  const { data: products = initialProducts } = useData((db) => db.listProducts(), [], initialProducts);
  const care_ = products.filter((p) => p.kind === 'pflege' && p.active);
  const vouchers = products.filter((p) => p.kind === 'gutschein' && p.active);
  const cards = products.filter((p) => p.kind === 'karte' && p.active);
  const favorite = care_.find((p) => p.id === FAVORITE_ID);

  return (
    <>
      <Intro count={care_.length} />
      <div className="border-y border-line bg-cream-50 py-6 md:py-8" aria-hidden>
        <Marquee
          speed={50}
          items={['Handgemacht in Berlin', 'In jeder Behandlung', 'Ohne Schnickschnack', 'Crememanufaktur', 'Mit Zutaten, die Deine Haut kennt'].map((t, i) => (
            <span key={t} className={cn('whitespace-nowrap font-serif text-[clamp(2rem,4.4vw,4.2rem)] leading-none', i % 2 ? 'italic text-amber-600' : 'text-honey-950')}>
              {t}
            </span>
          ))}
        />
      </div>
      <Assortment products={care_} />
      {favorite && <Favorite product={favorite} />}
      <Gifts vouchers={vouchers} />
      <Cards cards={cards} />
      <Closing />
    </>
  );
}

function Intro({ count }: { count: number }) {
  return (
    <section className="honey-light overflow-hidden">
      <div className="wrap grid gap-14 pb-20 pt-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-20 lg:pb-28 lg:pt-16">
        <div>
          <Eyebrow>Die Crememanufaktur</Eyebrow>
          <Title as="h1" size="display" className="mt-8">
            Pflege, die wir *selbst* benutzen.
          </Title>
          <Reveal delay={250}>
            <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted md:text-xl">
              Handgemacht in der Crememanufaktur Berlin – und in jeder unserer Behandlungen im Einsatz. Was Dir bei uns guttut, kannst Du mit nach Hause nehmen.
            </p>
          </Reveal>
          <Reveal delay={380} className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4">
            <a href="#sortiment" className="group/btn inline-flex min-h-14 items-center gap-2 whitespace-nowrap rounded-full bg-honey-950 px-8 text-base font-medium text-cream-50 transition-colors hover:bg-honey-800">
              Sortiment entdecken
            </a>
            <ArrowLink href="/shop/gutscheine/" data-label="Gutscheine">
              Gutschein verschenken
            </ArrowLink>
          </Reveal>
          <dl className="mt-16 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-8">
            <div>
              <dt className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">Produkte</dt>
              <dd className="mt-2 font-serif text-5xl leading-none">
                <CountUp to={count} />
              </dd>
            </div>
            <div>
              <dt className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">Im Einsatz</dt>
              <dd className="mt-2 font-serif text-2xl leading-tight md:text-3xl">
                in jeder <em className="text-amber-600">Behandlung</em>
              </dd>
            </div>
            <div>
              <dt className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">Versand</dt>
              <dd className="mt-2 font-serif text-5xl leading-none">{formatEuro(site.shipping.flatCents)}</dd>
            </div>
          </dl>
        </div>
        <Parallax speed={0.08}>
          <RevealImage src="/images/stock/products.jpg" alt="Naturkosmetik in Glasflaschen mit Kerze" className="aspect-[4/5] rounded-t-full lg:aspect-[3/4]" />
        </Parallax>
      </div>
    </section>
  );
}

function Assortment({ products }: { products: Product[] }) {
  const [ritual, setRitual] = useState<Ritual | 'alle'>('alle');
  const list = ritual === 'alle' ? products : products.filter((p) => ritualsOf(p.id).includes(ritual));
  const active = rituals.find((r) => r.id === ritual);
  const counts = Object.fromEntries(rituals.map((r) => [r.id, products.filter((p) => ritualsOf(p.id).includes(r.id)).length]));

  return (
    <section id="sortiment" className="scroll-mt-[calc(var(--top-h,96px)+1rem)] bg-cream-50 py-24 md:py-32">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Eyebrow>Sortiment</Eyebrow>
            <Title className="mt-6">Nach *Ritual* entdecken.</Title>
          </div>
          <p key={ritual} className="max-w-sm animate-rise font-serif text-2xl italic leading-snug text-amber-800 lg:text-right">
            {active?.line ?? `${products.length} Produkte, eine Haltung: so wenig wie nötig, so gut wie möglich.`}
          </p>
        </div>
      </div>

      {/* Filterleiste bleibt beim Scrollen unter der Kopfzeile stehen */}
      <div className="sticky top-[var(--top-h,96px)] z-20 mt-12 border-y border-line-soft bg-cream-50/92 backdrop-blur-md">
        <div className="wrap no-scrollbar flex gap-2 overflow-x-auto py-3" role="tablist" aria-label="Nach Ritual filtern">
          {[{ id: 'alle' as const, label: 'Alle' }, ...rituals].map((r) => {
            const on = ritual === r.id;
            const n = r.id === 'alle' ? products.length : counts[r.id];
            return (
              <button
                key={r.id}
                role="tab"
                aria-selected={on}
                onClick={() => setRitual(r.id)}
                className={cn('flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-sm transition-colors duration-300', on ? 'border-honey-950 bg-honey-950 text-cream-50' : 'border-line text-honey-950 hover:border-honey-950')}
              >
                {r.label}
                <span className={cn('text-xs tabular-nums', on ? 'text-honey-300' : 'text-muted')}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="wrap mt-14">
        <ul key={ritual} className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-6 sm:gap-y-16 lg:grid-cols-3 2xl:grid-cols-4">
          {list.map((p, i) => (
            <ProductTile key={p.id} product={p} index={i} />
          ))}
        </ul>
        {list.length === 0 && <p className="py-16 text-center text-muted">In diesem Ritual gibt es gerade nichts.</p>}
        <p className="mt-16 text-sm text-muted">
          Alle Preise inkl. MwSt. Versand innerhalb Deutschlands {formatEuro(site.shipping.flatCents)}. <Placeholder label="Weitere Produkte folgen" className="ml-1" />
        </p>
      </div>
    </section>
  );
}

function Favorite({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const steps = care.waxing?.aftercare ?? [];
  return (
    <section className="grid bg-cream-100 lg:grid-cols-2">
      <div className="relative min-h-[70svh] lg:min-h-full">
        <ProductVisual product={product} large className="absolute inset-0" />
        <span className="absolute left-[clamp(1.25rem,3.5vw,4rem)] top-8 rounded-full bg-cream-50/90 px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-honey-950 backdrop-blur">Unser Liebling</span>
      </div>
      <div className="px-[clamp(1.25rem,3.5vw,4rem)] py-24 md:py-32 lg:pl-20">
        <Eyebrow>Nach dem Waxing</Eyebrow>
        <RevealHeading as="h2" text="Der Begleiter nach *jedem* Waxing." className="mt-6 text-[clamp(2.5rem,5vw,5.4rem)] leading-[0.98] tracking-[-0.015em]" />
        <Reveal delay={150}>
          <p className="mt-8 max-w-lg text-lg text-muted">{product.description}</p>
        </Reveal>
        <ol className="mt-12 max-w-lg border-t border-honey-950/20">
          {steps.map((s, i) => (
            <Reveal as="li" key={s} delay={i * 110} className="grid grid-cols-[3.5rem_1fr] items-baseline border-b border-honey-950/20 py-5">
              <span className="font-serif text-3xl text-amber-600">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-lg">{s}</span>
            </Reveal>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
          <Button
            size="lg"
            disabled={product.stock <= 0}
            onClick={() => {
              add({ productId: product.id, quantity: 1 }, { silent: true });
              setAdded(true);
              setTimeout(() => setAdded(false), 1800);
            }}
          >
            {added ? <Check className="h-4 w-4" strokeWidth={2} /> : <Plus className="h-4 w-4" strokeWidth={1.5} />}
            {added ? 'Im Warenkorb' : `${product.name} · ${formatEuro(product.priceCents)}`}
          </Button>
          <ArrowLink href={`/shop/${product.id}/`} data-label={product.name}>
            Mehr erfahren
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}

function Gifts({ vouchers }: { vouchers: Product[] }) {
  const [kindId, setKindId] = useState(vouchers[0]?.id ?? 'gutschein');
  const kind = vouchers.find((v) => v.id === kindId) ?? vouchers[0];
  const { minCents, maxCents, validYears } = site.voucher;
  return (
    <section id="gutscheine" className="honey-glow on-dark relative overflow-hidden py-24 text-cream-50 md:py-36">
      <div aria-hidden className="pointer-events-none absolute -right-[20vw] top-1/2 h-[70vw] w-[70vw] -translate-y-1/2 rounded-full border border-honey-300/10" />
      <div aria-hidden className="pointer-events-none absolute -right-[10vw] top-1/2 h-[50vw] w-[50vw] -translate-y-1/2 rounded-full border border-honey-300/10" />
      <div className="wrap relative grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-24">
        <div>
          <Eyebrow>Geschenke</Eyebrow>
          <Title className="mt-6">Zeit *verschenken*.</Title>
          <Reveal delay={150}>
            <p className="mt-8 max-w-md text-lg text-cream-100/80">
              Frei wählbar von {formatEuro(minCents)} bis {formatEuro(maxCents)}, digital per E-Mail, {validYears} Jahre gültig und direkt bei der Online-Buchung einlösbar.
            </p>
          </Reveal>
          <div className="mt-12 border-t border-cream-50/15" role="radiogroup" aria-label="Gutscheinart">
            {vouchers.map((v) => {
              const on = v.id === kindId;
              return (
                <button
                  key={v.id}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setKindId(v.id)}
                  className="group flex min-h-20 w-full items-center justify-between gap-6 border-b border-cream-50/15 py-5 text-left"
                >
                  <span>
                    <span className={cn('block font-serif text-[clamp(1.8rem,2.6vw,2.6rem)] leading-none transition-colors', on ? 'text-honey-300' : 'text-cream-50 group-hover:text-honey-200')}>{v.name}</span>
                    <span className="mt-2 block text-sm text-cream-100/65">{v.description}</span>
                  </span>
                  <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors', on ? 'border-honey-300 bg-honey-300 text-honey-950' : 'border-cream-50/30')}>
                    {on && <Check className="h-3.5 w-3.5" strokeWidth={2} />}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4">
            <ButtonLink href={`/shop/gutscheine/?art=${kind?.id ?? 'gutschein'}`} variant="honey" size="lg" arrow data-label="Gutscheine">
              Gutschein gestalten
            </ButtonLink>
          </div>
        </div>
        <Tilt className="mx-auto w-full max-w-[38rem]">
          <VoucherCard key={kind?.id} title={kind?.name ?? 'Gutschein'} valueCents={kind?.priceCents ?? 5000} recipient="Dich" message="Für eine kleine Auszeit nur für Dich." className="animate-fade shadow-2xl shadow-black/40 ring-1 ring-honey-300/35" />
        </Tilt>
      </div>
    </section>
  );
}

function Cards({ cards }: { cards: Product[] }) {
  const { add } = useCart();
  const [added, setAdded] = useState<string | null>(null);
  return (
    <section id="karten" className="scroll-mt-[calc(var(--top-h,96px)+1rem)] bg-cream-50 py-24 md:py-32">
      <div className="wrap grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <Eyebrow>Yoga-Karten</Eyebrow>
          <Title className="mt-6">Einmal kaufen, *oft* kommen.</Title>
          <p className="mt-8 max-w-md text-lg text-muted">Mit einer 5er- oder 10er-Karte buchst Du Deine Yoga-Stunden mit einem Tipp. Einzeltickets für Kurse und Workshops gibt es direkt im Kursplan.</p>
          <ArrowLink href="/kurse/" className="mt-10" data-label="Kurse">
            Zum Kursplan
          </ArrowLink>
        </div>
        <ul className="border-t border-honey-950/20">
          {cards.map((c) => (
            <Reveal as="li" key={c.id} className="grid grid-cols-[1fr_auto] items-center gap-6 border-b border-honey-950/20 py-8 md:py-10">
              <div>
                <p className="font-serif text-[clamp(2rem,3.6vw,3.6rem)] leading-none">
                  {c.name} {c.isPlaceholder && <Placeholder className="ml-1 align-middle" />}
                </p>
                <p className="mt-3 max-w-md text-muted">{c.description}</p>
              </div>
              <div className="flex flex-col items-end gap-4 sm:flex-row sm:items-center sm:gap-6">
                <span className="font-serif text-4xl">{formatEuro(c.priceCents)}</span>
                <button
                  onClick={() => {
                    add({ productId: c.id, quantity: 1 }, { silent: true });
                    setAdded(c.id);
                    setTimeout(() => setAdded(null), 1800);
                  }}
                  className={cn(
                    'flex min-h-12 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors duration-300',
                    added === c.id ? 'border-honey-950 bg-honey-950 text-cream-50' : 'border-honey-950/25 hover:border-honey-950 hover:bg-honey-950 hover:text-cream-50',
                  )}
                  aria-label={`${c.name} in den Warenkorb`}
                >
                  {added === c.id ? <Check className="h-4 w-4" strokeWidth={2} /> : <Ticket className="h-4 w-4" strokeWidth={1.5} />}
                  {added === c.id ? 'Im Warenkorb' : 'Hinzufügen'}
                </button>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="bg-cream-100 py-24 text-center md:py-32">
      <div className="wrap flex flex-col items-center">
        <Eyebrow>Erst ausprobieren?</Eyebrow>
        <Title className="mt-6 max-w-[16ch]">Frag beim nächsten Termin nach einer *Probe*.</Title>
        <p className="mx-auto mt-8 max-w-lg text-lg text-muted">Wir beraten Dich gern, was zu Deiner Haut passt – ganz ohne Verkaufsdruck.</p>
        <div className="mt-10">
          <Link href="/buchen/" data-label="Buchen" className="inline-flex min-h-14 items-center rounded-full bg-honey-950 px-8 text-base font-medium text-cream-50 transition-colors hover:bg-honey-800">
            Termin buchen
          </Link>
        </div>
      </div>
    </section>
  );
}
