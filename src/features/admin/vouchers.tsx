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
import { AdminTitle, Panel, statusLabels, toCents } from './ui';

function NewVoucherDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const today = berlinDate(new Date());
  const [form, setForm] = useState({ code: generateVoucherCode(), value: '50', kind: 'allgemein' as Voucher['kind'], validUntil: addDaysToDate(today, 365 * 3), recipient: '', message: '' });
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
    setForm({ ...form, code: generateVoucherCode(), recipient: '', message: '' });
    onClose();
  };
  return (
    <Drawer open={open} onClose={onClose} title="Neuer Gutschein" footer={<Button className="w-full" onClick={save}>Gutschein anlegen</Button>}>
      <div className="space-y-5">
        <Field label="Code">
          <div className="flex gap-2">
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="font-mono uppercase" />
            <Button variant="ghost" type="button" onClick={() => setForm({ ...form, code: generateVoucherCode() })}>
              Neu
            </Button>
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Wert (€)"><Input inputMode="decimal" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field>
          <Field label="Art">
            <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Voucher['kind'] })}>
              <option value="allgemein">Allgemein</option>
              <option value="kosmetik">Kosmetik</option>
              <option value="pediküre">Pediküre</option>
            </Select>
          </Field>
        </div>
        <Field label="Gültig bis"><Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} /></Field>
        <Field label="Für (optional)"><Input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} /></Field>
        <Field label="Nachricht (optional)"><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
      </div>
    </Drawer>
  );
}

export function AdminVouchers() {
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<VoucherCheck | null>(null);
  const { data: vouchers } = useData((db) => db.listVouchers(), []);
  if (!vouchers) return null;
  const today = berlinDate(new Date());

  const check = async () => setResult(await getAdapter().checkVoucher(code, Number.MAX_SAFE_INTEGER));
  const invalidate = async (v: Voucher) => {
    if (!confirm(`Gutschein ${v.code} entwerten? Der Restwert von ${formatEuro(v.remainingCents)} verfällt.`)) return;
    await getAdapter().saveVoucher({ ...v, status: 'entwertet' });
    setResult(null);
  };

  return (
    <div>
      <AdminTitle eyebrow="Gutscheine" title={`${vouchers.filter((v) => v.status === 'aktiv' && v.validUntil >= today).length} aktive Gutscheine`}>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Neuer Gutschein
        </Button>
      </AdminTitle>

      <Panel title="Gutschein prüfen" className="mb-6">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void check();
          }}
        >
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code eingeben, z. B. HONIG50" className="font-mono uppercase" aria-label="Code" />
          <Button type="submit" disabled={!code.trim()}>Prüfen</Button>
        </form>
        {result && (
          <div className={cn('mt-4 rounded-xl p-4 text-sm', result.ok ? 'bg-success/10' : 'bg-danger/10')}>
            {result.ok ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p>
                  <span className="font-medium text-success">Gültig.</span> Restwert {formatEuro(result.voucher.remainingCents)} von {formatEuro(result.voucher.initialCents)}, gültig bis {result.voucher.validUntil}.
                </p>
                <Button size="sm" variant="ghost" onClick={() => invalidate(result.voucher)}>
                  Entwerten
                </Button>
              </div>
            ) : (
              <p className="text-danger">{voucherMessages[result.reason]}</p>
            )}
          </div>
        )}
      </Panel>

      <div className="overflow-x-auto rounded-2xl border border-line-soft bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line-soft text-left text-xs uppercase tracking-[0.14em] text-muted">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Art</th>
              <th className="px-4 py-3 text-right font-medium">Wert</th>
              <th className="px-4 py-3 text-right font-medium">Restwert</th>
              <th className="px-4 py-3 font-medium">Gültig bis</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {vouchers.map((v) => {
              const expired = v.validUntil < today;
              return (
                <tr key={v.code}>
                  <td className="px-4 py-3 font-mono">{v.code}</td>
                  <td className="px-4 py-3 capitalize">{v.kind}</td>
                  <td className="px-4 py-3 text-right">{formatEuro(v.initialCents)}</td>
                  <td className="px-4 py-3 text-right">{formatEuro(v.remainingCents)}</td>
                  <td className={cn('px-4 py-3', expired && 'text-danger')}>{v.validUntil}</td>
                  <td className="px-4 py-3">
                    <Badge tone={v.status === 'aktiv' && !expired ? 'success' : v.status === 'entwertet' ? 'danger' : 'line'}>{expired && v.status === 'aktiv' ? 'abgelaufen' : statusLabels[v.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {v.status === 'aktiv' && (
                      <button onClick={() => invalidate(v)} className="min-h-10 rounded-full px-3 text-xs text-muted hover:text-danger">
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
