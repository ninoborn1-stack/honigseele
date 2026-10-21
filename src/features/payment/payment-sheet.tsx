'use client';
// Simulierte Zahlung im Stripe-Look. In Produktion: Stripe Payment Element + Webhook (Supabase Edge Function).
import { CreditCard, Loader2, Lock } from 'lucide-react';
import { useState } from 'react';
import { Drawer } from '@/components/ui/drawer';
import type { PaymentMethod } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatEuro } from '@/lib/format';

export const payMethods: { id: PaymentMethod; label: string; hint: string }[] = [
  { id: 'karte', label: 'Karte', hint: 'Visa, Mastercard, Amex' },
  { id: 'paypal', label: 'PayPal', hint: 'Weiterleitung zu PayPal' },
  { id: 'klarna', label: 'Klarna', hint: 'Jetzt oder später bezahlen' },
  { id: 'applepay', label: 'Apple Pay', hint: 'Mit Face ID / Touch ID' },
];

export function PaymentSheet({
  open,
  onClose,
  amountCents,
  method,
  mode = 'vorab',
  onPaid,
}: {
  open: boolean;
  onClose: () => void;
  amountCents: number;
  method: PaymentMethod;
  mode?: 'vorab' | 'karte-hinterlegt';
  onPaid: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const label = payMethods.find((m) => m.id === method)?.label ?? 'Karte';
  const pay = async () => {
    setBusy(true);
    setError('');
    await new Promise((r) => setTimeout(r, 1300));
    try {
      await onPaid();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Zahlung fehlgeschlagen.');
      setBusy(false);
    }
  };
  return (
    <Drawer open={open} onClose={busy ? () => undefined : onClose} title={mode === 'vorab' ? 'Bezahlen' : 'Karte hinterlegen'} side="bottom">
      <div className="mx-auto max-w-md pb-4">
        <div className="rounded-2xl border border-[#e3e8ee] bg-white p-5 font-sans text-[#30313d] shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Honigseele</span>
            <span className="rounded bg-[#f6f9fc] px-2 py-0.5 text-[0.68rem] font-medium uppercase tracking-wider text-[#6a7383]">Testmodus</span>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight">{formatEuro(mode === 'vorab' ? amountCents : 0)}</p>
          {mode === 'karte-hinterlegt' && <p className="text-xs text-[#6a7383]">Es wird nichts abgebucht. Nur bei später Absage oder Nichterscheinen.</p>}
          {method === 'karte' && (
            <div className="mt-5 space-y-3 text-sm">
              <div className="rounded-md border border-[#e3e8ee] px-3 py-2.5">
                <p className="text-xs text-[#6a7383]">Kartennummer</p>
                <p className="flex items-center justify-between font-mono tracking-wider">
                  4242 4242 4242 4242 <CreditCard className="h-4 w-4 text-[#6a7383]" strokeWidth={1.5} />
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-[#e3e8ee] px-3 py-2.5">
                  <p className="text-xs text-[#6a7383]">Ablauf</p>
                  <p className="font-mono">12 / 29</p>
                </div>
                <div className="rounded-md border border-[#e3e8ee] px-3 py-2.5">
                  <p className="text-xs text-[#6a7383]">CVC</p>
                  <p className="font-mono">123</p>
                </div>
              </div>
            </div>
          )}
          {method !== 'karte' && (
            <p className="mt-5 rounded-md bg-[#f6f9fc] px-3 py-4 text-sm text-[#6a7383]">
              Du würdest jetzt zu {label} weitergeleitet. In der Demo bestätigen wir direkt.
            </p>
          )}
          <button
            onClick={pay}
            disabled={busy}
            className={cn('mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-md text-[0.95rem] font-semibold text-white transition-colors', method === 'klarna' ? 'bg-[#17120f]' : method === 'paypal' ? 'bg-[#0070ba]' : 'bg-[#635bff] hover:bg-[#5249e0]')}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
            {busy ? 'Wird verarbeitet …' : mode === 'vorab' ? `${formatEuro(amountCents)} mit ${label} bezahlen` : `${label} sicher hinterlegen`}
          </button>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          <p className="mt-4 text-center text-[0.68rem] text-[#6a7383]">Simulierte Zahlung · keine echten Daten · später Stripe</p>
        </div>
      </div>
    </Drawer>
  );
}
