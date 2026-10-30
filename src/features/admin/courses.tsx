'use client';
// Kurse & Termine: Kurse bearbeiten, Termine mit Belegung, neue Termine anlegen.
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/form';
import { getAdapter } from '@/data';
import { addMinutes, berlinDate, berlinToISO, formatDateShort } from '@/domain/time';
import type { Course, CourseSession } from '@/domain/types';
import { cn } from '@/lib/cn';
import { berlinTime, formatDuration, formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { Loading } from '@/components/ui/loading';
import { AdminTitle, Empty, MoreOptions, Panel, notify, toCents, toEuroInput } from './ui';

function CourseDrawer({ course, onClose }: { course: Course | null; onClose: () => void }) {
  const [form, setForm] = useState<Course | null>(null);
  const [price, setPrice] = useState('');
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (course && loadedFor !== course.id) {
    setLoadedFor(course.id);
    setForm(course);
    setPrice(toEuroInput(course.priceCents));
  }
  if (!course && loadedFor) setLoadedFor(null);
  const set = (patch: Partial<Course>) => form && setForm({ ...form, ...patch });
  const save = async () => {
    if (!form) return;
    await getAdapter().saveCourse({ ...form, priceCents: toCents(price) });
    notify('Gespeichert.');
    onClose();
  };
  return (
    <Drawer
      open={Boolean(course)}
      onClose={onClose}
      title="Kurs bearbeiten"
      footer={
        <Button size="lg" className="w-full" onClick={save}>
          Speichern
        </Button>
      }
    >
      {form && (
        <div className="space-y-5">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preis in €">
              <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </Field>
            <Field label="Plätze">
              <Input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => set({ capacity: Number(e.target.value) })}
              />
            </Field>
          </div>
          <MoreOptions>
            <Field label="Beschreibung">
              <Textarea
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
              />
            </Field>
            <Field label="Kursleitung">
              <Input
                value={form.leaderName}
                onChange={(e) => set({ leaderName: e.target.value })}
              />
            </Field>
            <Field label="Dauer in Minuten">
              <Input
                type="number"
                value={form.durationMin}
                onChange={(e) => set({ durationMin: Number(e.target.value) })}
              />
            </Field>
            <Checkbox
              label={<span className="text-base">Mit 5er-/10er-Karte buchbar</span>}
              checked={form.punchCardEligible}
              onChange={(e) => set({ punchCardEligible: e.target.checked })}
            />
            <Checkbox
              label={<span className="text-base">Texte sind noch vorläufig (Platzhalter)</span>}
              checked={Boolean(form.isPlaceholder)}
              onChange={(e) => set({ isPlaceholder: e.target.checked })}
            />
          </MoreOptions>
        </div>
      )}
    </Drawer>
  );
}

function SessionDrawer({
  open,
  onClose,
  courses,
  session,
}: {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  session: CourseSession | null;
}) {
  const [form, setForm] = useState({
    courseId: courses[0]?.id ?? '',
    date: berlinDate(new Date()),
    time: '18:30',
    capacity: '',
  });
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (session && loadedFor !== session.id) {
    setLoadedFor(session.id);
    setForm({
      courseId: session.courseId,
      date: berlinDate(session.start),
      time: berlinTime(session.start),
      capacity: String(session.capacity),
    });
  }
  if (!session && loadedFor) setLoadedFor(null);
  const course = courses.find((c) => c.id === form.courseId);
  const save = async () => {
    if (!course) return;
    const start = berlinToISO(form.date, form.time);
    await getAdapter().saveSession({
      id: session?.id ?? `ks-${Date.now().toString(36)}`,
      courseId: course.id,
      start,
      end: addMinutes(start, course.durationMin),
      capacity: Number(form.capacity) || course.capacity,
      booked: session?.booked ?? 0,
      roomId: session?.roomId ?? 'kursraum',
    });
    notify('Gespeichert.');
    onClose();
  };
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={session ? 'Kurstermin ändern' : 'Neuer Kurstermin'}
      footer={
        <Button size="lg" className="w-full" onClick={save}>
          Speichern
        </Button>
      }
    >
      <div className="space-y-5">
        <Field label="Kurs">
          <Select
            value={form.courseId}
            onChange={(e) => setForm({ ...form, courseId: e.target.value })}
            disabled={Boolean(session)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tag">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Field>
          <Field label="Beginn">
            <Input
              type="time"
              step={900}
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </Field>
        </div>
        {session && <p className="text-muted text-base">Schon angemeldet: {session.booked}</p>}
        <MoreOptions>
          <Field
            label="Plätze für diesen Termin"
            hint={course ? `Leer lassen = ${course.capacity} Plätze wie beim Kurs` : undefined}
          >
            <Input
              type="number"
              min={session?.booked ?? 1}
              value={form.capacity}
              placeholder={String(course?.capacity ?? '')}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            />
          </Field>
        </MoreOptions>
      </div>
    </Drawer>
  );
}

export function AdminCourses() {
  const [course, setCourse] = useState<Course | null>(null);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [session, setSession] = useState<CourseSession | null>(null);
  const { data } = useData(async (db) => {
    const [courses, sessions] = await Promise.all([
      db.listCourses(),
      db.listSessions({ from: new Date().toISOString() }),
    ]);
    return { courses, sessions };
  }, []);
  if (!data) return <Loading label="Kurse werden geladen …" />;
  const { courses, sessions } = data;
  return (
    <div>
      <AdminTitle eyebrow="Kurse" title="Kursplan">
        <Button
          size="lg"
          onClick={() => {
            setSession(null);
            setSessionOpen(true);
          }}
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} /> Neuer Kurstermin
        </Button>
      </AdminTitle>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <Panel title="Kurse">
          <ul className="divide-line-soft divide-y">
            {courses.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setCourse(c)}
                  className="flex min-h-16 w-full items-center justify-between gap-3 py-3 text-left text-base"
                >
                  <span>
                    <span className="block font-medium">
                      {c.name} {c.isPlaceholder && <Badge className="ml-1">vorläufig</Badge>}
                    </span>
                    <span className="text-muted text-sm">
                      {c.leaderName} · {formatDuration(c.durationMin)} · {c.capacity} Plätze
                    </span>
                  </span>
                  <span className="font-serif text-xl">{formatEuro(c.priceCents)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Kommende Termine">
          {sessions.length === 0 ? (
            <Empty>Keine Termine geplant.</Empty>
          ) : (
            <ul className="divide-line-soft divide-y">
              {sessions.map((s) => {
                const c = courses.find((x) => x.id === s.courseId);
                const ratio = s.booked / s.capacity;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => {
                        setSession(s);
                        setSessionOpen(true);
                      }}
                      className="grid min-h-16 w-full grid-cols-[6.5rem_1fr_auto] items-center gap-3 py-3 text-left text-base"
                    >
                      <span>
                        <span className="text-muted block text-sm">{formatDateShort(s.start)}</span>
                        <span className="font-serif text-xl">{berlinTime(s.start)}</span>
                      </span>
                      <span>{c?.name}</span>
                      <span className="flex min-w-24 flex-col items-end gap-1 text-sm">
                        <span className={cn(ratio >= 1 ? 'text-danger' : 'text-muted')}>
                          {s.booked} von {s.capacity} {ratio >= 1 && '· voll'}
                        </span>
                        <span className="bg-cream-200 h-1 w-20 overflow-hidden rounded-full">
                          <span
                            className={cn(
                              'block h-full',
                              ratio >= 1 ? 'bg-danger' : 'bg-amber-600',
                            )}
                            style={{ width: `${Math.min(100, ratio * 100)}%` }}
                          />
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
      <CourseDrawer course={course} onClose={() => setCourse(null)} />
      <SessionDrawer
        open={sessionOpen}
        onClose={() => setSessionOpen(false)}
        courses={courses}
        session={session}
      />
    </div>
  );
}
