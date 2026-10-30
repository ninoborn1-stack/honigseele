'use client';
// Kleine Bausteine für den Admin-Bereich.
import { Check, ChevronDown, ImagePlus } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { imageUrl } from '@/components/ui/photo';

export function AdminTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-4xl md:text-5xl">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border-line-soft rounded-2xl border p-4">
      <p className="text-muted text-sm">{label}</p>
      <p className="mt-1 font-serif text-3xl leading-none">{value}</p>
      {hint && <p className="text-muted mt-1.5 text-sm">{hint}</p>}
    </div>
  );
}

export function Panel({
  title,
  children,
  className,
  action,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn('border-line-soft bg-card rounded-2xl border p-5 md:p-6', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="text-2xl">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="border-honey-400 bg-honey-200/35 rounded-2xl border p-4 text-base">
      {children}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-muted py-8 text-center text-base">{children}</p>;
}

/** Euro-Eingabe ↔ Cent */
export const toCents = (v: string) => Math.round(Number(String(v).replace(',', '.')) * 100) || 0;
export const toEuroInput = (cents?: number) =>
  cents === undefined ? '' : (cents / 100).toFixed(2).replace('.', ',');

/** Bild verkleinern (max. 1200 px) und als JPEG-Data-URL zurückgeben */
export function resizeImage(file: File, max = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({
  value,
  onChange,
  label = 'Bild austauschen',
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      {value ? (
        <img src={imageUrl(value)} alt="" className="h-20 w-20 rounded-xl object-cover" />
      ) : (
        <div className="bg-cream-200 h-20 w-20 rounded-xl" />
      )}
      <label className="border-honey-950/25 hover:border-honey-950 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border px-5 text-base">
        <ImagePlus className="h-5 w-5" strokeWidth={1.5} />
        {label}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) onChange(await resizeImage(file));
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );
}

export const statusLabels: Record<string, string> = {
  bestaetigt: 'gebucht',
  storniert: 'storniert',
  abgeschlossen: 'abgeschlossen',
  'nicht-erschienen': 'nicht erschienen',
  bezahlt: 'bezahlt',
  versendet: 'versendet',
  aktiv: 'aktiv',
  eingeloest: 'eingelöst',
  entwertet: 'entwertet',
};

/** Aufklappbarer Bereich für seltene Felder */
export function MoreOptions({
  children,
  label = 'Mehr Optionen',
  className,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <details className={cn('group border-line-soft rounded-2xl border', className)}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-base font-medium [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown
          className="text-muted h-5 w-5 transition-transform group-open:rotate-180"
          strokeWidth={1.5}
        />
      </summary>
      <div className="border-line-soft space-y-5 border-t p-4">{children}</div>
    </details>
  );
}

/** Große Auswahlfläche (z. B. Leistung, Mitarbeiterin, Uhrzeit) */
export function Choice({
  selected,
  onClick,
  title,
  sub,
  aside,
  className,
}: {
  selected?: boolean;
  onClick: () => void;
  title: ReactNode;
  sub?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-base transition-colors',
        selected
          ? 'border-honey-950 bg-honey-950 text-cream-50'
          : 'border-line bg-card hover:border-honey-950',
        className,
      )}
    >
      <span className="min-w-0">
        <span className="block font-medium">{title}</span>
        {sub && (
          <span className={cn('block text-sm', selected ? 'text-cream-100/80' : 'text-muted')}>
            {sub}
          </span>
        )}
      </span>
      {aside && <span className="shrink-0">{aside}</span>}
    </button>
  );
}

/** Kurze Rückmeldung unten im Bild, z. B. „Gespeichert.“ – von überall auslösbar */
const TOAST_EVENT = 'admin-toast';
export function notify(text = 'Gespeichert.') {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: text }));
}

export function AdminToast() {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setText((e as CustomEvent<string>).detail);
      clearTimeout(t);
      t = setTimeout(() => setText(null), 2600);
    };
    window.addEventListener(TOAST_EVENT, on);
    return () => {
      window.removeEventListener(TOAST_EVENT, on);
      clearTimeout(t);
    };
  }, []);
  return (
    <div
      role="status"
      aria-live="polite"
      className="pb-safe pointer-events-none fixed inset-x-0 bottom-6 z-[130] flex justify-center px-4"
    >
      {text && (
        <p className="bg-honey-950 text-cream-50 flex min-h-12 items-center gap-2 rounded-full px-6 text-base shadow-xl">
          <Check className="text-honey-300 h-5 w-5" strokeWidth={1.5} /> {text}
        </p>
      )}
    </div>
  );
}

/** Kleine Inline-Bestätigung neben einem Speichern-Knopf */
export function SavedHint({ show, text = 'Gespeichert.' }: { show: boolean; text?: string }) {
  if (!show) return null;
  return (
    <span role="status" className="text-success flex items-center gap-1.5 text-base">
      <Check className="h-5 w-5" strokeWidth={1.5} /> {text}
    </span>
  );
}

/** Zahlungsarten und Zahlungsstand in Alltagssprache */
export const paymentMethodLabels: Record<string, string> = {
  karte: 'Karte',
  paypal: 'PayPal',
  klarna: 'Klarna',
  applepay: 'Apple Pay',
  gutschein: 'Gutschein',
  'vor-ort': 'vor Ort im Studio',
};
export const paymentStatusLabels: Record<string, string> = {
  bezahlt: 'bezahlt',
  autorisiert: 'vorgemerkt (noch nicht abgebucht)',
  offen: 'noch offen',
  erstattet: 'zurückgezahlt',
  'teilweise-erstattet': 'teilweise zurückgezahlt',
};
