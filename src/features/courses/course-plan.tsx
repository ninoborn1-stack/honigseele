'use client';
// Kursplan als Wochenansicht mit Ticket-Buchung (Einzelticket oder 5er/10er-Karte).
import { ChevronLeft, ChevronRight, Ticket, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Placeholder } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Field, Input } from '@/components/ui/form';
import { Tabs } from '@/components/ui/tabs';
import { getAdapter } from '@/data';
import { addDaysToDate, berlinDate, berlinToISO, inBerlin, weekdayOf } from '@/domain/time';
import type { Course, CourseSession } from '@/domain/types';
import { cn } from '@/lib/cn';
import { berlinTime, formatDateLong, formatDuration, formatEuro } from '@/lib/format';
import { useData, useSession } from '@/lib/use-data';
import { PaymentSheet } from '../payment/payment-sheet';

const kinds = [
  { value: 'alle', label: 'Alle' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'schulung', label: 'Schulungen' },
] as const;

function mondayOf(date: string) {
  return addDaysToDate(date, 1 - weekdayOf(date));
}

export function CoursePlan({ initialCourses }: { initialCourses: Course[] }) {
  const today = berlinDate(new Date());
  const [week, setWeek] = useState(0);
  const [kind, setKind] = useState<(typeof kinds)[number]['value']>('alle');
  const monday = addDaysToDate(mondayOf(today), week * 7);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDaysToDate(monday, i)), [monday]);
  const [day, setDay] = useState(today);
  const { data: courses = initialCourses } = useData((db) => db.listCourses(), [], initialCourses);
  const { data: sessions = [] } = useData(
    (db) => db.listSessions({ from: berlinToISO(monday, '00:00'), to: berlinToISO(addDaysToDate(monday, 6), '23:59') }),
    [monday],
  );
  const [selected, setSelected] = useState<CourseSession | null>(null);

  const visible = sessions.filter((s) => kind === 'alle' || courses.find((c) => c.id === s.courseId)?.kind === kind);
  const byDay = (d: string) => visible.filter((s) => berlinDate(s.start) === d);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs value={kind} onChange={setKind} options={[...kinds]} />
        <div className="flex items-center gap-2">
          <button disabled={week === 0} onClick={() => setWeek((w) => w - 1)} className="grid h-11 w-11 place-items-center rounded-full border border-line disabled:opacity-30" aria-label="Vorige Woche">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <p className="min-w-44 text-center text-sm">
            {inBerlin(berlinToISO(monday, '12:00')).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} –{' '}
            {inBerlin(berlinToISO(days[6], '12:00')).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
          </p>
          <button disabled={week === 2} onClick={() => setWeek((w) => w + 1)} className="grid h-11 w-11 place-items-center rounded-full border border-line disabled:opacity-30" aria-label="Nächste Woche">
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Mobil: Tage als Leiste, darunter ein Tag */}
      <div className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 md:hidden">
        {days.map((d) => (
          <button key={d} onClick={() => setDay(d)} className={cn('flex min-h-16 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border', d === day ? 'border-honey-950 bg-honey-950 text-cream-50' : 'border-line')}>
            <span className="text-[0.66rem] uppercase tracking-widest">{inBerlin(berlinToISO(d, '12:00')).toLocaleDateString('de-DE', { weekday: 'short' })}</span>
            <span className="font-serif text-xl">{inBerlin(berlinToISO(d, '12:00')).getDate()}</span>
            <span className={cn('h-1 w-1 rounded-full', byDay(d).length ? (d === day ? 'bg-honey-300' : 'bg-amber-600') : 'bg-transparent')} />
          </button>
        ))}
      </div>
      <div className="mt-4 md:hidden">
        <SessionList sessions={byDay(days.includes(day) ? day : days[0])} courses={courses} onPick={setSelected} empty />
      </div>

      {/* Desktop: Woche als Spalten */}
      <div className="mt-8 hidden grid-cols-7 gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line-soft md:grid">
        {days.map((d) => (
          <div key={d} className={cn('min-h-72 bg-cream-50 p-3', d === today && 'bg-card')}>
            <p className="mb-3 flex items-baseline justify-between border-b border-line-soft pb-2">
              <span className="text-xs uppercase tracking-widest text-muted">{inBerlin(berlinToISO(d, '12:00')).toLocaleDateString('de-DE', { weekday: 'short' })}</span>
              <span className="font-serif text-2xl">{inBerlin(berlinToISO(d, '12:00')).getDate()}</span>
            </p>
            <SessionList sessions={byDay(d)} courses={courses} onPick={setSelected} compact />
          </div>
        ))}
      </div>

      <TicketDrawer session={selected} course={courses.find((c) => c.id === selected?.courseId)} onClose={() => setSelected(null)} />
    </div>
  );
}

function SessionList({ sessions, courses, onPick, compact, empty }: { sessions: CourseSession[]; courses: Course[]; onPick: (s: CourseSession) => void; compact?: boolean; empty?: boolean }) {
  if (sessions.length === 0) return empty ? <p className="rounded-2xl bg-cream-100 p-6 text-center text-muted">An diesem Tag gibt es keine Kurse.</p> : null;
  return (
    <ul className={cn(compact ? 'space-y-2' : 'divide-y divide-line border-y border-line')}>
      {sessions.map((s) => {
        const c = courses.find((x) => x.id === s.courseId);
        const free = s.capacity - s.booked;
        const full = free <= 0;
        return (
          <li key={s.id} id={s.id}>
            <button
              onClick={() => onPick(s)}
              className={cn(
                'w-full text-left transition-colors',
                compact ? 'rounded-xl border border-line-soft bg-cream-50 p-2.5 hover:border-honey-950' : 'flex min-h-20 items-center gap-4 py-4',
                full && 'opacity-60',
              )}
            >
              <span className={cn('text-sm font-medium', !compact && 'w-14 shrink-0')}>{berlinTime(s.start)}</span>
              <span className={cn('block', !compact && 'flex-1')}>
                <span className={cn('block font-serif leading-tight', compact ? 'text-lg' : 'text-2xl')}>{c?.name}</span>
                <span className="block text-xs text-muted">mit {c?.leaderName}</span>
              </span>
              <span className={cn('mt-1 flex items-center gap-1 text-xs', full ? 'text-danger' : 'text-muted')}>
                <Users className="h-3 w-3" strokeWidth={1.5} />
                {full ? 'ausgebucht' : `${free} frei`}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function TicketDrawer({ session, course, onClose }: { session: CourseSession | null; course?: Course; onClose: () => void }) {
  const { session: auth } = useSession();
  const { data: cards = [] } = useData((db) => (auth?.customerId ? db.listPunchCards(auth.customerId) : Promise.resolve([])), [auth?.customerId]);
  const usableCard = course?.punchCardEligible ? cards.find((c) => c.remaining > 0) : undefined;
  const [guest, setGuest] = useState({ name: '', email: '' });
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const free = session ? session.capacity - session.booked : 0;

  const close = () => {
    setDone(false);
    setError('');
    onClose();
  };
  const book = async (punchCardId?: string) => {
    if (!session) return;
    setError('');
    let customerId = auth?.customerId;
    if (!customerId) {
      const [firstName, ...rest] = guest.name.trim().split(' ');
      if (!firstName || !guest.email.includes('@')) {
        setError('Bitte Name und E-Mail angeben oder anmelden.');
        return;
      }
      const c = await getAdapter().findOrCreateCustomer({ firstName, lastName: rest.join(' '), email: guest.email.trim() });
      customerId = c.id;
    }
    try {
      await getAdapter().bookTicket({ sessionId: session.id, customerId: customerId!, punchCardId });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Das hat nicht geklappt.');
    }
    setPaying(false);
  };

  return (
    <>
      <Drawer open={Boolean(session)} onClose={close} title={done ? 'Du bist dabei!' : 'Platz buchen'} side="bottom">
        {session && course && (
          <div className="mx-auto max-w-lg pb-6">
            <p className="eyebrow">{formatDateLong(session.start)}</p>
            <h3 className="mt-2 text-4xl">{course.name}</h3>
            <p className="mt-1 text-muted">
              {berlinTime(session.start)} – {berlinTime(session.end)} · {formatDuration(course.durationMin)} · mit {course.leaderName}
            </p>
            <p className="mt-4 text-sm">
              {course.description} {course.isPlaceholder && <Placeholder label="Details folgen" />}
            </p>
            {done ? (
              <div className="mt-8 rounded-2xl bg-honey-200/40 p-5">
                <p className="font-serif text-2xl">Dein Ticket liegt in Deinem Konto.</p>
                <p className="mt-1 text-sm text-muted">Absage bis 24 Stunden vorher kostenlos.</p>
                <ButtonLink href="/konto/" className="mt-4">Zu meinem Konto</ButtonLink>
              </div>
            ) : free <= 0 ? (
              <p className="mt-8 rounded-2xl bg-cream-100 p-5 text-center">Dieser Termin ist leider ausgebucht. Schau gern in die nächste Woche.</p>
            ) : (
              <div className="mt-8 space-y-4">
                {!auth && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Name">
                      <Input value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} autoComplete="name" />
                    </Field>
                    <Field label="E-Mail">
                      <Input type="email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} autoComplete="email" />
                    </Field>
                    <Button variant="link" className="sm:col-span-2" onClick={() => getAdapter().loginAs('kundin')}>
                      Oder Demo-Login als Lena (mit 10er-Karte)
                    </Button>
                  </div>
                )}
                {usableCard && (
                  <Button className="w-full" size="lg" onClick={() => book(usableCard.id)}>
                    <Ticket className="h-4 w-4" strokeWidth={1.5} /> Mit {usableCard.size}er-Karte buchen ({usableCard.remaining} übrig)
                  </Button>
                )}
                <Button className="w-full" size="lg" variant={usableCard ? 'ghost' : 'primary'} onClick={() => setPaying(true)}>
                  Einzelticket · {formatEuro(course.priceCents)}
                </Button>
                {error && <p className="text-sm text-danger">{error}</p>}
                <p className="text-center text-xs text-muted">Noch {free} von {session.capacity} Plätzen frei</p>
              </div>
            )}
          </div>
        )}
      </Drawer>
      <PaymentSheet open={paying} onClose={() => setPaying(false)} amountCents={course?.priceCents ?? 0} method="karte" onPaid={() => book()} />
    </>
  );
}
