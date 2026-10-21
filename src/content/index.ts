// Typisierter Zugriff auf content/. Wird zur Build-Zeit (SEO-Seiten) und als Seed des MockAdapters genutzt.
import categoriesJson from '@content/categories.json';
import servicesJson from '@content/services.json';
import staffJson from '@content/staff.json';
import staffServicesJson from '@content/staff-services.json';
import roomsJson from '@content/rooms.json';
import workingHoursJson from '@content/working-hours.json';
import packagesJson from '@content/packages.json';
import coursesJson from '@content/courses.json';
import productsJson from '@content/products.json';
import siteJson from '@content/site.json';
import careJson from '@content/care.json';
import faqJson from '@content/faq.json';
import type {
  Category,
  ContentBlock,
  Course,
  Location,
  Package,
  Product,
  Room,
  Service,
  Settings,
  Staff,
  StaffService,
  WorkingHours,
} from '@/domain/types';

export const categories = (categoriesJson as Category[]).slice().sort((a, b) => a.order - b.order);
export const services = servicesJson as Service[];
export const staff = staffJson as Staff[];
export const staffServices = staffServicesJson as StaffService[];
export const rooms = roomsJson as Room[];
export const workingHours = workingHoursJson as WorkingHours[];
export const packages = packagesJson as Package[];
export const courses = coursesJson as Course[];
export const products = productsJson as Product[];

export const site = siteJson as {
  location: Location;
  brand: {
    name: string;
    claim: string;
    owner: string;
    rating: { value: number; count: number; source: string };
    teamLanguages: string[];
  };
  settings: Settings;
  shipping: { flatCents: number; label: string };
  voucher: { minCents: number; maxCents: number; validYears: number };
  blocks: ContentBlock[];
  trust: { title: string; text: string }[];
  reviews: { text: string; name: string; placeholder?: boolean }[];
};

export interface CareInfo {
  preparation: string[];
  aftercare: string[];
  rhythm: string;
  placeholder?: boolean;
}
export const care = careJson as Record<string, CareInfo>;
export const faq = faqJson as Record<string, { q: string; a: string }[]>;

export const treatmentCategories = categories.filter((c) => c.inTreatments);
export const getCategory = (id: string) => categories.find((c) => c.id === id);
export const servicesOf = (categoryId: string) =>
  services.filter((s) => s.categoryId === categoryId && s.active);
export const block = (id: string) => site.blocks.find((b) => b.id === id)?.value ?? '';
