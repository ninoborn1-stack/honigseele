'use client';
// Kleine Bausteine für den Admin-Bereich.
import { ImagePlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { withBase } from '@/lib/config';

export function AdminTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-4xl md:text-5xl">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line-soft bg-card p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 font-serif text-4xl leading-none">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Panel({ title, children, className, action }: { title?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn('rounded-2xl border border-line-soft bg-card p-5 md:p-6', className)}>
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
  return <div className="rounded-2xl border border-honey-400 bg-honey-200/35 p-4 text-sm">{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted">{children}</p>;
}

/** Euro-Eingabe ↔ Cent */
export const toCents = (v: string) => Math.round(Number(String(v).replace(',', '.')) * 100) || 0;
export const toEuroInput = (cents?: number) => (cents === undefined ? '' : (cents / 100).toFixed(2).replace('.', ','));

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

export function ImageUpload({ value, onChange, label = 'Bild austauschen' }: { value: string; onChange: (dataUrl: string) => void; label?: string }) {
  return (
    <div className="flex items-center gap-4">
      {value ? <img src={withBase(value)} alt="" className="h-20 w-20 rounded-xl object-cover" /> : <div className="h-20 w-20 rounded-xl bg-cream-200" />}
      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-honey-950/25 px-4 text-sm hover:border-honey-950">
        <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
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
  bestaetigt: 'bestätigt',
  storniert: 'storniert',
  abgeschlossen: 'abgeschlossen',
  'nicht-erschienen': 'nicht erschienen',
  bezahlt: 'bezahlt',
  versendet: 'versendet',
  aktiv: 'aktiv',
  eingeloest: 'eingelöst',
  entwertet: 'entwertet',
};
