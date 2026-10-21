// Die einzige Tür zu Daten. Alle Methoden sind asynchron, damit der Tausch
// MockAdapter → SupabaseAdapter nur eine Datei betrifft.
import type { Slot, SlotRequest } from '@/domain/slots';
import type { VoucherCheck } from '@/domain/vouchers';
import type {
  Booking,
  BookingItem,
  Category,
  ContentBlock,
  Course,
  CourseSession,
  Customer,
  Order,
  OrderItem,
  OrderStatus,
  Package,
  PaymentMethod,
  PaymentMode,
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
} from '@/domain/types';

export interface NewBooking {
  customer: Pick<Customer, 'firstName' | 'lastName' | 'email' | 'phone'> & { id?: string };
  items: BookingItem[];
  discountCents: number;
  voucherCode?: string;
  payment: { mode: PaymentMode; method: PaymentMethod };
  note?: string;
  source: Booking['source'];
}

export interface NewOrder {
  customer: Pick<Customer, 'firstName' | 'lastName' | 'email'> & { id?: string };
  items: OrderItem[];
  shippingCents: number;
  voucherCode?: string;
  paymentMethod: PaymentMethod;
  shippingAddress?: Order['shippingAddress'];
}

export interface Inquiry {
  id: string;
  kind: 'raum-mieten' | 'kontakt' | 'job';
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
  /** Gutschein: Wert in Cent, Empfänger*in, Nachricht */
  meta?: Record<string, string>;
}

export interface DataAdapter {
  // Sitzung
  getSession(): Promise<Session | null>;
  loginAs(role: Session['role']): Promise<Session>;
  logout(): Promise<void>;

  // Katalog
  listCategories(): Promise<Category[]>;
  listServices(): Promise<Service[]>;
  saveService(service: Service): Promise<Service>;
  deleteService(id: string): Promise<void>;
  listStaff(): Promise<Staff[]>;
  saveStaff(staff: Staff): Promise<Staff>;
  listStaffServices(): Promise<StaffService[]>;
  setStaffServices(serviceId: string, rows: StaffService[]): Promise<void>;
  listPackages(): Promise<Package[]>;
  listRooms(): Promise<Room[]>;

  // Kalender
  listWorkingHours(): Promise<WorkingHours[]>;
  setWorkingHours(staffId: string, rows: WorkingHours[]): Promise<void>;
  listTimeOff(): Promise<TimeOff[]>;
  addTimeOff(entry: Omit<TimeOff, 'id'>): Promise<TimeOff>;
  removeTimeOff(id: string): Promise<void>;
  findSlots(req: SlotRequest): Promise<Slot[]>;

  // Buchungen
  listBookings(filter?: { customerId?: string; from?: string; to?: string }): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | null>;
  createBooking(input: NewBooking): Promise<Booking>;
  cancelBooking(id: string, by: 'kundin' | 'team'): Promise<Booking>;
  rescheduleBooking(id: string, slot: Slot): Promise<Booking>;

  // Kundinnen
  getCustomer(id: string): Promise<Customer | null>;
  listCustomers(): Promise<Customer[]>;
  saveCustomer(customer: Customer): Promise<Customer>;

  // Kurse
  listCourses(): Promise<Course[]>;
  saveCourse(course: Course): Promise<Course>;
  listSessions(filter?: { from?: string; to?: string; courseId?: string }): Promise<CourseSession[]>;
  saveSession(session: CourseSession): Promise<CourseSession>;
  bookTicket(input: {
    sessionId: string;
    customerId: string;
    punchCardId?: string;
  }): Promise<Ticket>;
  listTickets(customerId?: string): Promise<Ticket[]>;
  cancelTicket(id: string): Promise<Ticket>;
  listPunchCards(customerId?: string): Promise<PunchCard[]>;

  // Shop
  listProducts(): Promise<Product[]>;
  saveProduct(product: Product): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  createOrder(input: NewOrder): Promise<Order>;
  listOrders(customerId?: string): Promise<Order[]>;
  setOrderStatus(id: string, status: OrderStatus): Promise<Order>;
  getCart(): Promise<CartLine[]>;
  setCart(lines: CartLine[]): Promise<void>;

  // Gutscheine
  checkVoucher(code: string, amountCents: number): Promise<VoucherCheck>;
  listVouchers(customerId?: string): Promise<Voucher[]>;
  saveVoucher(voucher: Voucher): Promise<Voucher>;

  // Inhalte & Einstellungen
  listBlocks(): Promise<ContentBlock[]>;
  saveBlock(block: ContentBlock): Promise<ContentBlock>;
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<Settings>;

  // Kontakt
  subscribeNewsletter(email: string): Promise<void>;
  listSubscribers(): Promise<string[]>;
  sendInquiry(input: Omit<Inquiry, 'id' | 'createdAt'>): Promise<Inquiry>;
  listInquiries(): Promise<Inquiry[]>;

  // Geräte-Einstellungen (Sprache, gemerkte Auswahl)
  getPref<T>(key: string, fallback: T): Promise<T>;
  setPref<T>(key: string, value: T): Promise<void>;

  /** Änderungen beobachten (UI aktualisiert sich nach Schreibvorgängen) */
  subscribe(listener: () => void): () => void;

  /** Nur Demo: Seed-Daten wiederherstellen */
  reset(): Promise<void>;
}
