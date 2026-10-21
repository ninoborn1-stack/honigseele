'use client';
import { ArrowUpRight, Plus, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Placeholder } from '@/components/ui/badge';
import { ButtonLink, Button } from '@/components/ui/button';
import { Photo } from '@/components/ui/photo';
import { Reveal } from '@/components/ui/reveal';
import { Eyebrow, Numeral, Section, Title } from '@/components/ui/typography';
import { site } from '@/content';
import type { Product } from '@/domain/types';
import { formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { useCart } from './cart';
import { ProductVisual } from './product-visual';

export function ShopOverview({ initialProducts }: { initialProducts: Product[] }) {
  const { data: products = initialProducts } = useData((db) => db.listProducts(), [], initialProducts);
  const { add } = useCart();
  const care = products.filter((p) => p.kind === 'pflege' && p.active);
  const vouchers = products.filter((p) => p.kind === 'gutschein' && p.active);
  const cards = products.filter((p) => p.kind === 'karte' && p.active);

  return (
    <>
      <Section tone="light" className="!pb-12">
        <Eyebrow>Shop</Eyebrow>
        <Title as="h1" className="mt-4 max-w-3xl">Pflege, die Du *mitnehmen* kannst.</Title>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Unsere eigene Naturkosmetik aus der Crememanufaktur Berlin, Gutscheine zum Verschenken und Karten für Deine Yoga-Stunden.
        </p>
        <nav aria-label="Shop-Bereiche" className="mt-10 flex flex-wrap gap-2">
          {[
            ['#pflegeserie', 'Pflegeserie'],
            ['#gutscheine', 'Gutscheine'],
            ['#karten', 'Tickets & Karten'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm hover:border-honey-950">
              {label}
            </a>
          ))}
        </nav>
      </Section>

      {/* 1. Pflegeserie */}
      <Section id="pflegeserie" className="!pt-8">
        <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Numeral n={1} />
            <h2 className="mt-4 text-4xl md:text-5xl">
              Die <em>Pflegeserie</em>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted">
            Handgemacht in Berlin, in jeder unserer Behandlungen im Einsatz. Versand innerhalb Deutschlands {formatEuro(site.shipping.flatCents)}.
          </p>
        </div>
        <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {care.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 3) * 80} className="border-b border-line-soft py-8">
              <Link href={`/shop/${p.id}/`} data-label={p.name} className="group block">
                <ProductVisual product={p} className="aspect-[4/5] rounded-[1.75rem] transition-[border-radius] duration-700 group-hover:rounded-[3rem]" />
              </Link>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link href={`/shop/${p.id}/`} className="font-serif text-2xl leading-tight hover:text-amber-800">
                    {p.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {p.size ?? ' '} {p.isPlaceholder && <Placeholder label="Text folgt" className="ml-1" />}
                  </p>
                </div>
                <p className="whitespace-nowrap font-serif text-2xl">{formatEuro(p.priceCents)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full"
                disabled={p.stock <= 0}
                onClick={() => add({ productId: p.id, quantity: 1 })}
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                {p.stock > 0 ? 'In den Warenkorb' : 'Gerade ausverkauft'}
              </Button>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* 2. Gutscheine */}
      <Section id="gutscheine" tone="dark">
        <div className="grid gap-12 md:grid-cols-[1fr_1fr] md:items-center">
          <Reveal>
            <Numeral n={2} className="!text-honey-300" />
            <h2 className="mt-4 text-4xl md:text-6xl">
              Zeit <em>verschenken</em>.
            </h2>
            <p className="mt-6 max-w-md text-cream-100/80">
              Frei wählbar von {formatEuro(site.voucher.minCents)} bis {formatEuro(site.voucher.maxCents)}, digital per E-Mail, {site.voucher.validYears} Jahre gültig und direkt bei der Online-Buchung einlösbar.
            </p>
            <ButtonLink href="/shop/gutscheine/" variant="honey" size="lg" className="mt-8" data-label="Gutscheine">
              Gutschein gestalten
            </ButtonLink>
          </Reveal>
          <Reveal delay={120}>
            <ul className="border-t border-cream-50/15">
              {vouchers.map((v) => (
                <li key={v.id} className="border-b border-cream-50/15">
                  <Link href={`/shop/gutscheine/?art=${v.id}`} className="group flex min-h-20 items-center justify-between gap-6 py-5" data-label="Gutscheine">
                    <span>
                      <span className="block font-serif text-3xl">{v.name}</span>
                      <span className="text-sm text-cream-100/70">{v.description}</span>
                    </span>
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-honey-300 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* 3. Tickets & Karten */}
      <Section id="karten" tone="cream2">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <Photo src="/images/stock/yoga.jpg" alt="Yoga in warmem Licht" className="aspect-[4/5] rounded-t-full" />
          </Reveal>
          <Reveal delay={100}>
            <Numeral n={3} />
            <h2 className="mt-4 text-4xl md:text-5xl">
              Tickets & <em>Karten</em>
            </h2>
            <p className="mt-5 max-w-md text-muted">
              Mit einer 5er- oder 10er-Karte buchst Du Deine Yoga-Stunden mit einem Tipp. Einzeltickets für Kurse und Workshops gibt es direkt im Kursplan.
            </p>
            <ul className="mt-8 border-t border-line">
              {cards.map((c) => (
                <li key={c.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-5">
                  <div>
                    <p className="font-serif text-2xl">
                      {c.name} {c.isPlaceholder && <Placeholder className="ml-1" />}
                    </p>
                    <p className="text-sm text-muted">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-2xl">{formatEuro(c.priceCents)}</span>
                    <button
                      onClick={() => add({ productId: c.id, quantity: 1 })}
                      className="grid h-11 w-11 place-items-center rounded-full border border-line text-amber-800 transition-colors hover:border-honey-950 hover:bg-honey-950 hover:text-cream-50"
                      aria-label={`${c.name} in den Warenkorb`}
                    >
                      <Plus className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <ButtonLink href="/kurse/" variant="ghost" className="mt-8" data-label="Kurse">
              <Ticket className="h-4 w-4" strokeWidth={1.5} />
              Zum Kursplan & Einzeltickets
            </ButtonLink>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
