'use client';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { getAdapter } from '@/data';
import { DEMO } from '@/lib/config';
import { useSession } from '@/lib/use-data';

/** Schmale Leiste im Demo-Modus: Hinweis, Rollenwechsel, Reset */
export function DemoBar() {
  const { session } = useSession();
  const [busy, setBusy] = useState(false);
  if (!DEMO) return null;
  const db = getAdapter();
  const switchRole = async (role: 'kundin' | 'team') => {
    await db.loginAs(role);
  };
  const reset = async () => {
    if (!confirm('Demo zurücksetzen? Alle Buchungen, Bestellungen und Änderungen gehen verloren.')) return;
    setBusy(true);
    await db.reset();
    setBusy(false);
    location.href = '/';
  };
  return (
    <div className="pt-safe relative z-[60] bg-honey-950 text-[0.72rem] text-cream-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5">
        <p className="truncate">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-honey-400 align-middle" />
          Demo – Inhalte teilweise Platzhalter
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <span className="hidden text-cream-100/60 sm:inline">Ansicht:</span>
          <button onClick={() => switchRole('kundin')} className={`min-h-8 rounded-full px-2.5 ${session?.role === 'kundin' ? 'bg-cream-50/15 text-cream-50' : 'text-cream-100/70 hover:text-cream-50'}`}>
            Kundin
          </button>
          <Link href="/admin/" onClick={() => session?.role !== 'team' && switchRole('team')} className={`inline-flex min-h-8 items-center rounded-full px-2.5 ${session?.role === 'team' ? 'bg-cream-50/15 text-cream-50' : 'text-cream-100/70 hover:text-cream-50'}`}>
            Team
          </Link>
          <Link href="/demo/mails/" className="hidden min-h-8 items-center rounded-full px-2.5 text-cream-100/70 hover:text-cream-50 md:inline-flex">
            Mails
          </Link>
          <button onClick={reset} disabled={busy} className="inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 text-cream-100/70 hover:text-cream-50" title="Demo zurücksetzen">
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Zurücksetzen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
