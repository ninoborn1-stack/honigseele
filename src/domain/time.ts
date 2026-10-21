// Zeitrechnung in Europe/Berlin, unabhängig von der Zeitzone des Geräts.
import { TZDate } from '@date-fns/tz';
import { addDays, format } from 'date-fns';
import { de } from 'date-fns/locale';

export const TZ = 'Europe/Berlin';

/** "2026-10-21" + "14:30" in Berlin → ISO-UTC-String */
export function berlinToISO(date: string, time: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  // TZDate.toISOString() liefert "+01:00"; für vergleichbare Strings immer UTC ("Z")
  return new Date(new TZDate(y, m - 1, d, hh, mm, 0, TZ).getTime()).toISOString();
}

export function inBerlin(iso: string | Date): TZDate {
  return new TZDate(new Date(iso).getTime(), TZ);
}

/** ISO-Wochentag (1 = Mo … 7 = So) eines Berliner Kalendertags */
export function weekdayOf(date: string): number {
  const day = inBerlin(berlinToISO(date, '12:00')).getDay();
  return day === 0 ? 7 : day;
}

export function berlinDate(iso: string | Date): string {
  return format(inBerlin(iso), 'yyyy-MM-dd');
}

export function berlinTime(iso: string | Date): string {
  return format(inBerlin(iso), 'HH:mm');
}

export function addDaysToDate(date: string, days: number): string {
  return format(addDays(inBerlin(berlinToISO(date, '12:00')), days), 'yyyy-MM-dd');
}

export function formatDateLong(iso: string): string {
  return format(inBerlin(iso), 'EEEE, d. MMMM yyyy', { locale: de });
}

export function formatDateShort(iso: string): string {
  return format(inBerlin(iso), 'EEE, d. MMM', { locale: de });
}

export function addMinutes(iso: string, min: number): string {
  return new Date(new Date(iso).getTime() + min * 60_000).toISOString();
}

export function minutesBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60_000);
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
}
