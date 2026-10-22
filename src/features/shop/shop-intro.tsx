'use client';
// Shop-Start: hell und verspielt wie die Behandlungs-Übersicht.
// Großer Titel, Einstieg nach Ritual und ein „Regal“ mit schwebenden Produkten.
import Link from 'next/link';
import { CountUp } from '@/components/ui/motion';
import { Eyebrow, Title } from '@/components/ui/typography';
import { site } from '@/content';
import type { Product } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatEuro } from '@/lib/format';
import { ProductVisual } from './product-visual';
import { rituals, ritualsOf, type Ritual } from './rituals';

/** Auswahl fürs Regal: je Ritual ein Produkt, dann auffüllen */
function shelfOf(products: Product[]): Product[] {
  const picked: Product[] = [];
  for (const r of rituals) {
    const p = products.find((x) => ritualsOf(x.id).includes(r.id) && !picked.includes(x));
    if (p) picked.push(p);
  }
  for (const p of products) if (picked.length < 6 && !picked.includes(p)) picked.push(p);
  return picked.slice(0, 6);
}

export function ShopIntro({ products, onRitual }: { products: Product[]; onRitual: (r: Ritual) => void }) {
  const shelf = shelfOf(products);
  const pick = (r: Ritual) => {
    onRitual(r);
    document.getElementById('sortiment')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <section className="honey-light overflow-hidden pb-20 pt-16 md:pb-28 md:pt-24">
      <div className="wrap">
        <Eyebrow>Die Crememanufaktur</Eyebrow>
        <Title as="h1" size="display" className="mt-8 max-w-[13ch]">
          Pflege, die wir *selbst* benutzen.
        </Title>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-end">
          <p className="max-w-md text-lg text-muted md:text-xl">
            <CountUp to={products.length} className="font-serif text-4xl text-honey-950" /> Produkte, handgemacht in Berlin und in jeder unserer Behandlungen im Einsatz. Versand {formatEuro(site.shipping.flatCents)}.
          </p>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-800">Wonach suchst Du?</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {rituals.map((r) => (
                <button
                  key={r.id}
                  onClick={() => pick(r.id)}
                  className="group/chip inline-flex min-h-12 items-center gap-3 rounded-full border border-honey-950/15 bg-card/70 px-5 font-serif text-xl transition-all duration-500 hover:-translate-y-0.5 hover:border-honey-950 hover:bg-honey-950 hover:text-cream-50"
                >
                  {r.label}
                  <span className="font-sans text-xs text-muted transition-colors group-hover/chip:text-cream-100/70">{products.filter((p) => ritualsOf(p.id).includes(r.id)).length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Das Regal: Produkte schweben sanft, versetzte Höhen */}
        <ul className="mt-16 grid grid-cols-3 gap-3 sm:gap-5 md:mt-24 lg:grid-cols-6 lg:gap-6">
          {shelf.map((p, i) => (
            <li key={p.id} className={cn(i >= 3 && 'hidden lg:block', i % 2 === 1 && 'mt-8 md:mt-14')}>
              <Link href={`/shop/${p.id}/`} data-label={p.name} className="group block">
                <div className="shelf-float" style={{ animationDelay: `${i * -1.3}s` }}>
                  <ProductVisual product={p} className="aspect-[3/4] rounded-t-full shadow-[0_30px_60px_-30px_rgb(43_33_24/0.35)] transition-transform duration-700 ease-[var(--ease-soft)] group-hover:-translate-y-2" />
                </div>
                <p className="mt-4 line-clamp-2 font-serif text-lg leading-tight md:text-xl">{p.name}</p>
                <p className="text-sm text-muted">
                  {p.size && `${p.size} · `}
                  {formatEuro(p.priceCents)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
