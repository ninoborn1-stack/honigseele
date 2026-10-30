'use client';
// Gutscheine: prüfen, anlegen, entwerten.
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { getAdapter } from '@/data';
import { addDaysToDate, berlinDate } from '@/domain/time';
import { generateVoucherCode, voucherMessages, type VoucherCheck } from '@/domain/vouchers';
import type { Voucher } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { Loading } from '@/components/ui/loading';
import { AdminTitle, MoreOptions, Panel, notify, statusLabels, toCents } from './ui';

function NewVoucherDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const today = berlinDate(new Date());
  const [form, setForm] = useState({
    code: generateVoucherCode(),
    value: '50',
    kind: 'allgemein' as Voucher['kind'],
    validUntil: addDaysToDate(today, 365 * 3),
    recipient: '',
    message: '',
  });
  const save = async () => {
    const cents = toCents(form.value);
    if (!form.code.trim() || cents <= 0) return;
    await getAdapter().saveVoucher({
      code: form.code,
      kind: form.kind,
      initialCents: cents,
      remainingCents: cents,
      validUntil: form.validUntil,
      recipient: form.recipient || undefined,
      message: form.message || undefined,
      status: 'aktiv',
      createdAt: new Date().toISOString(),
    });
    notify(`Gutschein ${form.code} angelegt.`);
    setForm({ ...form, code: generateVoucherCode(), recipient: '', message: '' });
    onClose();
  };
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Neuer Gutschein"
      footer={
        <Button size="lg" className="w-full" onClick={save}>
          Gutschein anlegen
        </Button>
      }
    >
      <div className="space-y-5">
        <Field label="Wert in €">
          <Input
            inputMode="decimal"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />
        </Field>
        <Field label="Für wen? (freiwillig)">
          <Input
            value={form.recipient}
            onChange={(e) => setForm({ ...form, recipient: e.target.value })}
          />
        </Field>
        <p className="bg-cream-100 rounded-2xl p-4 text-base">
          Code: <span className="font-mono font-medium">{form.code}</span>
        </p>
        <MoreOptions>
          <Field label="Code selbst festlegen">
            <div className="flex gap-2">
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="font-mono uppercase"
              />
              <Button
                variant="ghost"
                size="lg"
                type="button"
                onClick={() => setForm({ ...form, code: generateVoucherCode() })}
              >
                Neuer Code
              </Button>
            </div>
          </Field>
          <Field label="Wofür?">
            <Select
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as Voucher['kind'] })}
            >
              <option value="allgemein">Für alles</option>
              <option value="kosmetik">Kosmetik</option>
              <option value="pediküre">Pediküre</option>
            </Select>
          </Field>
          <Field label="Gültig bis">
            <Input
              type="date"
              value={form.validUntil}
              onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
            />
          </Field>
          <Field label="Nachricht (freiwillig)">
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </Field>
        </MoreOptions>
      </div>
    </Drawer>
  );
}

export function AdminVouchers() {
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<VoucherCheck | null>(null);
  const { data: vouchers } = useData((db) => db.listVouchers(), []);
  if (!vouchers) return <Loading label="Gutscheine werden geladen …" />;
  const today = berlinDate(new Date());

  const check = async () =>
    setResult(await getAdapter().checkVoucher(code, Number.MAX_SAFE_INTEGER));
  const invalidate = async (v: Voucher) => {
    if (
      !confirm(
        `Gutschein ${v.code} entwerten? Der Restwert von ${formatEuro(v.remainingCents)} verfällt.`,
      )
    )
      return;
    await getAdapter().saveVoucher({ ...v, status: 'entwertet' });
    notify(`Gutschein ${v.code} entwertet.`);
    setResult(null);
  };

  return (
    <div>
      <AdminTitle
        eyebrow="Gutscheine"
        title={`${vouchers.filter((v) => v.status === 'aktiv' && v.validUntil >= today).length} aktive Gutscheine`}
      >
        <Button size="lg" onClick={() => setCreating(true)}>
          <Plus className="h-5 w-5" strokeWidth={1.5} /> Neuer Gutschein
        </Button>
      </AdminTitle>

      <Panel title="Gutschein prüfen" className="mb-8">
        <p className="text-muted -mt-2 mb-4 text-base">
          Code eintippen, dann siehst Du, ob er gilt und wie viel noch drauf ist.
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void check();
          }}
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code eingeben, z. B. HONIG50"
            className="font-mono uppercase"
            aria-label="Code"
          />
          <Button size="lg" type="submit" disabled={!code.trim()}>
            Prüfen
          </Button>
        </form>
        {result && (
          <div
            className={cn(
              'mt-4 rounded-2xl p-4 text-base',
              result.ok ? 'bg-success/10' : 'bg-danger/10',
            )}
          >
            {result.ok ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p>
                  <span className="text-success font-medium">Gültig.</span> Noch{' '}
                  {formatEuro(result.voucher.remainingCents)} von{' '}
                  {formatEuro(result.voucher.initialCents)} übrig, gültig bis{' '}
                  {result.voucher.validUntil}.
                </p>
                <Button size="lg" variant="ghost" onClick={() => invalidate(result.voucher)}>
                  Entwerten
                </Button>
              </div>
            ) : (
              <p className="text-danger">{voucherMessages[result.reason]}</p>
            )}
          </div>
        )}
      </Panel>

      <h2 className="mb-3 text-2xl">Alle Gutscheine</h2>
      <div className="border-line-soft bg-card overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[760px] text-base">
          <thead>
            <tr className="border-line-soft text-muted border-b text-left text-sm">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Wofür</th>
              <th className="px-4 py-3 text-right font-medium">Wert</th>
              <th className="px-4 py-3 text-right font-medium">Noch übrig</th>
              <th className="px-4 py-3 font-medium">Gültig bis</th>
              <th className="px-4 py-3 font-medium">Stand</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-line-soft divide-y">
            {vouchers.map((v) => {
              const expired = v.validUntil < today;
              return (
                <tr key={v.code}>
                  <td className="px-4 py-3 font-mono whitespace-nowrap">{v.code}</td>
                  <td className="px-4 py-3">{v.kind === 'allgemein' ? 'für alles' : v.kind}</td>
                  <td className="px-4 py-3 text-right">{formatEuro(v.initialCents)}</td>
                  <td className="px-4 py-3 text-right">{formatEuro(v.remainingCents)}</td>
                  <td className={cn('px-4 py-3 whitespace-nowrap', expired && 'text-danger')}>
                    {v.validUntil}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        v.status === 'aktiv' && !expired
                          ? 'success'
                          : v.status === 'entwertet'
                            ? 'danger'
                            : 'line'
                      }
                    >
                      {expired && v.status === 'aktiv' ? 'abgelaufen' : statusLabels[v.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {v.status === 'aktiv' && (
                      <button
                        onClick={() => invalidate(v)}
                        className="border-line text-muted hover:border-danger hover:text-danger min-h-12 rounded-full border px-4 text-base"
                      >
                        Entwerten
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <NewVoucherDrawer open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
