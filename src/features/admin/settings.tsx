'use client';
// Einstellungen: Öffnungszeiten, Storno-Regel, Kalender-Raster, Kontakt; Newsletter und Anfragen.
import { Check } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox, Field, Input } from '@/components/ui/form';
import { getAdapter } from '@/data';
import { formatDateShort } from '@/domain/time';
import type { Settings } from '@/domain/types';
import { useData } from '@/lib/use-data';
import { AdminTitle, Empty, Panel } from './ui';

function SettingsForm({ initial }: { initial: Settings }) {
  const [s, setS] = useState<Settings>(initial);
  const [saved, setSaved] = useState(false);
  const save = async () => {
    await getAdapter().saveSettings(s);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
  const setDay = (i: number, patch: Partial<Settings['openingHours'][number]>) =>
    setS({ ...s, openingHours: s.openingHours.map((h, j) => (j === i ? { ...h, ...patch } : h)) });

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel title="Öffnungszeiten">
        <ul className="divide-y divide-line-soft">
          {s.openingHours.map((h, i) => (
            <li key={h.weekday} className="grid grid-cols-[1fr_6rem_6rem] items-center gap-2 py-2">
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input type="checkbox" className="h-5 w-5 accent-amber-600" checked={Boolean(h.open)} onChange={(e) => setDay(i, e.target.checked ? { open: '10:00', close: '18:00' } : { open: undefined, close: undefined })} />
                {h.label}
              </label>
              <Input aria-label={`${h.label} öffnet`} type="time" className="!min-h-10 !px-2 text-sm" disabled={!h.open} value={h.open ?? ''} onChange={(e) => setDay(i, { open: e.target.value })} />
              <Input aria-label={`${h.label} schließt`} type="time" className="!min-h-10 !px-2 text-sm" disabled={!h.open} value={h.close ?? ''} onChange={(e) => setDay(i, { close: e.target.value })} />
            </li>
          ))}
        </ul>
        <Checkbox className="mt-3" label="Öffnungszeiten sind noch Platzhalter (Badge auf der Website)" checked={s.openingHoursPlaceholder} onChange={(e) => setS({ ...s, openingHoursPlaceholder: e.target.checked })} />
      </Panel>

      <div className="space-y-6">
        <Panel title="Storno-Regel">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kostenlos bis (Std. vorher)">
              <Input type="number" min={0} value={s.cancellation.freeUntilHours} onChange={(e) => setS({ ...s, cancellation: { ...s.cancellation, freeUntilHours: Number(e.target.value) } })} />
            </Field>
            <Field label="Danach Gebühr (%)">
              <Input type="number" min={0} max={100} value={s.cancellation.feePercent} onChange={(e) => setS({ ...s, cancellation: { ...s.cancellation, feePercent: Number(e.target.value) } })} />
            </Field>
          </div>
        </Panel>
        <Panel title="Kalender">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Puffer zwischen Terminen (Min.)">
              <Input type="number" min={0} step={5} value={s.bufferMin} onChange={(e) => setS({ ...s, bufferMin: Number(e.target.value) })} />
            </Field>
            <Field label="Raster für Startzeiten (Min.)">
              <Input type="number" min={5} step={5} value={s.slotStepMin} onChange={(e) => setS({ ...s, slotStepMin: Number(e.target.value) })} />
            </Field>
          </div>
        </Panel>
        <Panel title="Kontakt">
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ['phone', 'Telefon'],
                ['email', 'E-Mail'],
                ['whatsapp', 'WhatsApp-Link'],
                ['instagram', 'Instagram'],
                ['facebook', 'Facebook'],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <Input value={s.contact[key]} onChange={(e) => setS({ ...s, contact: { ...s.contact, [key]: e.target.value } })} />
              </Field>
            ))}
          </div>
        </Panel>
      </div>
      <div className="flex items-center gap-3 xl:col-span-2">
        <Button size="lg" onClick={save}>
          Einstellungen speichern
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-success">
            <Check className="h-4 w-4" /> Gespeichert
          </span>
        )}
      </div>
    </div>
  );
}

export function AdminSettings() {
  const { data } = useData(async (db) => {
    const [settings, subscribers, inquiries] = await Promise.all([db.getSettings(), db.listSubscribers(), db.listInquiries()]);
    return { settings, subscribers, inquiries };
  }, []);
  if (!data) return null;
  const kinds = { 'raum-mieten': 'Raum mieten', kontakt: 'Kontakt', job: 'Job' };
  return (
    <div>
      <AdminTitle eyebrow="Einstellungen" title="Studio & Regeln" />
      <SettingsForm initial={data.settings} />
      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <Panel title={`Newsletter (${data.subscribers.length})`}>
          {data.subscribers.length === 0 ? (
            <Empty>Noch keine Anmeldungen.</Empty>
          ) : (
            <ul className="divide-y divide-line-soft text-sm">
              {data.subscribers.map((e) => (
                <li key={e} className="py-2">{e}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">Später: Versand über Brevo/Resend, Kontakte aus Mailchimp übernehmen.</p>
        </Panel>
        <Panel title="Anfragen" className="scroll-mt-24">
          <div id="anfragen" />
          {data.inquiries.length === 0 ? (
            <Empty>Keine Anfragen.</Empty>
          ) : (
            <ul className="divide-y divide-line-soft text-sm">
              {data.inquiries
                .slice()
                .reverse()
                .map((i) => (
                  <li key={i.id} className="py-3">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{i.name}</span>
                      <Badge tone="honey">{kinds[i.kind]}</Badge>
                      <span className="text-xs text-muted">{formatDateShort(i.createdAt)}</span>
                    </p>
                    <a href={`mailto:${i.email}`} className="text-xs text-amber-800 underline">{i.email}</a>
                    <p className="mt-1 text-muted">{i.message}</p>
                  </li>
                ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
