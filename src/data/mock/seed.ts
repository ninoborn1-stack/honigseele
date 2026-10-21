// Seed für den MockAdapter: Inhalte aus content/ plus realistische Demo-Termine relativ zu "heute".
import * as content from '@/content';
import { findSlots, type SlotContext } from '@/domain/slots';
import { addDaysToDate, addMinutes, berlinDate, berlinToISO, weekdayOf } from '@/domain/time';
import type {
  Booking,
  ContentBlock,
  Course,
  CourseSession,
  Customer,
  Order,
  Package,
  Product,
  PunchCard,
  Room,
  Service,
  Session,
  Settings,
  Staff,
  StaffService,
  Ticket,
  TimeOff,
  Voucher,
  WorkingHours,
  Category,
} from '@/domain/types';
import type { CartLine, Inquiry } from '../adapter';

export interface MockDB {
  version: number;
  seededAt: string;
  session: Session | null;
  categories: Category[];
  services: Service[];
  staff: Staff[];
  staffServices: StaffService[];
  packages: Package[];
  rooms: Room[];
  workingHours: WorkingHours[];
  timeOff: TimeOff[];
  bookings: Booking[];
  customers: Customer[];
  courses: Course[];
  sessions: CourseSession[];
  tickets: Ticket[];
  punchCards: PunchCard[];
  products: Product[];
  orders: Order[];
  vouchers: Voucher[];
  blocks: ContentBlock[];
  settings: Settings;
  subscribers: string[];
  inquiries: Inquiry[];
  cart: CartLine[];
  prefs: Record<string, unknown>;
}

export const DB_VERSION = 1;

/** Deterministischer Zufall, damit der Seed bei jedem Reset gleich aussieht */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export const DEMO_CUSTOMER_ID = 'kundin-lena';
export const DEMO_STAFF_ID = 'anna';

const customers: Customer[] = [
  { id: DEMO_CUSTOMER_ID, firstName: 'Lena', lastName: 'Sommer', email: 'lena@example.com', phone: '+49 170 0000001', student: false, newsletter: true, laserConsultationDone: false, createdAt: '2024-03-12T10:00:00.000Z' },
  { id: 'kundin-mira', firstName: 'Mira', lastName: 'Okafor', email: 'mira@example.com', phone: '+49 170 0000002', laserConsultationDone: true, createdAt: '2025-01-20T10:00:00.000Z' },
  { id: 'kundin-sophie', firstName: 'Sophie', lastName: 'Brandt', email: 'sophie@example.com', student: true, createdAt: '2025-06-02T10:00:00.000Z' },
  { id: 'kundin-jonas', firstName: 'Jonas', lastName: 'Weber', email: 'jonas@example.com', createdAt: '2025-08-14T10:00:00.000Z' },
];

export function createSeed(now: Date = new Date()): MockDB {
  const rand = rng(20261021);
  const today = berlinDate(now);
  const settings = structuredClone(content.site.settings);

  const db: MockDB = {
    version: DB_VERSION,
    seededAt: now.toISOString(),
    session: null,
    categories: structuredClone(content.categories),
    services: structuredClone(content.services),
    staff: structuredClone(content.staff),
    staffServices: structuredClone(content.staffServices),
    packages: structuredClone(content.packages),
    rooms: structuredClone(content.rooms),
    workingHours: structuredClone(content.workingHours),
    timeOff: [],
    bookings: [],
    customers: structuredClone(customers),
    courses: structuredClone(content.courses),
    sessions: [],
    tickets: [],
    punchCards: [],
    products: structuredClone(content.products),
    orders: [],
    vouchers: [],
    blocks: structuredClone(content.site.blocks),
    settings,
    subscribers: ['lena@example.com'],
    inquiries: [],
    cart: [],
    prefs: {},
  };

  // Abwesenheiten: Urlaub, Pause, Treatwell-Block
  db.timeOff.push(
    { id: 'off-anna-urlaub', staffId: 'anna', start: berlinToISO(addDaysToDate(today, 15), '00:00'), end: berlinToISO(addDaysToDate(today, 20), '23:59'), reason: 'urlaub', note: 'Herbsturlaub' },
    { id: 'off-jamilah-tw', staffId: 'jamilah', start: berlinToISO(addDaysToDate(today, 2), '14:00'), end: berlinToISO(addDaysToDate(today, 2), '15:00'), reason: 'treatwell', note: 'Treatwell-Buchung' },
  );

  // Demo-Termine der nächsten 3 Wochen (ca. 40 % Auslastung)
  const ctx = (): SlotContext => ({
    services: db.services,
    staffServices: db.staffServices,
    workingHours: db.workingHours,
    timeOff: db.timeOff,
    bookings: db.bookings,
    rooms: db.rooms,
    roomTypeOf: (s) => db.categories.find((c) => c.id === s.categoryId)?.roomType ?? 'kabine',
    bufferMin: settings.bufferMin,
    stepMin: settings.slotStepMin,
  });
  const popular = [
    'waxing-d-beine-komplett', 'waxing-d-achseln', 'waxing-d-bikini-inkl-pofalte', 'waxing-d-intim-komplett-inkl-pofalte',
    'waxing-h-ruecken-komplett', 'laser-d-achseln', 'laser-d-beine-komplett', 'gesicht-zeit-fuer-dich',
    'meer-die-kraft-der-algen', 'massage-klassische-massage-60', 'massage-hot-stone-massage-90',
    'mp-spa-pedikuere', 'mp-klassische-manikuere-mit-lack', 'augen-lash-lifting-faerben-pflege',
    'koerper-brasilianische-lymphdrainage', 'paket-deine-kleine-auszeit',
  ];
  const others = customers.filter((c) => c.id !== DEMO_CUSTOMER_ID);
  let n = 0;
  for (let d = 0; d < 21; d++) {
    const date = addDaysToDate(today, d);
    if (weekdayOf(date) === 7) continue;
    const perDay = 6 + Math.floor(rand() * 8);
    for (let k = 0; k < perDay; k++) {
      const serviceId = popular[Math.floor(rand() * popular.length)];
      const slots = findSlots(ctx(), { date, serviceIds: [serviceId], notBefore: now });
      if (slots.length === 0) continue;
      const slot = slots[Math.floor(rand() * slots.length)];
      const customer = others[Math.floor(rand() * others.length)];
      db.bookings.push(makeBooking(`b-seed-${++n}`, customer.id, slot.items, now, rand() < 0.15 ? 'treatwell' : 'web'));
    }
  }

  // Lena: ein Termin in < 24 Std. (Storno kostet 50 %), einer in 5 Tagen (kostenlos), zwei vergangene
  const soon = new Date(now.getTime() + 20 * 3_600_000);
  soon.setUTCMinutes(0, 0, 0);
  const soonIso = soon.toISOString();
  db.bookings.push(
    makeBooking('b-lena-bald', DEMO_CUSTOMER_ID, [
      { serviceId: 'massage-aromaoel-massage-60', staffId: 'elsa', roomId: 'massage-2', start: soonIso, end: addMinutes(soonIso, 60), priceCents: 8500 },
    ], now, 'web'),
  );
  const in5 = addDaysToDate(today, weekdayOf(addDaysToDate(today, 5)) === 7 ? 6 : 5);
  const lenaSlot = findSlots(ctx(), { date: in5, serviceIds: ['waxing-d-beine-komplett', 'waxing-d-achseln'], staffId: 'anna' })[0]
    ?? findSlots(ctx(), { date: in5, serviceIds: ['waxing-d-beine-komplett', 'waxing-d-achseln'] })[0];
  if (lenaSlot) db.bookings.push(makeBooking('b-lena-waxing', DEMO_CUSTOMER_ID, lenaSlot.items, now, 'web'));
  for (const [id, daysAgo, serviceId, staffId, roomId, price] of [
    ['b-lena-alt-1', 26, 'gesicht-zeit-fuer-dich', 'asita', 'kabine-1', 7500],
    ['b-lena-alt-2', 58, 'waxing-d-beine-komplett', 'anna', 'kabine-2', 4400],
  ] as const) {
    const start = berlinToISO(addDaysToDate(today, -daysAgo), '11:00');
    const duration = db.services.find((s) => s.id === serviceId)!.durationMin;
    const b = makeBooking(id, DEMO_CUSTOMER_ID, [{ serviceId, staffId, roomId, start, end: addMinutes(start, duration), priceCents: price }], now, 'web');
    b.status = 'abgeschlossen';
    b.createdAt = addMinutes(start, -60 * 24 * 7);
    db.bookings.push(b);
  }

  // Kurstermine aus dem Wochenplan
  let s = 0;
  for (const course of db.courses) {
    for (let d = 0; d < 21; d++) {
      const date = addDaysToDate(today, d);
      for (const entry of course.schedule) {
        if (weekdayOf(date) !== entry.weekday) continue;
        if (course.monthly && d > 6) continue;
        if (course.biweekly && d > 6 && d < 14) continue;
        const start = berlinToISO(date, entry.time);
        if (new Date(start) < now) continue;
        const full = rand() < 0.18;
        db.sessions.push({
          id: `ks-${++s}`,
          courseId: course.id,
          start,
          end: addMinutes(start, course.durationMin),
          capacity: course.capacity,
          booked: full ? course.capacity : Math.floor(rand() * course.capacity * 0.8),
          roomId: course.kind === 'workshop' && course.id.startsWith('lets-just-walk') ? 'kursraum' : 'kursraum',
        });
      }
    }
  }

  // Gutscheine
  const inOneYear = addDaysToDate(today, 365);
  db.vouchers.push(
    { code: 'HONIG50', kind: 'allgemein', initialCents: 5000, remainingCents: 5000, validUntil: inOneYear, status: 'aktiv', createdAt: now.toISOString() },
    { code: 'SOMMER2024', kind: 'allgemein', initialCents: 3000, remainingCents: 3000, validUntil: '2025-12-31', status: 'aktiv', createdAt: '2024-06-01T10:00:00.000Z' },
    { code: 'HS-LENA-2026', kind: 'kosmetik', initialCents: 10000, remainingCents: 3500, validUntil: inOneYear, customerId: DEMO_CUSTOMER_ID, recipient: 'Lena', message: 'Für Dich, alles Liebe – Deine Schwester', status: 'aktiv', createdAt: '2026-05-10T10:00:00.000Z' },
  );

  // Lena: Yoga-10er-Karte und ein Ticket
  db.punchCards.push({ id: 'karte-lena', customerId: DEMO_CUSTOMER_ID, size: 10, remaining: 7, validUntil: addDaysToDate(today, 120), createdAt: '2026-08-01T10:00:00.000Z' });
  const yoga = db.sessions.find((x) => x.courseId === 'yoga-kati' && x.booked < x.capacity);
  if (yoga) {
    yoga.booked += 1;
    db.tickets.push({ id: 'ticket-lena-1', sessionId: yoga.id, customerId: DEMO_CUSTOMER_ID, paidWith: 'karte', punchCardId: 'karte-lena', status: 'gueltig', createdAt: now.toISOString() });
  }

  // Bestellungen
  db.orders.push(
    {
      id: 'order-1', number: 'HS-10421', customerId: DEMO_CUSTOMER_ID,
      items: [
        { productId: 'aloe-vera-gel', name: 'Aloe Vera Gel', quantity: 2, unitCents: 1290 },
        { productId: 'lippenbalsam', name: 'Lippenbalsam', quantity: 1, unitCents: 990 },
      ],
      subtotalCents: 3570, shippingCents: 300, voucherCents: 0, totalCents: 3870, status: 'versendet',
      payment: { method: 'paypal', status: 'bezahlt' },
      shippingAddress: { name: 'Lena Sommer', street: 'Musterstraße 12', zip: '10965', city: 'Berlin' },
      createdAt: addMinutes(now.toISOString(), -60 * 24 * 9),
    },
    {
      id: 'order-2', number: 'HS-10422', customerId: 'kundin-mira',
      items: [{ productId: 'jungbrunnen-serum', name: 'Jungbrunnen Serum', quantity: 1, unitCents: 2490 }],
      subtotalCents: 2490, shippingCents: 300, voucherCents: 0, totalCents: 2790, status: 'bezahlt',
      payment: { method: 'karte', status: 'bezahlt' },
      shippingAddress: { name: 'Mira Okafor', street: 'Oranienstraße 5', zip: '10999', city: 'Berlin' },
      createdAt: addMinutes(now.toISOString(), -60 * 5),
    },
  );

  db.inquiries.push({ id: 'inq-1', kind: 'raum-mieten', name: 'Clara Neumann', email: 'clara@example.com', message: 'Ich bin Masseurin und suche einen Raum dienstags und donnerstags.', createdAt: addMinutes(now.toISOString(), -60 * 30) });

  return db;
}

export function makeBooking(
  id: string,
  customerId: string,
  items: Booking['items'],
  now: Date,
  source: Booking['source'],
): Booking {
  const total = items.reduce((sum, i) => sum + i.priceCents, 0);
  return {
    id,
    customerId,
    locationId: content.site.location.id,
    items,
    start: items[0].start,
    end: items[items.length - 1].end,
    totalCents: total,
    discountCents: 0,
    voucherCents: 0,
    status: 'bestaetigt',
    payment: source === 'treatwell'
      ? { mode: 'vorab', method: 'vor-ort', status: 'offen', paidCents: 0 }
      : { mode: 'vorab', method: 'karte', status: 'bezahlt', paidCents: total },
    source,
    createdAt: now.toISOString(),
  };
}
