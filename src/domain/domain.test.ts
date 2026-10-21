import { describe, expect, it } from 'vitest';
import { cancellationQuote } from './cancellation';
import { laserDiscountPercent, priceFor, priceRange, quote } from './pricing';
import { findSlots, laserGate, type SlotContext } from './slots';
import { berlinToISO, berlinTime, weekdayOf } from './time';
import { checkVoucher, generateVoucherCode, redeem } from './vouchers';
import type { Booking, Room, Service, StaffService, Voucher } from './types';

const svc = (id: string, priceEur: number, durationMin: number, extra: Partial<Service> = {}): Service => ({
  id,
  categoryId: 'waxing',
  name: id,
  durationMin,
  priceCents: priceEur * 100,
  audience: 'alle',
  bookable: true,
  active: true,
  ...extra,
});

describe('Preise', () => {
  const spa = svc('spa-pedi', 57, 60);
  const rows: StaffService[] = [
    { staffId: 'nadine', serviceId: 'spa-pedi' },
    { staffId: 'justyna', serviceId: 'spa-pedi', priceCents: 5800 },
  ];

  it('nimmt den Preis je Anbieterin, sonst den Basispreis', () => {
    expect(priceFor(spa, 'justyna', rows).priceCents).toBe(5800);
    expect(priceFor(spa, 'nadine', rows).priceCents).toBe(5700);
    expect(priceFor(spa, undefined, rows).priceCents).toBe(5700);
    expect(priceRange(spa, rows)).toEqual({ min: 5700, max: 5800 });
  });

  it('nutzt den ermäßigten Preis nur, wenn vorhanden', () => {
    const ach = svc('achseln', 15, 10, { reducedPriceCents: 1300 });
    expect(priceFor(ach, undefined, [], { reduced: true }).priceCents).toBe(1300);
    expect(priceFor(svc('kinn', 12, 10), undefined, [], { reduced: true }).priceCents).toBe(1200);
  });

  it('gibt Laser-Rabatt ab 2 Zonen 10 %, ab 3 Zonen 20 %', () => {
    expect(laserDiscountPercent(1)).toBe(0);
    expect(laserDiscountPercent(2)).toBe(10);
    expect(laserDiscountPercent(3)).toBe(20);
    expect(laserDiscountPercent(5)).toBe(20);
    const z = (id: string, eur: number) => ({ service: svc(id, eur, 15, { laserZone: true }) });
    const q2 = quote([z('a', 49), z('b', 79)], []);
    expect(q2.discountCents).toBe(1280);
    expect(q2.totalCents).toBe(11520);
    const q3 = quote([z('a', 49), z('b', 79), z('c', 199)], []);
    expect(q3.totalCents).toBe(26160);
  });

  it('rabattiert nur Laser-Zonen, nicht Ganzkörper oder Waxing', () => {
    const q = quote(
      [
        { service: svc('ganz', 499, 150) },
        { service: svc('achs', 49, 15, { laserZone: true }) },
      ],
      [],
    );
    expect(q.discountCents).toBe(0);
    expect(q.durationMin).toBe(165);
  });
});

describe('Storno', () => {
  const policy = { freeUntilHours: 24, feePercent: 50 };
  const booking = (startIso: string, paid: number) =>
    ({
      start: startIso,
      totalCents: 8000,
      payment: { mode: 'vorab', method: 'karte', status: 'bezahlt', paidCents: paid },
    }) as Pick<Booking, 'start' | 'totalCents' | 'payment'>;
  const now = new Date('2026-10-21T10:00:00Z');

  it('ist bis 24 Std. vorher kostenlos', () => {
    const q = cancellationQuote(booking('2026-10-22T10:00:00Z', 8000), policy, now);
    expect(q.free).toBe(true);
    expect(q.feeCents).toBe(0);
    expect(q.refundCents).toBe(8000);
  });

  it('berechnet danach 50 %', () => {
    const q = cancellationQuote(booking('2026-10-22T09:59:00Z', 8000), policy, now);
    expect(q.free).toBe(false);
    expect(q.feeCents).toBe(4000);
    expect(q.refundCents).toBe(4000);
  });

  it('belastet bei hinterlegter Karte die Gebühr', () => {
    const q = cancellationQuote(booking('2026-10-21T15:00:00Z', 0), policy, now);
    expect(q.chargeCents).toBe(4000);
    expect(q.refundCents).toBe(0);
  });
});

describe('Gutscheine', () => {
  const vouchers: Voucher[] = [
    { code: 'HONIG50', kind: 'allgemein', initialCents: 5000, remainingCents: 5000, validUntil: '2027-12-31', status: 'aktiv', createdAt: '' },
    { code: 'ALT2024', kind: 'allgemein', initialCents: 3000, remainingCents: 3000, validUntil: '2025-12-31', status: 'aktiv', createdAt: '' },
  ];

  it('akzeptiert gültige Codes unabhängig von Schreibweise', () => {
    const r = checkVoucher(vouchers, ' honig50 ', 8000, '2026-10-21');
    expect(r.ok && r.applicableCents).toBe(5000);
  });

  it('deckelt auf den Betrag', () => {
    const r = checkVoucher(vouchers, 'HONIG50', 1500, '2026-10-21');
    expect(r.ok && r.applicableCents).toBe(1500);
  });

  it('lehnt abgelaufene und unbekannte ab', () => {
    expect(checkVoucher(vouchers, 'ALT2024', 1000, '2026-10-21')).toEqual({ ok: false, reason: 'abgelaufen' });
    expect(checkVoucher(vouchers, 'NOPE', 1000, '2026-10-21')).toEqual({ ok: false, reason: 'unbekannt' });
  });

  it('behält den Restwert', () => {
    const { voucher, usedCents } = redeem(vouchers[0], 1500);
    expect(usedCents).toBe(1500);
    expect(voucher.remainingCents).toBe(3500);
    expect(voucher.status).toBe('aktiv');
    expect(redeem(voucher, 9999).voucher.status).toBe('eingeloest');
  });

  it('erzeugt lesbare Codes', () => {
    expect(generateVoucherCode()).toMatch(/^HS-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });
});

describe('Slots', () => {
  // 2026-10-26 ist ein Montag
  const date = '2026-10-26';
  const rooms: Room[] = [{ id: 'k1', name: 'K1', type: 'kabine' }];
  const services = [svc('achseln', 15, 10), svc('beine', 44, 30)];
  const base: SlotContext = {
    services,
    staffServices: [
      { staffId: 'anna', serviceId: 'achseln' },
      { staffId: 'anna', serviceId: 'beine' },
      { staffId: 'juli', serviceId: 'beine' },
    ],
    workingHours: [
      { staffId: 'anna', weekday: 1, start: '10:00', end: '12:00' },
      { staffId: 'juli', weekday: 1, start: '11:00', end: '13:00' },
    ],
    timeOff: [],
    bookings: [],
    rooms,
    roomTypeOf: () => 'kabine',
    bufferMin: 10,
    stepMin: 15,
  };

  it('rechnet in Berliner Zeit', () => {
    expect(weekdayOf(date)).toBe(1);
    expect(berlinTime(berlinToISO(date, '10:00'))).toBe('10:00');
  });

  it('legt Slots in die Arbeitszeit und respektiert die Dauer', () => {
    const slots = findSlots(base, { date, serviceIds: ['achseln', 'beine'], staffId: 'anna' });
    expect(berlinTime(slots[0].start)).toBe('10:00');
    // 40 Min. müssen bis 12:00 passen → letzter Start 11:15
    expect(berlinTime(slots.at(-1)!.start)).toBe('11:15');
    expect(slots[0].items.map((i) => i.serviceId)).toEqual(['achseln', 'beine']);
  });

  it('blockt bestehende Buchungen inkl. Puffer und Raum', () => {
    const booking: Booking = {
      id: 'b1',
      customerId: 'c',
      locationId: 'kreuzberg',
      items: [
        { serviceId: 'beine', staffId: 'juli', roomId: 'k1', start: berlinToISO(date, '10:30'), end: berlinToISO(date, '11:00'), priceCents: 4400 },
      ],
      start: berlinToISO(date, '10:30'),
      end: berlinToISO(date, '11:00'),
      totalCents: 4400,
      discountCents: 0,
      voucherCents: 0,
      status: 'bestaetigt',
      payment: { mode: 'vorab', method: 'karte', status: 'bezahlt', paidCents: 4400 },
      source: 'web',
      createdAt: '',
    };
    const slots = findSlots({ ...base, bookings: [booking] }, { date, serviceIds: ['achseln'], staffId: 'anna' });
    const times = slots.map((s) => berlinTime(s.start));
    // Raum k1 belegt 10:30–11:10 (inkl. Puffer)
    expect(times).toContain('10:15');
    expect(times).not.toContain('10:30');
    expect(times).not.toContain('11:00');
    expect(times).toContain('11:15');
  });

  it('wählt bei "egal" jede passende Anbieterin', () => {
    const slots = findSlots(base, { date, serviceIds: ['beine'] });
    const last = slots.at(-1)!;
    expect(berlinTime(last.start)).toBe('12:30');
    expect(last.items[0].staffId).toBe('juli');
  });

  it('respektiert Abwesenheiten', () => {
    const slots = findSlots(
      { ...base, timeOff: [{ id: 't', staffId: 'anna', start: berlinToISO(date, '10:00'), end: berlinToISO(date, '12:00'), reason: 'urlaub' }] },
      { date, serviceIds: ['achseln'], staffId: 'anna' },
    );
    expect(slots).toHaveLength(0);
  });

  it('verlangt beim Laser ein Vorgespräch', () => {
    const zone = svc('achseln-laser', 49, 15, { requiresConsultation: true });
    expect(laserGate([zone], false).ok).toBe(false);
    expect(laserGate([zone], true).ok).toBe(true);
    expect(laserGate([svc('x', 1, 1)], false).ok).toBe(true);
  });
});
