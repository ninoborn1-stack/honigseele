// MockAdapter: hält die komplette Demo-Datenbank im localStorage des Browsers.
// Nur diese Datei darf localStorage benutzen.
import { cancellationQuote } from '@/domain/cancellation';
import { findSlots, type SlotContext } from '@/domain/slots';
import { berlinDate } from '@/domain/time';
import { checkVoucher, normalizeCode, redeem } from '@/domain/vouchers';
import type { Booking, Customer, Order, Voucher } from '@/domain/types';
import type { DataAdapter, Inquiry, NewBooking, NewOrder } from '../adapter';
import { createSeed, DB_VERSION, DEMO_CUSTOMER_ID, DEMO_STAFF_ID, type MockDB } from './seed';

const KEY = 'honigseele-demo';
const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const clone = <T>(v: T): T => structuredClone(v);

export class MockAdapter implements DataAdapter {
  private db: MockDB | null = null;
  private listeners = new Set<() => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      // Änderungen aus anderen Tabs übernehmen
      window.addEventListener('storage', (e) => {
        if (e.key === KEY) {
          this.db = null;
          this.emit();
        }
      });
    }
  }

  private load(): MockDB {
    if (this.db) return this.db;
    if (typeof window === 'undefined') return (this.db = createSeed());
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? (JSON.parse(raw) as MockDB) : null;
      if (parsed && parsed.version === DB_VERSION) return (this.db = parsed);
    } catch {
      // kaputter oder blockierter Speicher → frischer Seed
    }
    this.db = createSeed();
    this.persist();
    return this.db;
  }

  private persist() {
    if (typeof window === 'undefined' || !this.db) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(this.db));
    } catch {
      // Speicher voll oder privat: Demo läuft im Speicher weiter
    }
  }

  private write<T>(fn: (db: MockDB) => T): T {
    const result = fn(this.load());
    this.persist();
    this.emit();
    return clone(result);
  }

  private read<T>(fn: (db: MockDB) => T): Promise<T> {
    return Promise.resolve(clone(fn(this.load())));
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async reset() {
    this.db = createSeed();
    this.persist();
    this.emit();
  }

  // ---------- Sitzung ----------
  getSession() {
    return this.read((db) => db.session);
  }
  async loginAs(role: 'kundin' | 'team') {
    return this.write((db) => {
      if (role === 'team') {
        const anna = db.staff.find((s) => s.id === DEMO_STAFF_ID)!;
        db.session = { role, staffId: anna.id, name: `${anna.name} (Team)` };
      } else {
        const lena = db.customers.find((c) => c.id === DEMO_CUSTOMER_ID)!;
        db.session = { role, customerId: lena.id, name: lena.firstName };
      }
      return db.session;
    });
  }
  async logout() {
    this.write((db) => {
      db.session = null;
    });
  }

  // ---------- Katalog ----------
  listCategories() {
    return this.read((db) => db.categories);
  }
  listServices() {
    return this.read((db) => db.services);
  }
  async saveService(service: Parameters<DataAdapter['saveService']>[0]) {
    return this.write((db) => {
      const i = db.services.findIndex((s) => s.id === service.id);
      if (i >= 0) db.services[i] = service;
      else db.services.push(service);
      return service;
    });
  }
  async deleteService(id: string) {
    this.write((db) => {
      db.services = db.services.filter((s) => s.id !== id);
      db.staffServices = db.staffServices.filter((r) => r.serviceId !== id);
    });
  }
  listStaff() {
    return this.read((db) => db.staff);
  }
  async saveStaff(staff: Parameters<DataAdapter['saveStaff']>[0]) {
    return this.write((db) => {
      const i = db.staff.findIndex((s) => s.id === staff.id);
      if (i >= 0) db.staff[i] = staff;
      else db.staff.push(staff);
      return staff;
    });
  }
  listStaffServices() {
    return this.read((db) => db.staffServices);
  }
  async setStaffServices(serviceId: string, rows: Parameters<DataAdapter['setStaffServices']>[1]) {
    this.write((db) => {
      db.staffServices = [...db.staffServices.filter((r) => r.serviceId !== serviceId), ...rows];
    });
  }
  listPackages() {
    return this.read((db) => db.packages);
  }
  listRooms() {
    return this.read((db) => db.rooms);
  }

  // ---------- Kalender ----------
  listWorkingHours() {
    return this.read((db) => db.workingHours);
  }
  async setWorkingHours(staffId: string, rows: Parameters<DataAdapter['setWorkingHours']>[1]) {
    this.write((db) => {
      db.workingHours = [...db.workingHours.filter((w) => w.staffId !== staffId), ...rows];
    });
  }
  listTimeOff() {
    return this.read((db) => db.timeOff);
  }
  async addTimeOff(entry: Parameters<DataAdapter['addTimeOff']>[0]) {
    return this.write((db) => {
      const row = { ...entry, id: uid('off') };
      db.timeOff.push(row);
      return row;
    });
  }
  async removeTimeOff(id: string) {
    this.write((db) => {
      db.timeOff = db.timeOff.filter((t) => t.id !== id);
    });
  }

  private slotContext(db: MockDB): SlotContext {
    return {
      services: db.services,
      staffServices: db.staffServices,
      workingHours: db.workingHours,
      timeOff: db.timeOff,
      bookings: db.bookings,
      rooms: db.rooms,
      roomTypeOf: (s) => db.categories.find((c) => c.id === s.categoryId)?.roomType ?? 'kabine',
      bufferMin: db.settings.bufferMin,
      stepMin: db.settings.slotStepMin,
    };
  }

  findSlots(req: Parameters<DataAdapter['findSlots']>[0]) {
    return this.read((db) => findSlots(this.slotContext(db), req));
  }

  // ---------- Buchungen ----------
  listBookings(filter: { customerId?: string; from?: string; to?: string } = {}) {
    return this.read((db) =>
      db.bookings
        .filter((b) => !filter.customerId || b.customerId === filter.customerId)
        .filter((b) => !filter.from || b.end >= filter.from)
        .filter((b) => !filter.to || b.start <= filter.to)
        .sort((a, b) => a.start.localeCompare(b.start)),
    );
  }
  getBooking(id: string) {
    return this.read((db) => db.bookings.find((b) => b.id === id) ?? null);
  }

  private upsertCustomer(db: MockDB, input: NewBooking['customer']): Customer {
    const existing =
      (input.id && db.customers.find((c) => c.id === input.id)) ||
      db.customers.find((c) => c.email.toLowerCase() === input.email.toLowerCase());
    if (existing) return existing;
    const customer: Customer = {
      id: uid('kundin'),
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      createdAt: new Date().toISOString(),
    };
    db.customers.push(customer);
    return customer;
  }

  private applyVoucher(db: MockDB, code: string | undefined, amount: number): number {
    if (!code) return 0;
    const check = checkVoucher(db.vouchers, code, amount, berlinDate(new Date()));
    if (!check.ok) throw new Error('Gutschein ungültig');
    const { voucher, usedCents } = redeem(check.voucher, amount);
    db.vouchers = db.vouchers.map((v) => (v.code === voucher.code ? voucher : v));
    return usedCents;
  }

  async createBooking(input: NewBooking): Promise<Booking> {
    return this.write((db) => {
      // Doppelbuchung verhindern: Slot erneut prüfen
      const first = input.items[0];
      const stillFree = findSlots(this.slotContext(db), {
        date: berlinDate(first.start),
        serviceIds: input.items.map((i) => i.serviceId),
        staffId: input.items.every((i) => i.staffId === first.staffId) ? first.staffId : undefined,
      }).some((s) => s.start === first.start);
      if (!stillFree) throw new Error('Dieser Termin ist gerade vergeben worden. Bitte wähle einen anderen.');

      const customer = this.upsertCustomer(db, input.customer);
      const subtotal = input.items.reduce((sum, i) => sum + i.priceCents, 0);
      const afterDiscount = subtotal - input.discountCents;
      const voucherCents = this.applyVoucher(db, input.voucherCode, afterDiscount);
      const due = afterDiscount - voucherCents;
      const prepaid = input.payment.mode === 'vorab';
      const booking: Booking = {
        id: uid('b'),
        customerId: customer.id,
        locationId: 'kreuzberg',
        items: input.items,
        start: first.start,
        end: input.items[input.items.length - 1].end,
        totalCents: afterDiscount,
        discountCents: input.discountCents,
        voucherCode: input.voucherCode ? normalizeCode(input.voucherCode) : undefined,
        voucherCents,
        status: 'bestaetigt',
        payment: {
          mode: input.payment.mode,
          method: voucherCents > 0 && due === 0 ? 'gutschein' : input.payment.method,
          status: prepaid || due === 0 ? 'bezahlt' : 'autorisiert',
          paidCents: prepaid ? afterDiscount : voucherCents,
        },
        note: input.note,
        source: input.source,
        createdAt: new Date().toISOString(),
      };
      // Laser-Vorgespräch gebucht → Folgesitzung wird freigeschaltet (im echten Betrieb nach dem Termin durch das Team)
      if (input.items.some((i) => db.services.find((s) => s.id === i.serviceId)?.isConsultation)) {
        customer.laserConsultationDone = true;
      }
      db.bookings.push(booking);
      if (!db.session) db.session = { role: 'kundin', customerId: customer.id, name: customer.firstName };
      return booking;
    });
  }

  async cancelBooking(id: string, by: 'kundin' | 'team') {
    return this.write((db) => {
      const booking = db.bookings.find((b) => b.id === id);
      if (!booking) throw new Error('Termin nicht gefunden');
      const q = cancellationQuote(booking, db.settings.cancellation);
      // Team storniert immer kulant
      const feeCents = by === 'team' ? 0 : q.feeCents;
      const refundCents = Math.max(0, booking.payment.paidCents - feeCents);
      booking.status = 'storniert';
      booking.cancellation = { at: new Date().toISOString(), feeCents, refundCents, by };
      booking.payment.status = feeCents === 0 ? 'erstattet' : 'teilweise-erstattet';
      return booking;
    });
  }

  async rescheduleBooking(id: string, slot: Parameters<DataAdapter['rescheduleBooking']>[1]) {
    return this.write((db) => {
      const booking = db.bookings.find((b) => b.id === id);
      if (!booking) throw new Error('Termin nicht gefunden');
      booking.items = slot.items.map((item, i) => ({
        ...item,
        priceCents: booking.items[i]?.priceCents ?? item.priceCents,
      }));
      booking.start = slot.start;
      booking.end = slot.end;
      return booking;
    });
  }

  // ---------- Kundinnen ----------
  getCustomer(id: string) {
    return this.read((db) => db.customers.find((c) => c.id === id) ?? null);
  }
  listCustomers() {
    return this.read((db) => db.customers);
  }
  async saveCustomer(customer: Customer) {
    return this.write((db) => {
      db.customers = db.customers.map((c) => (c.id === customer.id ? customer : c));
      if (db.session?.customerId === customer.id) db.session.name = customer.firstName;
      return customer;
    });
  }

  // ---------- Kurse ----------
  listCourses() {
    return this.read((db) => db.courses);
  }
  async saveCourse(course: Parameters<DataAdapter['saveCourse']>[0]) {
    return this.write((db) => {
      const i = db.courses.findIndex((c) => c.id === course.id);
      if (i >= 0) db.courses[i] = course;
      else db.courses.push(course);
      return course;
    });
  }
  listSessions(filter: { from?: string; to?: string; courseId?: string } = {}) {
    return this.read((db) =>
      db.sessions
        .filter((s) => !filter.courseId || s.courseId === filter.courseId)
        .filter((s) => !filter.from || s.start >= filter.from)
        .filter((s) => !filter.to || s.start <= filter.to)
        .sort((a, b) => a.start.localeCompare(b.start)),
    );
  }
  async saveSession(session: Parameters<DataAdapter['saveSession']>[0]) {
    return this.write((db) => {
      const i = db.sessions.findIndex((s) => s.id === session.id);
      if (i >= 0) db.sessions[i] = session;
      else db.sessions.push(session);
      return session;
    });
  }
  async bookTicket(input: { sessionId: string; customerId: string; punchCardId?: string }) {
    return this.write((db) => {
      const session = db.sessions.find((s) => s.id === input.sessionId);
      if (!session) throw new Error('Termin nicht gefunden');
      if (session.booked >= session.capacity) throw new Error('Dieser Termin ist leider ausgebucht.');
      if (input.punchCardId) {
        const card = db.punchCards.find((c) => c.id === input.punchCardId);
        if (!card || card.remaining <= 0) throw new Error('Auf dieser Karte ist kein Eintritt mehr frei.');
        card.remaining -= 1;
      }
      session.booked += 1;
      const ticket = {
        id: uid('ticket'),
        sessionId: session.id,
        customerId: input.customerId,
        paidWith: input.punchCardId ? ('karte' as const) : ('einzel' as const),
        punchCardId: input.punchCardId,
        status: 'gueltig' as const,
        createdAt: new Date().toISOString(),
      };
      db.tickets.push(ticket);
      return ticket;
    });
  }
  listTickets(customerId?: string) {
    return this.read((db) => db.tickets.filter((t) => !customerId || t.customerId === customerId));
  }
  async cancelTicket(id: string) {
    return this.write((db) => {
      const ticket = db.tickets.find((t) => t.id === id);
      if (!ticket) throw new Error('Ticket nicht gefunden');
      ticket.status = 'storniert';
      const session = db.sessions.find((s) => s.id === ticket.sessionId);
      if (session) session.booked = Math.max(0, session.booked - 1);
      const card = ticket.punchCardId && db.punchCards.find((c) => c.id === ticket.punchCardId);
      if (card) card.remaining += 1;
      return ticket;
    });
  }
  listPunchCards(customerId?: string) {
    return this.read((db) => db.punchCards.filter((c) => !customerId || c.customerId === customerId));
  }

  // ---------- Shop ----------
  listProducts() {
    return this.read((db) => db.products);
  }
  async saveProduct(product: Parameters<DataAdapter['saveProduct']>[0]) {
    return this.write((db) => {
      const i = db.products.findIndex((p) => p.id === product.id);
      if (i >= 0) db.products[i] = product;
      else db.products.push(product);
      return product;
    });
  }
  async deleteProduct(id: string) {
    this.write((db) => {
      db.products = db.products.filter((p) => p.id !== id);
    });
  }
  async createOrder(input: NewOrder): Promise<Order> {
    return this.write((db) => {
      const customer = this.upsertCustomer(db, input.customer);
      const subtotal = input.items.reduce((sum, i) => sum + i.unitCents * i.quantity, 0);
      const voucherCents = this.applyVoucher(db, input.voucherCode, subtotal + input.shippingCents);
      const today = berlinDate(new Date());
      const [y, m, d] = today.split('-');
      const validUntil = `${Number(y) + 3}-${m}-${d}`;
      for (const item of input.items) {
        const product = db.products.find((p) => p.id === item.productId);
        if (!product) continue;
        if (product.kind === 'pflege') product.stock = Math.max(0, product.stock - item.quantity);
        // Gutschein-Kauf erzeugt einlösbare Codes
        if (product.kind === 'gutschein') {
          for (let q = 0; q < item.quantity; q++) {
            const code = `HS-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
            const voucher: Voucher = {
              code,
              kind: product.id === 'gutschein-kosmetik' ? 'kosmetik' : product.id === 'gutschein-pedikuere' ? 'pediküre' : 'allgemein',
              initialCents: item.unitCents,
              remainingCents: item.unitCents,
              validUntil,
              customerId: customer.id,
              recipient: item.meta?.recipient,
              message: item.meta?.message,
              status: 'aktiv',
              createdAt: new Date().toISOString(),
            };
            db.vouchers.push(voucher);
            item.meta = { ...item.meta, code };
          }
        }
        if (product.kind === 'karte') {
          const size = product.id.includes('10') ? 10 : 5;
          db.punchCards.push({
            id: uid('karte'),
            customerId: customer.id,
            size,
            remaining: size,
            validUntil: `${Number(y) + (size === 10 ? 1 : 0)}-${size === 10 ? m : String(((Number(m) + 3) % 12) + 1).padStart(2, '0')}-${d}`,
            createdAt: new Date().toISOString(),
          });
        }
      }
      const order: Order = {
        id: uid('order'),
        number: `HS-${10423 + db.orders.length}`,
        customerId: customer.id,
        items: input.items,
        subtotalCents: subtotal,
        shippingCents: input.shippingCents,
        voucherCents,
        totalCents: subtotal + input.shippingCents - voucherCents,
        status: 'bezahlt',
        payment: { method: input.paymentMethod, status: 'bezahlt' },
        shippingAddress: input.shippingAddress,
        createdAt: new Date().toISOString(),
      };
      db.orders.push(order);
      db.cart = [];
      if (!db.session) db.session = { role: 'kundin', customerId: customer.id, name: customer.firstName };
      return order;
    });
  }
  listOrders(customerId?: string) {
    return this.read((db) =>
      db.orders
        .filter((o) => !customerId || o.customerId === customerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }
  async setOrderStatus(id: string, status: Order['status']) {
    return this.write((db) => {
      const order = db.orders.find((o) => o.id === id);
      if (!order) throw new Error('Bestellung nicht gefunden');
      order.status = status;
      return order;
    });
  }
  getCart() {
    return this.read((db) => db.cart);
  }
  async setCart(lines: Parameters<DataAdapter['setCart']>[0]) {
    this.write((db) => {
      db.cart = lines;
    });
  }

  // ---------- Gutscheine ----------
  checkVoucher(code: string, amountCents: number) {
    return this.read((db) => checkVoucher(db.vouchers, code, amountCents, berlinDate(new Date())));
  }
  listVouchers(customerId?: string) {
    return this.read((db) =>
      db.vouchers
        .filter((v) => !customerId || v.customerId === customerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }
  async saveVoucher(voucher: Voucher) {
    return this.write((db) => {
      const v = { ...voucher, code: normalizeCode(voucher.code) };
      const i = db.vouchers.findIndex((x) => x.code === v.code);
      if (i >= 0) db.vouchers[i] = v;
      else db.vouchers.push(v);
      return v;
    });
  }

  // ---------- Inhalte ----------
  listBlocks() {
    return this.read((db) => db.blocks);
  }
  async saveBlock(block: Parameters<DataAdapter['saveBlock']>[0]) {
    return this.write((db) => {
      db.blocks = db.blocks.map((b) => (b.id === block.id ? block : b));
      return block;
    });
  }
  getSettings() {
    return this.read((db) => db.settings);
  }
  async saveSettings(settings: Parameters<DataAdapter['saveSettings']>[0]) {
    return this.write((db) => {
      db.settings = settings;
      return settings;
    });
  }

  // ---------- Kontakt ----------
  async subscribeNewsletter(email: string) {
    this.write((db) => {
      if (!db.subscribers.includes(email)) db.subscribers.push(email);
    });
  }
  listSubscribers() {
    return this.read((db) => db.subscribers);
  }
  async sendInquiry(input: Omit<Inquiry, 'id' | 'createdAt'>) {
    return this.write((db) => {
      const inquiry = { ...input, id: uid('inq'), createdAt: new Date().toISOString() };
      db.inquiries.push(inquiry);
      return inquiry;
    });
  }
  listInquiries() {
    return this.read((db) => db.inquiries);
  }

  // ---------- Geräte-Einstellungen ----------
  getPref<T>(key: string, fallback: T) {
    return this.read((db) => (key in db.prefs ? (db.prefs[key] as T) : fallback));
  }
  async setPref<T>(key: string, value: T) {
    this.write((db) => {
      db.prefs[key] = value;
    });
  }
}
