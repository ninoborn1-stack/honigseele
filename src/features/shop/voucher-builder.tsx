'use client';
import { Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/form';
import { Eyebrow, Title } from '@/components/ui/typography';
import { products as contentProducts, site } from '@/content';
import { cn } from '@/lib/cn';
import { formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { useCart } from './cart';
import { Tilt } from './tilt';
import { VoucherCard } from './voucher-card';

const QUICK_EUR = [25, 50, 80, 100, 150];

export function VoucherBuilder() {
  const params = useSearchParams();
  const { data: products = contentProducts } = useData((db) => db.listProducts(), [], contentProducts);
  const kinds = products.filter((p) => p.kind === 'gutschein' && p.active);
  const { add } = useCart();
  const { minCents, maxCents, validYears } = site.voucher;

  const preset = kinds.find((k) => k.id === params.get('art'));
  const [kindId, setKindId] = useState(preset?.id ?? 'gutschein');
  const kind = kinds.find((k) => k.id === kindId) ?? kinds[0];
  const [amount, setAmount] = useState(String((kind?.priceCents ?? 5000) / 100));
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [added, setAdded] = useState(false);

  const valueCents = Math.round(Number(amount.replace(',', '.')) * 100);
  const valid = Number.isFinite(valueCents) && valueCents >= minCents && valueCents <= maxCents;

  const submit = () => {
    if (!valid || !kind) return;
    add({
      productId: kind.id,
      quantity: 1,
      meta: { valueCents: String(valueCents), ...(recipient.trim() ? { recipient: recipient.trim() } : {}), ...(message.trim() ? { message: message.trim() } : {}) },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <section className="honey-light">
      <div className="wrap grid gap-14 pb-28 pt-10 lg:grid-cols-[1fr_1.05fr] lg:gap-24 lg:pt-16">
        <div>
          <Eyebrow>Gutscheine</Eyebrow>
          <Title as="h1" className="mt-8">Schenk ein bisschen *Honigseele*.</Title>
          <p className="mt-8 max-w-md text-lg text-muted">
            Digital per E-Mail, {validYears} Jahre gültig, einlösbar für Behandlungen, Kurse und Produkte – auch direkt bei der Online-Buchung. Restwerte bleiben erhalten.
          </p>

          <fieldset className="mt-10">
            <legend className="eyebrow mb-3">Art</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {kinds.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKindId(k.id)}
                  aria-pressed={kindId === k.id}
                  className={cn('min-h-14 rounded-xl border px-4 text-left text-sm transition-colors', kindId === k.id ? 'border-honey-950 bg-card' : 'border-line hover:border-honey-950')}
                >
                  {k.name}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="eyebrow mb-3">Betrag</legend>
            <div className="flex flex-wrap gap-2">
              {QUICK_EUR.map((eur) => (
                <button
                  key={eur}
                  type="button"
                  onClick={() => setAmount(String(eur))}
                  className={cn('min-h-11 min-w-16 rounded-full border px-4 text-sm transition-colors', valueCents === eur * 100 ? 'border-honey-950 bg-honey-950 text-cream-50' : 'border-line hover:border-honey-950')}
                >
                  {formatEuro(eur * 100)}
                </button>
              ))}
            </div>
            <Field
              label="Oder eigener Betrag in €"
              className="mt-4 max-w-xs"
              error={amount && !valid ? `Bitte zwischen ${formatEuro(minCents)} und ${formatEuro(maxCents)}.` : undefined}
              hint={`${formatEuro(minCents)} bis ${formatEuro(maxCents)}`}
            >
              <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} aria-invalid={!valid} />
            </Field>
          </fieldset>

          <div className="mt-8 grid gap-4">
            <Field label="Für wen? (optional)">
              <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} maxLength={40} placeholder="z. B. Mama" />
            </Field>
            <Field label="Persönliche Nachricht (optional)" hint={`${message.length}/160`}>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={160} placeholder="Für eine kleine Auszeit nur für Dich." />
            </Field>
          </div>

          <Button size="lg" className="mt-10 w-full sm:w-auto" disabled={!valid} onClick={submit}>
            {added ? <Check className="h-4 w-4" strokeWidth={2} /> : null}
            {added ? 'Im Warenkorb' : `In den Warenkorb · ${valid ? formatEuro(valueCents) : '–'}`}
          </Button>
        </div>

        <div className="lg:sticky lg:top-[calc(var(--top-h,96px)+2rem)] lg:self-start">
          <div className="honey-glow rounded-[2.5rem] p-6 sm:p-10 lg:p-14">
            <p className="eyebrow mb-8 !text-honey-300">Live-Vorschau</p>
            <Tilt>
              <VoucherCard title={kind?.name ?? 'Gutschein'} valueCents={valid ? valueCents : 0} recipient={recipient.trim() || undefined} message={message.trim() || undefined} className="shadow-2xl shadow-black/40 ring-1 ring-honey-300/35" />
            </Tilt>
          </div>
          <p className="mt-5 text-sm text-muted">Den Code erhältst Du nach dem Kauf per E-Mail und in Deinem Konto. Du kannst den Gutschein ausdrucken oder weiterleiten.</p>
        </div>
      </div>
    </section>
  );
}
