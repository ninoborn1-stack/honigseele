// Datenmodell der Honigseele.
// Regeln: stabile IDs (Slugs/UUIDs = spätere DB-Primärschlüssel), Geld in Cent (Integer), Zeiten als ISO-Strings.

export type ID = string;
export type Cents = number;
export type ISODateTime = string; // 2026-10-21T14:30:00.000Z
export type ISODate = string; // 2026-10-21
export type Tone = 'honey' | 'cream' | 'amber' | 'sand' | 'sage';
export type Audience = 'damen' | 'herren' | 'alle';

export interface Location {
  id: ID;
  name: string;
  street: string;
  zip: string;
  city: string;
  timezone: string;
  /** Heute ein Standort. Später Retreat-Hof, Franchise. */
  kind: 'studio' | 'retreat' | 'franchise';
}

export interface Category {
  id: ID; // Slug, z. B. "waxing"
  name: string;
  eyebrow: string;
  teaser: string;
  intro: string;
  image: string;
  order: number;
  /** Raum-Typ, den Leistungen dieser Kategorie belegen */
  roomType: RoomType;
  /** In der Behandlungs-Übersicht zeigen (Coaching liegt unter Kurse & Coaching) */
  inTreatments: boolean;
  /** Für Bereiche, deren Inhalte noch fehlen */
  isPlaceholder?: boolean;
}

export interface ServiceExtra {
  id: ID;
  name: string;
  priceCents: Cents;
  durationMin: number;
}

export interface Service {
  id: ID;
  categoryId: ID;
  /** Untergruppe innerhalb der Kategorie, z. B. "Augen & Brauen" */
  group?: string;
  name: string;
  description?: string;
  durationMin: number;
  priceCents: Cents;
  /** "ab"-Preis anzeigen */
  priceFrom?: boolean;
  reducedPriceCents?: Cents;
  audience: Audience;
  requiresConsultation?: boolean;
  /** Laser-Zone, zählt für Mehrzonen-Rabatt */
  laserZone?: boolean;
  /** Vorgespräch selbst */
  isConsultation?: boolean;
  extras?: ID[];
  /** Variante einer Leistung, z. B. 30/60/90 Min. */
  variantOf?: ID;
  bookable: boolean;
  isPlaceholder?: boolean;
  active: boolean;
}

export interface Staff {
  id: ID;
  name: string;
  role: string;
  title?: string;
  bio: string;
  bioPlaceholder?: boolean;
  skills: string[];
  /** Initialen-Avatar, solange keine Fotos da sind */
  avatarTone: Tone;
  photo?: string;
  bookable: boolean;
  visible: boolean;
  languages: string[];
}

/** Preis und Dauer je Anbieterin. Ohne Eintrag gilt der Basispreis der Leistung. */
export interface StaffService {
  staffId: ID;
  serviceId: ID;
  priceCents?: Cents;
  durationMin?: number;
}

export type RoomType = 'kabine' | 'laser' | 'massage' | 'fuss' | 'kurs' | 'beratung';

export interface Room {
  id: ID;
  name: string;
  type: RoomType;
}

/** weekday: 1 = Montag … 7 = Sonntag (ISO) */
export interface WorkingHours {
  staffId: ID;
  weekday: number;
  start: string; // "10:00"
  end: string; // "18:00"
}

export interface TimeOff {
  id: ID;
  staffId: ID;
  start: ISODateTime;
  end: ISODateTime;
  reason: 'urlaub' | 'pause' | 'block' | 'treatwell';
  note?: string;
}

export type BookingStatus = 'bestaetigt' | 'storniert' | 'abgeschlossen' | 'nicht-erschienen';
export type PaymentMethod = 'karte' | 'paypal' | 'klarna' | 'applepay' | 'gutschein' | 'vor-ort';
export type PaymentMode = 'vorab' | 'karte-hinterlegt';
export type PaymentStatus = 'bezahlt' | 'autorisiert' | 'offen' | 'erstattet' | 'teilweise-erstattet';

export interface BookingItem {
  serviceId: ID;
  staffId: ID;
  roomId: ID;
  start: ISODateTime;
  end: ISODateTime;
  priceCents: Cents;
}

export interface Booking {
  id: ID;
  customerId: ID;
  locationId: ID;
  items: BookingItem[];
  start: ISODateTime;
  end: ISODateTime;
  totalCents: Cents;
  discountCents: Cents;
  voucherCode?: string;
  voucherCents: Cents;
  status: BookingStatus;
  payment: { mode: PaymentMode; method: PaymentMethod; status: PaymentStatus; paidCents: Cents };
  cancellation?: { at: ISODateTime; feeCents: Cents; refundCents: Cents; by: 'kundin' | 'team' };
  packageId?: ID;
  note?: string;
  source: 'web' | 'app' | 'team' | 'treatwell';
  createdAt: ISODateTime;
}

export interface Customer {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  /** Laser: Vorgespräch erledigt */
  laserConsultationDone?: boolean;
  student?: boolean;
  newsletter?: boolean;
  createdAt: ISODateTime;
}

export interface Package {
  id: ID;
  name: string;
  tagline: string;
  durationMin: number;
  priceCents: Cents;
  audience: 'alle' | 'paare' | 'kinder' | 'teens' | 'mamas' | 'braut';
  includes: string[];
  /** Leistungen nacheinander, für die Slot-Berechnung */
  steps: { label: string; durationMin: number; roomType: RoomType }[];
}

export interface Course {
  id: ID;
  name: string;
  kind: 'yoga' | 'workshop' | 'coaching' | 'schulung' | 'event';
  description: string;
  leaderId?: ID;
  leaderName: string;
  priceCents: Cents;
  durationMin: number;
  capacity: number;
  punchCardEligible: boolean;
  /** Wiederkehrender Plan, aus dem der Seed Termine erzeugt */
  schedule: { weekday: number; time: string }[];
  monthly?: boolean;
  biweekly?: boolean;
  isPlaceholder?: boolean;
}

export interface CourseSession {
  id: ID;
  courseId: ID;
  start: ISODateTime;
  end: ISODateTime;
  capacity: number;
  booked: number;
  roomId: ID;
}

export interface Ticket {
  id: ID;
  sessionId: ID;
  customerId: ID;
  paidWith: 'einzel' | 'karte';
  punchCardId?: ID;
  status: 'gueltig' | 'storniert' | 'eingecheckt';
  createdAt: ISODateTime;
}

export interface PunchCard {
  id: ID;
  customerId: ID;
  size: 5 | 10;
  remaining: number;
  validUntil: ISODate;
  createdAt: ISODateTime;
}

export interface Product {
  id: ID;
  name: string;
  size?: string;
  priceCents: Cents;
  description: string;
  usage?: string;
  ingredients?: string;
  image: string;
  tone: Tone;
  kind: 'pflege' | 'gutschein' | 'karte' | 'ticket';
  stock: number;
  active: boolean;
  isPlaceholder?: boolean;
}

export type OrderStatus = 'bezahlt' | 'versendet' | 'abgeschlossen' | 'storniert';

export interface OrderItem {
  productId: ID;
  name: string;
  quantity: number;
  unitCents: Cents;
  /** Gutschein: frei gewählter Wert, Empfänger*in */
  meta?: Record<string, string>;
}

export interface Order {
  id: ID;
  number: string;
  customerId: ID;
  items: OrderItem[];
  subtotalCents: Cents;
  shippingCents: Cents;
  voucherCents: Cents;
  totalCents: Cents;
  status: OrderStatus;
  payment: { method: PaymentMethod; status: PaymentStatus };
  shippingAddress?: { name: string; street: string; zip: string; city: string };
  createdAt: ISODateTime;
}

export interface Voucher {
  code: string;
  kind: 'allgemein' | 'kosmetik' | 'pediküre';
  initialCents: Cents;
  remainingCents: Cents;
  validUntil: ISODate;
  customerId?: ID;
  recipient?: string;
  message?: string;
  status: 'aktiv' | 'eingeloest' | 'entwertet';
  createdAt: ISODateTime;
}

export interface ContentBlock {
  id: ID; // z. B. "home.hero.title"
  page: string;
  label: string;
  kind: 'text' | 'richtext' | 'image';
  value: string;
}

export interface Page {
  id: ID;
  title: string;
  blocks: ID[];
}

export interface Settings {
  openingHours: { weekday: number; label: string; open?: string; close?: string }[];
  openingHoursPlaceholder: boolean;
  cancellation: { freeUntilHours: number; feePercent: number };
  bufferMin: number;
  slotStepMin: number;
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
  };
}

export interface Session {
  role: 'kundin' | 'team';
  customerId?: ID;
  staffId?: ID;
  name: string;
}

// --- Vision: nur als Typ, noch kein Feature ---

export interface Membership {
  id: ID;
  customerId: ID;
  plan: 'basis' | 'seelenzeit';
  status: 'aktiv' | 'pausiert' | 'gekuendigt';
  startedAt: ISODateTime;
  renewsAt: ISODateTime;
  /** NFC-Schlüsselanhänger für Check-in */
  nfcTagId?: string;
}

export interface CommunityProfile {
  id: ID;
  kind: 'kundin' | 'anbieterin' | 'mieterin';
  customerId?: ID;
  staffId?: ID;
  displayName: string;
  bio?: string;
  offers?: string[];
  locationId?: ID;
  visibility: 'privat' | 'community' | 'oeffentlich';
}
