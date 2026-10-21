'use client';
// Bestellungen: Liste, Detail, Status ändern.
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Tabs } from '@/components/ui/tabs';
import { getAdapter } from '@/data';
import { formatDateShort } from '@/domain/time';
import type { Customer, Order, OrderStatus } from '@/domain/types';
import { berlinTime, formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { AdminTitle, Empty, statusLabels } from './ui';

const next: Partial<Record<OrderStatus, OrderStatus>> = { bezahlt: 'versendet', versendet: 'abgeschlossen' };
const nextLabel: Partial<Record<OrderStatus, string>> = { bezahlt: 'Als versendet markieren', versendet: 'Abschließen' };

function OrderDrawer({ order, customer, onClose }: { order: Order | null; customer?: Customer; onClose: () => void }) {
  const setStatus = async (status: OrderStatus) => {
    if (!order) return;
    if (status === 'storniert' && !confirm('Bestellung stornieren?')) return;
    await getAdapter().setOrderStatus(order.id, status);
  };
  return (
    <Drawer
      open={Boolean(order)}
      onClose={onClose}
      title={order?.number ?? 'Bestellung'}
      footer={
        order &&
        order.status !== 'storniert' &&
        order.status !== 'abgeschlossen' && (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStatus('storniert')}>Stornieren</Button>
            {next[order.status] && (
              <Button className="flex-1" onClick={() => setStatus(next[order.status]!)}>
                {nextLabel[order.status]}
              </Button>
            )}
          </div>
        )
      }
    >
      {order && (
        <div className="space-y-5 text-sm">
          <div className="flex items-center justify-between">
            <p className="text-muted">
              {formatDateShort(order.createdAt)}, {berlinTime(order.createdAt)}
            </p>
            <Badge tone={order.status === 'bezahlt' ? 'honey' : order.status === 'storniert' ? 'danger' : 'line'}>{statusLabels[order.status]}</Badge>
          </div>
          {customer && (
            <div className="rounded-xl bg-cream-100 p-4">
              <p className="font-medium">{customer.firstName} {customer.lastName}</p>
              <p className="text-muted">{customer.email}</p>
            </div>
          )}
          {order.shippingAddress && (
            <div>
              <p className="eyebrow mb-1">Versand an</p>
              <p>
                {order.shippingAddress.name}
                <br />
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.zip} {order.shippingAddress.city}
              </p>
            </div>
          )}
          <ul className="divide-y divide-line-soft border-y border-line-soft">
            {order.items.map((i, n) => (
              <li key={n} className="flex justify-between gap-3 py-3">
                <span>
                  {i.quantity} × {i.name}
                  {i.meta?.code && <span className="block text-xs text-muted">Code {i.meta.code}{i.meta.recipient && ` · für ${i.meta.recipient}`}</span>}
                </span>
                {formatEuro(i.unitCents * i.quantity)}
              </li>
            ))}
          </ul>
          <dl className="space-y-1">
            <div className="flex justify-between"><dt className="text-muted">Zwischensumme</dt><dd>{formatEuro(order.subtotalCents)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Versand</dt><dd>{formatEuro(order.shippingCents)}</dd></div>
            {order.voucherCents > 0 && <div className="flex justify-between"><dt className="text-muted">Gutschein</dt><dd>−{formatEuro(order.voucherCents)}</dd></div>}
            <div className="flex justify-between font-serif text-2xl"><dt>Gesamt</dt><dd>{formatEuro(order.totalCents)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Zahlung</dt><dd>{order.payment.method} · {order.payment.status}</dd></div>
          </dl>
        </div>
      )}
    </Drawer>
  );
}

export function AdminOrders() {
  const [filter, setFilter] = useState<'offen' | 'alle'>('offen');
  const [openId, setOpenId] = useState<string | null>(null);
  const { data } = useData(async (db) => {
    const [orders, customers] = await Promise.all([db.listOrders(), db.listCustomers()]);
    return { orders, customers };
  }, []);
  if (!data) return null;
  const { orders, customers } = data;
  const list = filter === 'offen' ? orders.filter((o) => o.status === 'bezahlt') : orders;
  const open = orders.find((o) => o.id === openId) ?? null;
  return (
    <div>
      <AdminTitle eyebrow="Shop" title="Bestellungen">
        <Tabs value={filter} onChange={setFilter} options={[{ value: 'offen', label: 'Zu versenden' }, { value: 'alle', label: 'Alle' }]} />
      </AdminTitle>
      {list.length === 0 ? (
        <Empty>{filter === 'offen' ? 'Alles versendet.' : 'Noch keine Bestellungen.'}</Empty>
      ) : (
        <ul className="divide-y divide-line-soft rounded-2xl border border-line-soft bg-card">
          {list.map((o) => {
            const c = customers.find((x) => x.id === o.customerId);
            return (
              <li key={o.id}>
                <button onClick={() => setOpenId(o.id)} className="grid min-h-16 w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-cream-50">
                  <span className="min-w-0">
                    <span className="block font-medium">
                      {o.number} · {c ? `${c.firstName} ${c.lastName}` : 'Kundin'}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {formatDateShort(o.createdAt)} · {o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="font-serif text-xl">{formatEuro(o.totalCents)}</span>
                    <Badge tone={o.status === 'bezahlt' ? 'honey' : o.status === 'storniert' ? 'danger' : 'line'}>{statusLabels[o.status]}</Badge>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <OrderDrawer order={open} customer={customers.find((c) => c.id === open?.customerId)} onClose={() => setOpenId(null)} />
    </div>
  );
}
