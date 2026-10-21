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
import { AdminTitle } from './ui';

const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
type Day = { on: boolean; start: string; end: string };

function StaffDrawer({ person, onClose, hours, timeOff }: { person: Staff | null; onClose: () => void; hours: WorkingHours[]; timeOff: TimeOff[] }) {
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

  const absences = person ? timeOff.filter((t) => t.staffId === person.id && t.reason === 'urlaub' && t.end >= new Date().toISOString()) : [];

  const save = async () => {
    if (!form) return;
    const db = getAdapter();
    await db.saveStaff(form);
    await db.setWorkingHours(
      form.id,
      days.flatMap((d, i) => (d.on && d.start < d.end ? [{ staffId: form.id, weekday: i + 1, start: d.start, end: d.end }] : [])),
    );
    onClose();
  };
  const addOff = async () => {
    if (!form || !off.from || !off.to || off.to < off.from) return;
    await getAdapter().addTimeOff({ staffId: form.id, start: berlinToISO(off.from, '00:00'), end: berlinToISO(off.to, '23:59'), reason: 'urlaub', note: off.note || 'Urlaub' });
    setOff({ from: '', to: '', note: '' });
  };
  const set = (patch: Partial<Staff>) => form && setForm({ ...form, ...patch });

  return (
    <Drawer open={Boolean(person)} onClose={onClose} title={form?.name ?? 'Person'} footer={<Button className="w-full" onClick={save}>Speichern</Button>}>
      {form && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name"><Input value={form.name} onChange={(e) => set({ name: e.target.value })} /></Field>
            <Field label="Titel"><Input value={form.title ?? ''} onChange={(e) => set({ title: e.target.value || undefined })} placeholder="z. B. Die Kuschel Seele" /></Field>
          </div>
          <Field label="Rolle"><Input value={form.role} onChange={(e) => set({ role: e.target.value })} /></Field>
          <Field label="Kurzporträt"><Textarea value={form.bio} onChange={(e) => set({ bio: e.target.value, bioPlaceholder: false })} /></Field>
          <div>
            <Checkbox label="Auf der Website sichtbar" checked={form.visible} onChange={(e) => set({ visible: e.target.checked })} />
            <Checkbox label="Online buchbar" checked={form.bookable} onChange={(e) => set({ bookable: e.target.checked })} />
          </div>

          <div>
            <p className="eyebrow mb-3">Arbeitszeiten</p>
            <ul className="divide-y divide-line-soft border-y border-line-soft">
              {days.map((d, i) => {
                const upd = (patch: Partial<Day>) => setDays(days.map((x, j) => (j === i ? { ...x, ...patch } : x)));
                return (
                  <li key={i} className="grid grid-cols-[1fr_6rem_6rem] items-center gap-2 py-2">
                    <label className="flex min-h-11 items-center gap-3 text-sm">
                      <input type="checkbox" className="h-5 w-5 accent-amber-600" checked={d.on} onChange={(e) => upd({ on: e.target.checked })} />
                      {WEEKDAYS[i]}
                    </label>
                    <Input aria-label={`${WEEKDAYS[i]} von`} type="time" step={900} className="!min-h-10 !px-2 text-sm" value={d.start} disabled={!d.on} onChange={(e) => upd({ start: e.target.value })} />
                    <Input aria-label={`${WEEKDAYS[i]} bis`} type="time" step={900} className="!min-h-10 !px-2 text-sm" value={d.end} disabled={!d.on} onChange={(e) => upd({ end: e.target.value })} />
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-3">Urlaub & Abwesenheit</p>
            {absences.length > 0 && (
              <ul className="mb-3 space-y-2 text-sm">
                {absences.map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-xl bg-cream-100 px-3 py-2">
                    <span>
                      {formatDateShort(t.start)} – {formatDateShort(t.end)} {t.note && <span className="text-muted">· {t.note}</span>}
                    </span>
                    <button onClick={() => getAdapter().removeTimeOff(t.id)} className="grid h-10 w-10 place-items-center text-muted hover:text-danger" aria-label="Abwesenheit löschen">
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Von"><Input type="date" value={off.from} min={berlinDate(new Date())} onChange={(e) => setOff({ ...off, from: e.target.value })} /></Field>
              <Field label="Bis"><Input type="date" value={off.to} min={off.from} onChange={(e) => setOff({ ...off, to: e.target.value })} /></Field>
            </div>
            <Field label="Notiz" className="mt-3"><Input value={off.note} onChange={(e) => setOff({ ...off, note: e.target.value })} placeholder="z. B. Herbsturlaub" /></Field>
            <Button variant="ghost" size="sm" className="mt-3" onClick={addOff} disabled={!off.from || !off.to}>
              Abwesenheit eintragen
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}

export function AdminTeam() {
  const [editing, setEditing] = useState<Staff | null>(null);
  const { data } = useData(async (db) => {
    const [staff, hours, timeOff] = await Promise.all([db.listStaff(), db.listWorkingHours(), db.listTimeOff()]);
    return { staff, hours, timeOff };
  }, []);
  if (!data) return null;
  const { staff, hours, timeOff } = data;
  const short = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  return (
    <div>
      <AdminTitle eyebrow="Team" title="Die Honigseelen" />
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {staff.map((p) => {
          const days = hours.filter((h) => h.staffId === p.id).sort((a, b) => a.weekday - b.weekday);
          const away = timeOff.some((t) => t.staffId === p.id && t.reason === 'urlaub' && t.end >= new Date().toISOString());
          return (
            <li key={p.id}>
              <button onClick={() => setEditing(p)} className="flex w-full items-start gap-4 rounded-2xl border border-line-soft bg-card p-4 text-left hover:border-line">
                <Avatar name={p.name} tone={p.avatarTone} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-serif text-2xl">
                    {p.name}
                    {!p.visible && <Badge>versteckt</Badge>}
                    {away && <Badge tone="honey">Urlaub geplant</Badge>}
                  </span>
                  <span className="block truncate text-sm text-muted">{p.role}</span>
                  <span className="mt-2 flex flex-wrap gap-1">
                    {short.map((d, i) => (
                      <span key={d} className={`grid h-7 w-7 place-items-center rounded-full text-[0.68rem] ${days.some((h) => h.weekday === i + 1) ? 'bg-honey-950 text-cream-50' : 'border border-line-soft text-muted'}`}>
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
      <StaffDrawer person={editing} onClose={() => setEditing(null)} hours={hours} timeOff={timeOff} />
    </div>
  );
}
