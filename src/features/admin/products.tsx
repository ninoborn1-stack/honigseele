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
import { Loading } from '@/components/ui/loading';
import { AdminTitle, ImageUpload, MoreOptions, notify, toCents, toEuroInput } from './ui';
import { imageUrl } from '@/components/ui/photo';

const kinds: Record<Product['kind'], string> = {
  pflege: 'Pflegeserie',
  gutschein: 'Gutschein',
  karte: 'Karte',
  ticket: 'Ticket',
};

function ProductDrawer({
  product,
  isNew,
  onClose,
}: {
  product: Product | null;
  isNew: boolean;
  onClose: () => void;
}) {
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
    notify('Gespeichert.');
    onClose();
  };
  const remove = async () => {
    if (!form || !confirm(`„${form.name}“ wirklich löschen?`)) return;
    await getAdapter().deleteProduct(form.id);
    notify('Produkt gelöscht.');
    onClose();
  };
  return (
    <Drawer
      open={Boolean(product)}
      onClose={onClose}
      title={isNew ? 'Neues Produkt' : 'Produkt bearbeiten'}
      footer={
        <Button size="lg" className="w-full" onClick={save} disabled={!form?.name.trim()}>
          Speichern
        </Button>
      }
    >
      {form && (
        <div className="space-y-5">
          <ImageUpload value={form.image} onChange={(image) => set({ image })} />
          <Field label="Name">
            <Input value={form.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preis in €">
              <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </Field>
            <Field label="Wie viele da?">
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set({ stock: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="Beschreibung">
            <Textarea
              value={form.description}
              onChange={(e) => set({ description: e.target.value, isPlaceholder: false })}
            />
          </Field>
          <Checkbox
            label={<span className="text-base">Im Shop zeigen</span>}
            checked={form.active}
            onChange={(e) => set({ active: e.target.checked })}
          />
          <MoreOptions>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Größe">
                <Input
                  value={form.size ?? ''}
                  onChange={(e) => set({ size: e.target.value || undefined })}
                  placeholder="50 ml"
                />
              </Field>
              <Field label="Art">
                <Select
                  value={form.kind}
                  onChange={(e) => set({ kind: e.target.value as Product['kind'] })}
                >
                  {Object.entries(kinds).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Anwendung">
              <Textarea
                value={form.usage ?? ''}
                onChange={(e) => set({ usage: e.target.value || undefined })}
              />
            </Field>
            <Field label="Inhaltsstoffe">
              <Textarea
                value={form.ingredients ?? ''}
                onChange={(e) => set({ ingredients: e.target.value || undefined })}
              />
            </Field>
            {!isNew && (
              <Button variant="ghost" size="lg" className="w-full" onClick={remove}>
                Produkt löschen
              </Button>
            )}
          </MoreOptions>
        </div>
      )}
    </Drawer>
  );
}

export function AdminProducts() {
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { data: products } = useData((db) => db.listProducts(), []);
  if (!products) return <Loading label="Produkte werden geladen …" />;
  const openNew = () => {
    setIsNew(true);
    setEditing({
      id: `produkt-${Date.now().toString(36)}`,
      name: '',
      priceCents: 0,
      description: '',
      image: 'product.placeholder',
      tone: 'honey',
      kind: 'pflege',
      stock: 10,
      active: true,
    });
  };
  return (
    <div>
      <AdminTitle eyebrow="Shop" title="Produkte">
        <Button size="lg" onClick={openNew}>
          <Plus className="h-5 w-5" strokeWidth={1.5} /> Neues Produkt
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
              className={cn(
                'border-line-soft bg-card hover:border-honey-950 flex w-full items-center gap-4 rounded-2xl border p-3 text-left',
                !p.active && 'opacity-60',
              )}
            >
              <img
                src={imageUrl(p.image)}
                alt=""
                className="h-20 w-16 shrink-0 rounded-xl object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-serif text-xl">{p.name}</span>
                <span className="text-muted block text-sm">
                  {kinds[p.kind]} {p.size && `· ${p.size}`}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-base">
                  {formatEuro(p.priceCents)}
                  {p.kind === 'pflege' && (
                    <Badge tone={p.stock <= 3 ? 'danger' : 'line'}>noch {p.stock} da</Badge>
                  )}
                  {!p.active && <Badge>nicht im Shop</Badge>}
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
