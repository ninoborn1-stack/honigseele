import { describe, expect, it } from 'vitest';
import { MockAdapter } from './mock-adapter';
import { DEMO_CUSTOMER_ID } from './seed';
import { addDaysToDate, berlinDate, weekdayOf } from '@/domain/time';

describe('MockAdapter', () => {
  it('erzeugt Seed-Daten mit Terminen, Kursen und Gutscheinen', async () => {
    const db = new MockAdapter();
    expect((await db.listBookings()).length).toBeGreaterThan(30);
    expect((await db.listSessions()).length).toBeGreaterThan(10);
    expect((await db.checkVoucher('HONIG50', 8000)).ok).toBe(true);
    expect(await db.checkVoucher('SOMMER2024', 8000)).toEqual({ ok: false, reason: 'abgelaufen' });
  });

  it('bucht einen freien Slot, löst den Gutschein ein und blockiert den Slot danach', async () => {
    const db = new MockAdapter();
    // Nächster Tag, an dem Anna arbeitet und noch etwas frei ist
    let date = berlinDate(new Date());
    let slot;
    for (let i = 2; i < 14 && !slot; i++) {
      date = addDaysToDate(berlinDate(new Date()), i);
      if (weekdayOf(date) === 7) continue;
      [slot] = await db.findSlots({ date, serviceIds: ['waxing-d-beine-komplett'], staffId: 'anna' });
    }
    if (!slot) throw new Error('kein Slot');
    expect(slot).toBeDefined();
    const booking = await db.createBooking({
      customer: { firstName: 'Test', lastName: 'Kundin', email: 'test@example.com' },
      items: slot.items,
      discountCents: 0,
      voucherCode: 'honig50',
      payment: { mode: 'vorab', method: 'karte' },
      source: 'web',
    });
    expect(booking.voucherCents).toBe(4400);
    expect(booking.payment.method).toBe('gutschein');
    const voucher = (await db.listVouchers()).find((v) => v.code === 'HONIG50')!;
    expect(voucher.remainingCents).toBe(600);
    const again = await db.findSlots({ date, serviceIds: ['waxing-d-beine-komplett'], staffId: 'anna' });
    expect(again.some((s) => s.start === slot.start)).toBe(false);
    await expect(
      db.createBooking({ customer: { firstName: 'X', lastName: 'Y', email: 'x@example.com' }, items: slot.items, discountCents: 0, payment: { mode: 'vorab', method: 'karte' }, source: 'web' }),
    ).rejects.toThrow();
  });

  it('berechnet bei kurzfristiger Storno 50 % Gebühr', async () => {
    const db = new MockAdapter();
    const soon = (await db.listBookings({ customerId: DEMO_CUSTOMER_ID })).find((b) => b.id === 'b-lena-bald')!;
    const cancelled = await db.cancelBooking(soon.id, 'kundin');
    expect(cancelled.status).toBe('storniert');
    expect(cancelled.cancellation?.feeCents).toBe(Math.round(soon.totalCents / 2));
  });

  it('verkauft Gutscheine als einlösbare Codes', async () => {
    const db = new MockAdapter();
    const order = await db.createOrder({
      customer: { firstName: 'Ida', lastName: 'Rose', email: 'ida@example.com' },
      items: [{ productId: 'gutschein', name: 'Gutschein', quantity: 1, unitCents: 7500, meta: { recipient: 'Mama' } }],
      shippingCents: 0,
      paymentMethod: 'paypal',
    });
    const code = order.items[0].meta?.code;
    expect(code).toMatch(/^HS-/);
    const check = await db.checkVoucher(code!, 10000);
    expect(check.ok && check.applicableCents).toBe(7500);
  });
});
