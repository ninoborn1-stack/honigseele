// Zustand und abgeleitete Werte des Buchungs-Flows (ohne UI).
import { laserDiscountPercent, quote } from '@/domain/pricing';
import type { Slot } from '@/domain/slots';
import type { PaymentMethod, PaymentMode, Service, StaffService } from '@/domain/types';

export const STEPS = ['Leistung', 'Anbieterin', 'Termin', 'Daten', 'Zahlung', 'Fertig'] as const;
export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5;

export interface BookingDraft {
  serviceIds: string[];
  /** undefined = egal, erste Freie */
  staffId?: string;
  reduced: boolean;
  date?: string;
  slot?: Slot;
  customer?: { firstName: string; lastName: string; email: string; phone?: string; id?: string };
  note?: string;
  payMode: PaymentMode;
  payMethod: PaymentMethod;
  voucherCode?: string;
  voucherCents: number;
  bookingId?: string;
}

export const emptyDraft: BookingDraft = {
  serviceIds: [],
  reduced: false,
  payMode: 'vorab',
  payMethod: 'karte',
  voucherCents: 0,
};

/** Preis vor Termin-Wahl (Basis bzw. gewählte Anbieterin) */
export function draftQuote(draft: BookingDraft, services: Service[], staffServices: StaffService[]) {
  const selected = draft.serviceIds
    .map((id) => services.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s))
    .map((service) => ({ service, staffId: draft.staffId }));
  return quote(selected, staffServices, { reduced: draft.reduced });
}

/** Endpreis aus dem gewählten Slot (Preise der zugeteilten Anbieterinnen) */
export function slotTotals(slot: Slot, services: Service[]) {
  const subtotal = slot.items.reduce((s, i) => s + i.priceCents, 0);
  const laserItems = slot.items.filter((i) => services.find((s) => s.id === i.serviceId)?.laserZone);
  const percent = laserDiscountPercent(laserItems.length);
  const discount = Math.round((laserItems.reduce((s, i) => s + i.priceCents, 0) * percent) / 100);
  return { subtotal, discount, percent, total: subtotal - discount };
}

/** Anbieterinnen, die ALLE gewählten Leistungen anbieten */
export function staffForAll(serviceIds: string[], staffServices: StaffService[]): string[] {
  if (serviceIds.length === 0) return [];
  const sets = serviceIds.map((id) => new Set(staffServices.filter((r) => r.serviceId === id).map((r) => r.staffId)));
  return [...sets[0]].filter((staffId) => sets.every((s) => s.has(staffId)));
}
