'use client';
// Kasse: Warenkorb → Kontakt (+ Lieferadresse bei Pflegeprodukten) → Gutschein → Zahlung → Bestätigung.
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Gift, Mail, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ButtonLink, Button } from '@/components/ui/button';
import { Checkbox, Field, Input } from '@/components/ui/form';
import { Eyebrow, Title } from '@/components/ui/typography';
import { products as contentProducts, site } from '@/content';
import { getAdapter } from '@/data';
import { voucherMessages } from '@/domain/vouchers';
import type { Order, PaymentMethod, Voucher } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatEuro } from '@/lib/format';
import { useData, useSession } from '@/lib/use-data';
import { PaymentSheet, payMethods } from '../payment/payment-sheet';
import { unitPrice, useCart } from './cart';
import { ProductVisual } from './product-visual';
import { VoucherCard } from './voucher-card';
import { withBase } from '@/lib/config';

const contactSchema = z.object({
  firstName: z.string().trim().min(1, 'Bitte gib Deinen Vornamen an.'),
  lastName: z.string().trim().min(1, 'Bitte gib Deinen Nachnamen an.'),
  email: z.string().trim().email('Bitte prüf Deine E-Mail-Adresse.'),
  street: z.string().trim().optional(),
  zip: z.string().trim().optional(),
  city: z.string().trim().optional(),
});
type Contact = z.infer<typeof contactSchema>;

const shippingSchema = contactSchema.extend({
  street: z.string().trim().min(3, 'Bitte gib Straße und Hausnummer an.'),
  zip: z.string().trim().regex(/^\d{5}$/, 'Bitte eine fünfstellige PLZ.'),
  city: z.string().trim().min(2, 'Bitte gib den Ort an.'),
});

export function Checkout() {
  const { lines } = useCart();
  const { data: products = contentProducts } = useData((db) => db.listProducts(), [], contentProducts);
  const { session } = useSession();
  const { data: customer = null } = useData((db) => (session?.customerId ? db.getCustomer(session.customerId) : Promise.resolve(null)), [session?.customerId], null);

  const [order, setOrder] = useState<Order | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  const rows = lines.map((l) => ({ line: l, product: products.find((p) => p.id === l.productId) }));
  const needsShipping = rows.some((r) => r.product?.kind === 'pflege');
  const subtotal = rows.reduce((s, r) => s + unitPrice(r.line, r.product) * r.line.quantity, 0);
  const shipping = needsShipping ? site.shipping.flatCents : 0;

  const [code, setCode] = useState('');
  const [voucher, setVoucher] = useState<{ code: string; cents: number } | null>(null);
  const [voucherMsg, setVoucherMsg] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('karte');
  const [accepted, setAccepted] = useState(false);
  const [paying, setPaying] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);

  const due = Math.max(0, subtotal + shipping - (voucher?.cents ?? 0));

  const { register, handleSubmit, reset, formState } = useForm<Contact>({
    resolver: zodResolver(needsShipping ? shippingSchema : contactSchema),
  });
  useEffect(() => {
    if (customer) reset({ firstName: customer.firstName, lastName: customer.lastName, email: customer.email });
  }, [customer, reset]);

  // Gutschein neu prüfen, wenn sich der Betrag ändert
  useEffect(() => {
    if (!voucher) return;
    getAdapter()
      .checkVoucher(voucher.code, subtotal + shipping)
      .then((r) => r.ok && r.applicableCents !== voucher.cents && setVoucher({ code: voucher.code, cents: r.applicableCents }));
  }, [subtotal, shipping, voucher]);

  const applyVoucher = async () => {
    const r = await getAdapter().checkVoucher(code, subtotal + shipping);
    if (r.ok) {
      setVoucher({ code: r.voucher.code, cents: r.applicableCents });
      setVoucherMsg(`${formatEuro(r.applicableCents)} werden angerechnet. Restwert danach: ${formatEuro(r.voucher.remainingCents - r.applicableCents)}.`);
    } else {
      setVoucher(null);
      setVoucherMsg(voucherMessages[r.reason]);
    }
  };

  const placeOrder = async (c: Contact) => {
    const created = await getAdapter().createOrder({
      customer: { firstName: c.firstName, lastName: c.lastName, email: c.email, id: customer?.id },
      items: rows.map(({ line, product }) => ({
        productId: line.productId,
        name: product?.name ?? line.productId,
        quantity: line.quantity,
        unitCents: unitPrice(line, product),
        ...(line.meta ? { meta: { ...line.meta } } : {}),
      })),
      shippingCents: shipping,
      voucherCode: voucher?.code,
      paymentMethod: due === 0 ? 'gutschein' : method,
      shippingAddress: needsShipping && c.street ? { name: `${c.firstName} ${c.lastName}`, street: c.street, zip: c.zip ?? '', city: c.city ?? '' } : undefined,
    });
    const codes = created.items.map((i) => i.meta?.code).filter(Boolean);
    const all = codes.length ? await getAdapter().listVouchers(created.customerId) : [];
    setVouchers(all.filter((v) => codes.includes(v.code)));
    setOrder(created);
    setPaying(false);
    window.scrollTo({ top: 0 });
  };

  const onSubmit = handleSubmit((c) => {
    setContact(c);
    if (due === 0) void placeOrder(c);
    else setPaying(true);
  });

  if (order) return <Confirmation order={order} vouchers={vouchers} />;

  if (lines.length === 0)
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-cream-100 text-amber-800">
          <ShoppingBag className="h-8 w-8" strokeWidth={1.5} />
        </span>
        <h1 className="mt-8 text-5xl">
          Dein Warenkorb ist noch <em>leer</em>.
        </h1>
        <p className="mt-4 text-muted">Stöber in unserer Pflegeserie oder verschenk ein bisschen Zeit.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/shop/">Zum Shop</ButtonLink>
          <ButtonLink href="/shop/gutscheine/" variant="ghost">
            Gutschein gestalten
          </ButtonLink>
        </div>
      </div>
    );

  return (
    <div className="wrap pb-32 pt-10 md:pb-28 md:pt-16">
      <Eyebrow>Kasse</Eyebrow>
      <Title as="h1" className="mt-6">Fast *geschafft*.</Title>
      <form onSubmit={onSubmit} noValidate className="mt-14 grid gap-12 md:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div className="min-w-0 space-y-10">
          <fieldset>
            <legend className="eyebrow mb-4">Kontakt</legend>
            {!session && (
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm">
                  <span className="font-medium">Schon Kundin?</span> <span className="text-muted">Dann ist alles ausgefüllt.</span>
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={() => getAdapter().loginAs('kundin')}>
                  Demo-Login als Lena
                </Button>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Vorname" error={formState.errors.firstName?.message}>
                <Input autoComplete="given-name" {...register('firstName')} />
              </Field>
              <Field label="Nachname" error={formState.errors.lastName?.message}>
                <Input autoComplete="family-name" {...register('lastName')} />
              </Field>
              <Field label="E-Mail" error={formState.errors.email?.message} className="sm:col-span-2" hint="Hierhin schicken wir Bestätigung und Gutscheincodes.">
                <Input type="email" inputMode="email" autoComplete="email" {...register('email')} />
              </Field>
            </div>
          </fieldset>

          {needsShipping && (
            <fieldset>
              <legend className="eyebrow mb-4">Lieferadresse</legend>
              <div className="grid gap-4 sm:grid-cols-[1fr_8rem_1fr]">
                <Field label="Straße & Hausnummer" error={formState.errors.street?.message} className="sm:col-span-3">
                  <Input autoComplete="street-address" {...register('street')} />
                </Field>
                <Field label="PLZ" error={formState.errors.zip?.message}>
                  <Input inputMode="numeric" autoComplete="postal-code" {...register('zip')} />
                </Field>
                <Field label="Ort" error={formState.errors.city?.message} className="sm:col-span-2">
                  <Input autoComplete="address-level2" {...register('city')} />
                </Field>
              </div>
              <p className="mt-3 text-xs text-muted">{site.shipping.label}: {formatEuro(site.shipping.flatCents)}. Gutscheine und Karten kommen digital.</p>
            </fieldset>
          )}

          <div>
            <p className="eyebrow mb-3 flex items-center gap-2">
              <Gift className="h-3.5 w-3.5" strokeWidth={1.5} /> Gutschein
            </p>
            <div className="flex gap-2">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="z. B. HONIG50" className="uppercase" aria-label="Gutscheincode" />
              <Button type="button" variant="ghost" onClick={applyVoucher} disabled={!code.trim()}>
                Einlösen
              </Button>
            </div>
            {voucherMsg && <p className={cn('mt-2 text-sm', voucher ? 'text-success' : 'text-danger')}>{voucherMsg}</p>}
          </div>

          {due > 0 && (
            <fieldset>
              <legend className="eyebrow mb-3">Zahlungsart</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {payMethods.map((m) => (
                  <button key={m.id} type="button" onClick={() => setMethod(m.id)} aria-pressed={method === m.id} className={cn('min-h-16 rounded-xl border px-3 text-left text-sm', method === m.id ? 'border-honey-950 bg-card' : 'border-line')}>
                    <span className="block font-medium">{m.label}</span>
                    <span className="text-xs text-muted">{m.hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="rounded-2xl bg-cream-100 p-5 text-sm">
            <Checkbox
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              label={
                <>
                  Ich habe die{' '}
                  <a href={withBase('/agb/')} target="_blank" rel="noreferrer" className="underline">
                    AGB
                  </a>{' '}
                  und die{' '}
                  <a href={withBase('/widerruf/')} target="_blank" rel="noreferrer" className="underline">
                    Widerrufsbelehrung
                  </a>{' '}
                  gelesen. Bei digitalen Gutscheinen stimme ich zu, dass sie sofort ausgestellt werden.
                </>
              }
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!accepted}>
            {due === 0 ? 'Zahlungspflichtig bestellen' : `Zahlungspflichtig bestellen · ${formatEuro(due)}`}
          </Button>
        </div>

        <aside className="md:order-none order-first">
          <div className="rounded-[2rem] border border-line bg-card p-6 md:sticky md:top-[calc(var(--top-h,96px)+1rem)] lg:p-8">
            <p className="eyebrow">Deine Bestellung</p>
            <ul className="mt-4 divide-y divide-line-soft">
              {rows.map(({ line, product }, i) => (
                <li key={i} className="flex gap-4 py-4">
                  {product && product.kind === 'pflege' ? (
                    <ProductVisual product={product} className="h-16 w-14 shrink-0 rounded-lg [&_span]:hidden" />
                  ) : (
                    <img src={withBase(product?.image ?? '')} alt="" className="h-16 w-14 shrink-0 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-serif text-lg leading-tight">{product?.name}</p>
                    <p className="text-xs text-muted">
                      {line.quantity} × {formatEuro(unitPrice(line, product))}
                      {line.meta?.recipient && ` · für ${line.meta.recipient}`}
                    </p>
                  </div>
                  <p className="text-sm">{formatEuro(unitPrice(line, product) * line.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-2 border-t border-line-soft pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Zwischensumme</dt>
                <dd>{formatEuro(subtotal)}</dd>
              </div>
              {needsShipping && (
                <div className="flex justify-between">
                  <dt className="text-muted">Versand</dt>
                  <dd>{formatEuro(shipping)}</dd>
                </div>
              )}
              {voucher && (
                <div className="flex justify-between text-success">
                  <dt>Gutschein {voucher.code}</dt>
                  <dd>−{formatEuro(voucher.cents)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line-soft pt-3 font-serif text-2xl">
                <dt>Gesamt</dt>
                <dd>{formatEuro(due)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted">inkl. MwSt.</p>
          </div>
        </aside>
      </form>

      <PaymentSheet
        open={paying}
        onClose={() => setPaying(false)}
        amountCents={due}
        method={method}
        onPaid={async () => {
          if (contact) await placeOrder(contact);
        }}
      />
    </div>
  );
}

function Confirmation({ order, vouchers }: { order: Order; vouchers: Voucher[] }) {
  const titles: Record<string, string> = { allgemein: 'Gutschein', kosmetik: 'Gutschein Kosmetik', 'pediküre': 'Gutschein Pediküre' };
  return (
    <div className="mx-auto max-w-3xl px-5 pb-32 pt-14 text-center md:pb-24">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-honey-950 text-honey-300">
        <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
      </span>
      <h1 className="mt-8 text-5xl">
        Danke für Deine <em>Bestellung</em>.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        Bestellnummer <span className="font-medium text-honey-950">{order.number}</span>. Die Bestätigung ist unterwegs zu Dir.
      </p>

      {vouchers.length > 0 && (
        <div className="mx-auto mt-12 max-w-md space-y-5 text-left">
          <p className="eyebrow text-center">{vouchers.length === 1 ? 'Dein Gutschein' : 'Deine Gutscheine'}</p>
          {vouchers.map((v) => (
            <VoucherCard key={v.code} title={titles[v.kind] ?? 'Gutschein'} valueCents={v.initialCents} recipient={v.recipient} message={v.message} code={v.code} validUntil={new Date(v.validUntil).toLocaleDateString('de-DE')} />
          ))}
        </div>
      )}

      <div className="mx-auto mt-12 max-w-md rounded-[2rem] border border-line bg-card p-6 text-left">
        <ul className="space-y-2 text-sm">
          {order.items.map((i, n) => (
            <li key={n} className="flex justify-between gap-4">
              <span>
                {i.quantity} × {i.name}
                {i.meta?.code && <span className="block font-mono text-xs text-amber-800">{i.meta.code}</span>}
              </span>
              <span>{formatEuro(i.unitCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-line-soft pt-4 text-sm">
          {order.shippingCents > 0 && (
            <div className="flex justify-between text-muted">
              <dt>Versand</dt>
              <dd>{formatEuro(order.shippingCents)}</dd>
            </div>
          )}
          {order.voucherCents > 0 && (
            <div className="flex justify-between text-success">
              <dt>Gutschein</dt>
              <dd>−{formatEuro(order.voucherCents)}</dd>
            </div>
          )}
          <div className="flex justify-between font-serif text-2xl">
            <dt>Bezahlt</dt>
            <dd>{formatEuro(order.totalCents)}</dd>
          </div>
        </dl>
        {order.shippingAddress && (
          <p className="mt-4 text-xs text-muted">
            Lieferung an {order.shippingAddress.name}, {order.shippingAddress.street}, {order.shippingAddress.zip} {order.shippingAddress.city}
          </p>
        )}
      </div>

      <div className="mx-auto mt-8 grid max-w-md gap-3 sm:grid-cols-2">
        <ButtonLink href={`/demo/mails/?bestellung=${order.id}`} variant="ghost">
          <Mail className="h-4 w-4" strokeWidth={1.5} /> Mail ansehen
        </ButtonLink>
        <ButtonLink href="/konto/">Zu meinem Konto</ButtonLink>
      </div>
      <Link href="/shop/" className="mt-8 inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-4">
        Weiter einkaufen
      </Link>
    </div>
  );
}
