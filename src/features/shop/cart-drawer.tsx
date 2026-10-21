'use client';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ButtonLink, Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { site } from '@/content';
import { formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { unitPrice, useCart } from './cart';
import { ProductVisual } from './product-visual';
import { withBase } from '@/lib/config';

export function CartDrawer() {
  const { lines, open, setOpen, update, remove } = useCart();
  const router = useRouter();
  const { data: products = [] } = useData((db) => db.listProducts(), []);
  const subtotal = lines.reduce((s, l) => s + unitPrice(l, products.find((p) => p.id === l.productId)) * l.quantity, 0);
  const needsShipping = lines.some((l) => products.find((p) => p.id === l.productId)?.kind === 'pflege');

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      title="Warenkorb"
      footer={
        lines.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted">
              <span>Zwischensumme</span>
              <span>{formatEuro(subtotal)}</span>
            </div>
            {needsShipping && (
              <div className="flex justify-between text-sm text-muted">
                <span>Versand</span>
                <span>{formatEuro(site.shipping.flatCents)}</span>
              </div>
            )}
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                setOpen(false);
                router.push('/kasse/');
              }}
            >
              Zur Kasse · {formatEuro(subtotal + (needsShipping ? site.shipping.flatCents : 0))}
            </Button>
          </div>
        )
      }
    >
      {lines.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-2xl">Noch ganz leer hier.</p>
          <p className="mt-2 text-muted">Unsere Pflegeserie oder ein Gutschein vielleicht?</p>
          <ButtonLink href="/shop/" variant="ghost" className="mt-6" onClick={() => setOpen(false)}>
            Zum Shop
          </ButtonLink>
        </div>
      ) : (
        <ul className="divide-y divide-line-soft">
          {lines.map((line, i) => {
            const product = products.find((p) => p.id === line.productId);
            return (
              <li key={i} className="flex gap-4 py-4">
                {product?.kind === 'pflege' ? (
                  <ProductVisual product={product} className="h-20 w-16 shrink-0 rounded-lg [&_span]:hidden" />
                ) : (
                  <img src={withBase(product?.image ?? '')} alt="" className="h-20 w-16 shrink-0 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <p className="font-serif text-xl leading-tight">{product?.name}</p>
                  {product?.size && <p className="text-xs text-muted">{product.size}</p>}
                  {line.meta?.valueCents && <p className="text-xs text-muted">Wert {formatEuro(Number(line.meta.valueCents))} · digital</p>}
                  {line.meta?.recipient && <p className="text-xs text-muted">für {line.meta.recipient}</p>}
                  <div className="mt-2 flex items-center gap-1">
                    <button className="grid h-9 w-9 place-items-center rounded-full border border-line" onClick={() => update(i, line.quantity - 1)} aria-label="Weniger">
                      <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <span className="w-8 text-center text-sm">{line.quantity}</span>
                    <button className="grid h-9 w-9 place-items-center rounded-full border border-line" onClick={() => update(i, line.quantity + 1)} aria-label="Mehr">
                      <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <button className="ml-auto grid h-9 w-9 place-items-center rounded-full text-muted hover:text-danger" onClick={() => remove(i)} aria-label="Entfernen">
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                <p className="text-sm">{formatEuro(unitPrice(line, product) * line.quantity)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
