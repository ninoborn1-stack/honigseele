'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/form';
import { getAdapter } from '@/data';
import type { Inquiry } from '@/data/adapter';

export function InquiryForm({ kind, cta, placeholder }: { kind: Inquiry['kind']; cta: string; placeholder?: string }) {
  const [v, setV] = useState({ name: '', email: '', message: '' });
  const [done, setDone] = useState(false);
  if (done) return <p className="rounded-2xl bg-honey-200/40 p-6 font-serif text-2xl">Danke, {v.name.split(' ')[0]}! Wir melden uns in den nächsten Tagen.</p>;
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await getAdapter().sendInquiry({ kind, ...v });
        setDone(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name"><Input required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} autoComplete="name" /></Field>
        <Field label="E-Mail"><Input required type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} autoComplete="email" /></Field>
      </div>
      <Field label="Nachricht"><Textarea required value={v.message} placeholder={placeholder} onChange={(e) => setV({ ...v, message: e.target.value })} /></Field>
      <Button type="submit">{cta}</Button>
    </form>
  );
}
