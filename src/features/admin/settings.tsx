'use client';
// Einstellungen: Öffnungszeiten, Storno-Regel, Kalender-Raster, Kontakt; Newsletter und Anfragen.
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox, Field, Input } from '@/components/ui/form';
import { getAdapter } from '@/data';
import { formatDateShort } from '@/domain/time';
import type { Settings } from '@/domain/types';
import { useData } from '@/lib/use-data';
import { Loading } from '@/components/ui/loading';
import { AdminTitle, Empty, MoreOptions, Panel, SavedHint, notify } from './ui';

function SettingsForm({ initial }: { initial: Settings }) {
  const [s, setS] = useState<Settings>(initial);
  const [saved, setSaved] = useState(false);
  const save = async () => {
    await getAdapter().saveSettings(s);
    setSaved(true);
    notify('Gespeichert.');
    setTimeout(() => setSaved(false), 2600);
  };
  const setDay = (i: number, patch: Partial<Settings['openingHours'][number]>) =>
    setS({ ...s, openingHours: s.openingHours.map((h, j) => (j === i ? { ...h, ...patch } : h)) });

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel title="Öffnungszeiten">
        <ul className="divide-line-soft divide-y">
          {s.openingHours.map((h, i) => (
            <li
              key={h.weekday}
              className="grid grid-cols-[1fr_6.5rem_6.5rem] items-center gap-2 py-2"
            >
              <label className="flex min-h-12 cursor-pointer items-center gap-3 text-base">
                <input
                  type="checkbox"
                  className="h-6 w-6 accent-amber-600"
                  checked={Boolean(h.open)}
                  onChange={(e) =>
                    setDay(
                      i,
                      e.target.checked
                        ? { open: '10:00', close: '18:00' }
                        : { open: undefined, close: undefined },
                    )
                  }
                />
                {h.label}
              </label>
              {h.open ? (
                <>
                  <Input
                    aria-label={`${h.label} öffnet`}
                    type="time"
                    className="!px-2"
                    value={h.open ?? ''}
                    onChange={(e) => setDay(i, { open: e.target.value })}
                  />
                  <Input
                    aria-label={`${h.label} schließt`}
                    type="time"
                    className="!px-2"
                    value={h.close ?? ''}
                    onChange={(e) => setDay(i, { close: e.target.value })}
                  />
                </>
              ) : (
                <span className="text-muted col-span-2 text-base">geschlossen</span>
              )}
            </li>
          ))}
        </ul>
      </Panel>

      <div className="space-y-6">
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
                <Input
                  value={s.contact[key]}
                  onChange={(e) => setS({ ...s, contact: { ...s.contact, [key]: e.target.value } })}
                />
              </Field>
            ))}
          </div>
        </Panel>
      </div>
      <MoreOptions className="xl:col-span-2" label="Mehr Optionen: Absage-Regel, Kalender, Hinweis">
        <p className="text-base font-medium">Absage-Regel</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kostenlos absagen bis (Stunden vorher)">
            <Input
              type="number"
              min={0}
              value={s.cancellation.freeUntilHours}
              onChange={(e) =>
                setS({
                  ...s,
                  cancellation: { ...s.cancellation, freeUntilHours: Number(e.target.value) },
                })
              }
            />
          </Field>
          <Field label="Danach Gebühr in %">
            <Input
              type="number"
              min={0}
              max={100}
              value={s.cancellation.feePercent}
              onChange={(e) =>
                setS({
                  ...s,
                  cancellation: { ...s.cancellation, feePercent: Number(e.target.value) },
                })
              }
            />
          </Field>
        </div>
        <p className="text-base font-medium">Termine im Kalender</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pause zwischen Terminen (Min.)">
            <Input
              type="number"
              min={0}
              step={5}
              value={s.bufferMin}
              onChange={(e) => setS({ ...s, bufferMin: Number(e.target.value) })}
            />
          </Field>
          <Field label="Termine starten alle … Minuten">
            <Input
              type="number"
              min={5}
              step={5}
              value={s.slotStepMin}
              onChange={(e) => setS({ ...s, slotStepMin: Number(e.target.value) })}
            />
          </Field>
        </div>
        <Checkbox
          label={
            <span className="text-base">
              Öffnungszeiten sind noch vorläufig (Hinweis auf der Website)
            </span>
          }
          checked={s.openingHoursPlaceholder}
          onChange={(e) => setS({ ...s, openingHoursPlaceholder: e.target.checked })}
        />
      </MoreOptions>
      <div className="flex items-center gap-3 xl:col-span-2">
        <Button size="lg" onClick={save}>
          Speichern
        </Button>
        <SavedHint show={saved} />
      </div>
    </div>
  );
}

export function AdminSettings() {
  const { data } = useData(async (db) => {
    const [settings, subscribers, inquiries] = await Promise.all([
      db.getSettings(),
      db.listSubscribers(),
      db.listInquiries(),
    ]);
    return { settings, subscribers, inquiries };
  }, []);
  if (!data) return <Loading label="Einstellungen werden geladen …" />;
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
            <ul className="divide-line-soft divide-y text-base">
              {data.subscribers.map((e) => (
                <li key={e} className="py-2">
                  {e}
                </li>
              ))}
            </ul>
          )}
          <p className="text-muted mt-3 text-sm">
            Später: Versand über Brevo/Resend, Kontakte aus Mailchimp übernehmen.
          </p>
        </Panel>
        <Panel title="Anfragen" className="scroll-mt-24">
          <div id="anfragen" />
          {data.inquiries.length === 0 ? (
            <Empty>Keine Anfragen.</Empty>
          ) : (
            <ul className="divide-line-soft divide-y text-base">
              {data.inquiries
                .slice()
                .reverse()
                .map((i) => (
                  <li key={i.id} className="py-3">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{i.name}</span>
                      <Badge tone="honey">{kinds[i.kind]}</Badge>
                      <span className="text-muted text-sm">{formatDateShort(i.createdAt)}</span>
                    </p>
                    <a
                      href={`mailto:${i.email}`}
                      className="inline-flex min-h-12 items-center text-base text-amber-800 underline underline-offset-4"
                    >
                      {i.email}
                    </a>
                    <p className="text-muted mt-1">{i.message}</p>
                  </li>
                ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
