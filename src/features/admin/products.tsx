'use client';
// Produkte: Pflegeserie, Gutscheine, Karten – bearbeiten, neu, löschen, Bild hochladen.
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/form';
import { getAdapter } from '@/data';
import type { Product } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { AdminTitle, ImageUpload, toCents, toEuroInput } from './ui';
import { withBase } from '@/lib/config';

const kinds: Record<Product['kind'], string> = { pflege: 'Pflegeserie', gutschein: 'Gutschein', karte: 'Karte', ticket: 'Ticket' };

function ProductDrawer({ product, isNew, onClose }: { product: Product | null; isNew: boolean; onClose: () => void }) {
  const [form, setForm] = useState<Product | null>(null);
  const [price, setPrice] = useState('');
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (product && loadedFor !== product.id) {
    setLoadedFor(product.id);
    setForm(product);
    setPrice(toEuroInput(product.priceCents));
  }
  if (!product && loadedFor) setLoadedFor(null);
  const set = (patch: Partial<Product>) => form && setForm({ ...form, ...patch });
  const save = async () => {
    if (!form || !form.name.trim()) return;
    await getAdapter().saveProduct({ ...form, priceCents: toCents(price) });
    onClose();
  };
  const remove = async () => {
    if (!form || !confirm(`„${form.name}“ wirklich löschen?`)) return;
    await getAdapter().deleteProduct(form.id);
    onClose();
  };
  return (
    <Drawer
      open={Boolean(product)}
      onClose={onClose}
      title={isNew ? 'Neues Produkt' : 'Produkt bearbeiten'}
      footer={
        <div className="flex gap-2">
          {!isNew && <Button variant="ghost" onClick={remove}>Löschen</Button>}
          <Button className="flex-1" onClick={save}>Speichern</Button>
        </div>
      }
    >
      {form && (
        <div className="space-y-5">
          <ImageUpload value={form.image} onChange={(image) => set({ image })} />
          <Field label="Name"><Input value={form.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Größe"><Input value={form.size ?? ''} onChange={(e) => set({ size: e.target.value || undefined })} placeholder="50 ml" /></Field>
            <Field label="Preis (€)"><Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
            <Field label="Bestand"><Input type="number" min={0} value={form.stock} onChange={(e) => set({ stock: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Art">
            <Select value={form.kind} onChange={(e) => set({ kind: e.target.value as Product['kind'] })}>
              {Object.entries(kinds).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </Field>
          <Field label="Beschreibung"><Textarea value={form.description} onChange={(e) => set({ description: e.target.value, isPlaceholder: false })} /></Field>
          <Field label="Anwendung"><Textarea value={form.usage ?? ''} onChange={(e) => set({ usage: e.target.value || undefined })} /></Field>
          <Field label="Inhaltsstoffe"><Textarea value={form.ingredients ?? ''} onChange={(e) => set({ ingredients: e.target.value || undefined })} /></Field>
          <Checkbox label="Im Shop sichtbar" checked={form.active} onChange={(e) => set({ active: e.target.checked })} />
        </div>
      )}
    </Drawer>
  );
}

export function AdminProducts() {
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { data: products } = useData((db) => db.listProducts(), []);
  if (!products) return null;
  const openNew = () => {
    setIsNew(true);
    setEditing({ id: `produkt-${Date.now().toString(36)}`, name: '', priceCents: 0, description: '', image: '/images/stock/products.jpg', tone: 'honey', kind: 'pflege', stock: 10, active: true });
  };
  return (
    <div>
      <AdminTitle eyebrow="Shop" title="Produkte">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Neues Produkt
        </Button>
      </AdminTitle>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => {
                setIsNew(false);
                setEditing(p);
              }}
              className={cn('flex w-full items-center gap-4 rounded-2xl border border-line-soft bg-card p-3 text-left hover:border-line', !p.active && 'opacity-50')}
            >
              <img src={withBase(p.image)} alt="" className="h-20 w-16 shrink-0 rounded-xl object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-serif text-xl">{p.name}</span>
                <span className="block text-xs text-muted">
                  {kinds[p.kind]} {p.size && `· ${p.size}`}
                </span>
                <span className="mt-1 flex items-center gap-2 text-sm">
                  {formatEuro(p.priceCents)}
                  {p.kind === 'pflege' && <Badge tone={p.stock <= 3 ? 'danger' : 'line'}>{p.stock} auf Lager</Badge>}
                  {!p.active && <Badge>versteckt</Badge>}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <ProductDrawer product={editing} isNew={isNew} onClose={() => setEditing(null)} />
    </div>
  );
}
