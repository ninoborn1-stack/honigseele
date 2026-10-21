// Preise: je Anbieterin, Ermäßigung, Laser-Mehrzonen-Rabatt.
import type { Cents, Service, StaffService } from './types';

export const LASER_DISCOUNT_TIERS = [
  { minZones: 3, percent: 20 },
  { minZones: 2, percent: 10 },
] as const;

/** Preis und Dauer einer Leistung bei einer bestimmten Anbieterin */
export function priceFor(
  service: Service,
  staffId: string | undefined,
  staffServices: StaffService[],
  opts: { reduced?: boolean } = {},
): { priceCents: Cents; durationMin: number } {
  const row = staffId
    ? staffServices.find((r) => r.staffId === staffId && r.serviceId === service.id)
    : undefined;
  const base = opts.reduced && service.reducedPriceCents ? service.reducedPriceCents : service.priceCents;
  return {
    priceCents: row?.priceCents ?? base,
    durationMin: row?.durationMin ?? service.durationMin,
  };
}

/** Spanne über alle Anbieterinnen, für Preislisten ("57–58 €") */
export function priceRange(service: Service, staffServices: StaffService[]): { min: Cents; max: Cents } {
  const prices = staffServices
    .filter((r) => r.serviceId === service.id)
    .map((r) => r.priceCents ?? service.priceCents);
  if (prices.length === 0) return { min: service.priceCents, max: service.priceCents };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function laserDiscountPercent(zoneCount: number): number {
  return LASER_DISCOUNT_TIERS.find((t) => zoneCount >= t.minZones)?.percent ?? 0;
}

export interface QuoteLine {
  serviceId: string;
  name: string;
  priceCents: Cents;
  durationMin: number;
}

export interface Quote {
  lines: QuoteLine[];
  subtotalCents: Cents;
  discountCents: Cents;
  discountLabel?: string;
  totalCents: Cents;
  durationMin: number;
}

/**
 * Angebot für eine Auswahl von Leistungen.
 * Laser: ab 2 Zonen 10 %, ab 3 Zonen 20 % auf die Laser-Zonen (nicht auf Ganzkörper/Vorgespräch).
 */
export function quote(
  selected: { service: Service; staffId?: string }[],
  staffServices: StaffService[],
  opts: { reduced?: boolean } = {},
): Quote {
  const lines = selected.map(({ service, staffId }) => ({
    serviceId: service.id,
    name: service.name,
    ...priceFor(service, staffId, staffServices, opts),
  }));
  const subtotalCents = lines.reduce((sum, l) => sum + l.priceCents, 0);
  const laserLines = selected.filter((s) => s.service.laserZone);
  const percent = laserDiscountPercent(laserLines.length);
  const laserSum = lines
    .filter((l) => selected.find((s) => s.service.id === l.serviceId)?.service.laserZone)
    .reduce((sum, l) => sum + l.priceCents, 0);
  const discountCents = Math.round((laserSum * percent) / 100);
  return {
    lines,
    subtotalCents,
    discountCents,
    discountLabel: percent ? `Laser-Mehrzonen-Rabatt ${percent} %` : undefined,
    totalCents: subtotalCents - discountCents,
    durationMin: lines.reduce((sum, l) => sum + l.durationMin, 0),
  };
}

export function formatEuro(cents: Cents, opts: { from?: boolean } = {}): string {
  const value = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
  return opts.from ? `ab ${value}` : value;
}
