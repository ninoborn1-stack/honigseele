// Storno-Regel: bis X Stunden vorher kostenlos, danach Y % der Ursprungssumme.
import type { Booking, Cents, Settings } from './types';

export interface CancellationQuote {
  free: boolean;
  hoursBefore: number;
  feeCents: Cents;
  refundCents: Cents;
  /** Bei hinterlegter Karte: Betrag, der belastet wird */
  chargeCents: Cents;
}

export function cancellationQuote(
  booking: Pick<Booking, 'start' | 'totalCents' | 'payment'>,
  policy: Settings['cancellation'],
  now: Date = new Date(),
): CancellationQuote {
  const hoursBefore = (new Date(booking.start).getTime() - now.getTime()) / 3_600_000;
  const free = hoursBefore >= policy.freeUntilHours;
  const feeCents = free ? 0 : Math.round((booking.totalCents * policy.feePercent) / 100);
  const paid = booking.payment.paidCents;
  return {
    free,
    hoursBefore,
    feeCents,
    refundCents: Math.max(0, paid - feeCents),
    chargeCents: Math.max(0, feeCents - paid),
  };
}

export function policyText(policy: Settings['cancellation']): string {
  return `Kostenlos stornieren bis ${policy.freeUntilHours} Stunden vor Deinem Termin. Danach berechnen wir ${policy.feePercent} % des Preises.`;
}
