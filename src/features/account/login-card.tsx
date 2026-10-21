'use client';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';
import { getAdapter } from '@/data';

/** Anmeldung per Magic Link (später Supabase Auth). In der Demo: direkt als Lena. */
export function LoginCard({ onDone }: { onDone?: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const login = async (role: 'kundin' | 'team') => {
    await getAdapter().loginAs(role);
    onDone?.();
    if (role === 'team') location.href = '/admin/';
  };
  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-line bg-card p-7 md:p-10">
      <p className="eyebrow">Mein Konto</p>
      <h1 className="mt-3 text-5xl">
        Schön, dass Du <em>wieder</em> da bist.
      </h1>
      {sent ? (
        <div className="mt-8">
          <p className="flex gap-3 text-muted">
            <Mail className="mt-1 h-5 w-5 shrink-0 text-amber-800" strokeWidth={1.5} />
            Wir haben Dir einen Anmelde-Link an {email} geschickt. Kein Passwort nötig.
          </p>
          <Button className="mt-6 w-full" onClick={() => login('kundin')}>
            Demo: Link öffnen
          </Button>
        </div>
      ) : (
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <Field label="E-Mail">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </Field>
          <Button type="submit" className="w-full" size="lg">
            Anmelde-Link senden
          </Button>
        </form>
      )}
      <div className="mt-8 border-t border-line-soft pt-6">
        <p className="text-center text-xs uppercase tracking-widest text-muted">Demo</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button variant="ghost" onClick={() => login('kundin')}>
            Als Kundin Lena
          </Button>
          <Button variant="ghost" onClick={() => login('team')}>
            Als Team (Anna)
          </Button>
        </div>
      </div>
    </div>
  );
}
