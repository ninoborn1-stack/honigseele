'use client';
// Team: Profil, Arbeitszeiten je Wochentag, Urlaub/Abwesenheiten.
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Checkbox, Field, Input, Textarea } from '@/components/ui/form';
import { getAdapter } from '@/data';
import { berlinDate, berlinToISO, formatDateShort } from '@/domain/time';
import type { Staff, TimeOff, WorkingHours } from '@/domain/types';
import { useData } from '@/lib/use-data';
import { Loading } from '@/components/ui/loading';
import { AdminTitle, MoreOptions, notify } from './ui';

const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
type Day = { on: boolean; start: string; end: string };

function StaffDrawer({
  person,
  onClose,
  hours,
  timeOff,
}: {
  person: Staff | null;
  onClose: () => void;
  hours: WorkingHours[];
  timeOff: TimeOff[];
}) {
  const [form, setForm] = useState<Staff | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [off, setOff] = useState({ from: '', to: '', note: '' });
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  if (person && loadedFor !== person.id) {
    setLoadedFor(person.id);
    setForm(person);
    setDays(
      WEEKDAYS.map((_, i) => {
        const h = hours.find((w) => w.staffId === person.id && w.weekday === i + 1);
        return { on: Boolean(h), start: h?.start ?? '10:00', end: h?.end ?? '18:00' };
      }),
    );
  }
  if (!person && loadedFor) setLoadedFor(null);

  const absences = person
    ? timeOff.filter(
        (t) =>
          t.staffId === person.id && t.reason === 'urlaub' && t.end >= new Date().toISOString(),
      )
    : [];

  const save = async () => {
    if (!form) return;
    const db = getAdapter();
    await db.saveStaff(form);
    await db.setWorkingHours(
      form.id,
      days.flatMap((d, i) =>
        d.on && d.start < d.end
          ? [{ staffId: form.id, weekday: i + 1, start: d.start, end: d.end }]
          : [],
      ),
    );
    notify('Gespeichert.');
    onClose();
  };
  const addOff = async () => {
    if (!form || !off.from || !off.to || off.to < off.from) return;
    await getAdapter().addTimeOff({
      staffId: form.id,
      start: berlinToISO(off.from, '00:00'),
      end: berlinToISO(off.to, '23:59'),
      reason: 'urlaub',
      note: off.note || 'Urlaub',
    });
    setOff({ from: '', to: '', note: '' });
    notify('Urlaub eingetragen.');
  };
  const set = (patch: Partial<Staff>) => form && setForm({ ...form, ...patch });

  return (
    <Drawer
      open={Boolean(person)}
      onClose={onClose}
      title={form?.name ?? 'Person'}
      footer={
        <Button size="lg" className="w-full" onClick={save}>
          Speichern
        </Button>
      }
    >
      {form && (
        <div className="space-y-7">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>

          <div>
            <p className="mb-1 text-base font-medium">Arbeitszeiten</p>
            <p className="text-muted mb-2 text-sm">Häkchen = arbeitet an diesem Tag.</p>
            <ul className="divide-line-soft border-line-soft divide-y border-y">
              {days.map((d, i) => {
                const upd = (patch: Partial<Day>) =>
                  setDays(days.map((x, j) => (j === i ? { ...x, ...patch } : x)));
                return (
                  <li
                    key={i}
                    className="grid grid-cols-[1fr_6.5rem_6.5rem] items-center gap-2 py-2"
                  >
                    <label className="flex min-h-12 cursor-pointer items-center gap-3 text-base">
                      <input
                        type="checkbox"
                        className="h-6 w-6 accent-amber-600"
                        checked={d.on}
                        onChange={(e) => upd({ on: e.target.checked })}
                      />
                      {WEEKDAYS[i]}
                    </label>
                    {d.on ? (
                      <>
                        <Input
                          aria-label={`${WEEKDAYS[i]} von`}
                          type="time"
                          step={900}
                          className="!px-2"
                          value={d.start}
                          onChange={(e) => upd({ start: e.target.value })}
                        />
                        <Input
                          aria-label={`${WEEKDAYS[i]} bis`}
                          type="time"
                          step={900}
                          className="!px-2"
                          value={d.end}
                          onChange={(e) => upd({ end: e.target.value })}
                        />
                      </>
                    ) : (
                      <span className="text-muted col-span-2 text-base">frei</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-base font-medium">Urlaub eintragen</p>
            {absences.length > 0 && (
              <ul className="mb-3 space-y-2 text-base">
                {absences.map((t) => (
                  <li
                    key={t.id}
                    className="bg-cream-100 flex items-center justify-between gap-3 rounded-2xl py-1 pr-1 pl-4"
                  >
                    <span>
                      {formatDateShort(t.start)} – {formatDateShort(t.end)}{' '}
                      {t.note && <span className="text-muted">· {t.note}</span>}
                    </span>
                    <button
                      onClick={() => getAdapter().removeTimeOff(t.id)}
                      className="text-muted hover:text-danger flex min-h-12 items-center gap-2 rounded-full px-3"
                      aria-label="Urlaub löschen"
                    >
                      <Trash2 className="h-5 w-5" strokeWidth={1.5} /> Löschen
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Erster Tag">
                <Input
                  type="date"
                  value={off.from}
                  min={berlinDate(new Date())}
                  onChange={(e) =>
                    setOff({ ...off, from: e.target.value, to: off.to || e.target.value })
                  }
                />
              </Field>
              <Field label="Letzter Tag">
                <Input
                  type="date"
                  value={off.to}
                  min={off.from}
                  onChange={(e) => setOff({ ...off, to: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Notiz (freiwillig)" className="mt-3">
              <Input
                value={off.note}
                onChange={(e) => setOff({ ...off, note: e.target.value })}
                placeholder="z. B. Herbsturlaub"
              />
            </Field>
            <Button
              variant="ghost"
              size="lg"
              className="mt-3 w-full"
              onClick={addOff}
              disabled={!off.from || !off.to}
            >
              Urlaub eintragen
            </Button>
          </div>

          <MoreOptions label="Profil auf der Website">
            <Field label="Beiname">
              <Input
                value={form.title ?? ''}
                onChange={(e) => set({ title: e.target.value || undefined })}
                placeholder="z. B. Die Kuschel Seele"
              />
            </Field>
            <Field label="Rolle">
              <Input value={form.role} onChange={(e) => set({ role: e.target.value })} />
            </Field>
            <Field label="Kurzporträt">
              <Textarea
                value={form.bio}
                onChange={(e) => set({ bio: e.target.value, bioPlaceholder: false })}
              />
            </Field>
            <div>
              <Checkbox
                label={<span className="text-base">Auf der Website zeigen</span>}
                checked={form.visible}
                onChange={(e) => set({ visible: e.target.checked })}
              />
              <Checkbox
                label={<span className="text-base">Kundinnen können online bei ihr buchen</span>}
                checked={form.bookable}
                onChange={(e) => set({ bookable: e.target.checked })}
              />
            </div>
          </MoreOptions>
        </div>
      )}
    </Drawer>
  );
}

export function AdminTeam() {
  const [editing, setEditing] = useState<Staff | null>(null);
  const { data } = useData(async (db) => {
    const [staff, hours, timeOff] = await Promise.all([
      db.listStaff(),
      db.listWorkingHours(),
      db.listTimeOff(),
    ]);
    return { staff, hours, timeOff };
  }, []);
  if (!data) return <Loading label="Team wird geladen …" />;
  const { staff, hours, timeOff } = data;
  const short = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  return (
    <div>
      <AdminTitle eyebrow="Team" title="Die Honigseelen" />
      <p className="text-muted -mt-4 mb-6 text-base">
        Antippen, um Arbeitszeiten oder Urlaub einzutragen.
      </p>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {staff.map((p) => {
          const days = hours
            .filter((h) => h.staffId === p.id)
            .sort((a, b) => a.weekday - b.weekday);
          const away = timeOff.some(
            (t) => t.staffId === p.id && t.reason === 'urlaub' && t.end >= new Date().toISOString(),
          );
          return (
            <li key={p.id}>
              <button
                onClick={() => setEditing(p)}
                className="border-line-soft bg-card hover:border-honey-950 flex min-h-24 w-full items-start gap-4 rounded-2xl border p-5 text-left"
              >
                <Avatar name={p.name} tone={p.avatarTone} photo={p.photo} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-serif text-2xl">
                    {p.name}
                    {!p.visible && <Badge>nicht auf der Website</Badge>}
                    {away && <Badge tone="honey">Urlaub geplant</Badge>}
                  </span>
                  <span className="text-muted block truncate text-base">{p.role}</span>
                  <span className="mt-2 flex flex-wrap gap-1">
                    {short.map((d, i) => (
                      <span
                        key={d}
                        className={`grid h-8 w-8 place-items-center rounded-full text-sm ${days.some((h) => h.weekday === i + 1) ? 'bg-honey-950 text-cream-50' : 'border-line-soft text-muted border'}`}
                      >
                        {d}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <StaffDrawer
        person={editing}
        onClose={() => setEditing(null)}
        hours={hours}
        timeOff={timeOff}
      />
    </div>
  );
}
