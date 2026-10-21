'use client';
// Leistungen & Preise: CRUD inkl. Preis und Dauer je Anbieterin.
import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/form';
import { getAdapter } from '@/data';
import type { Audience, Category, Service, Staff, StaffService } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatDuration, formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { AdminTitle, Empty, toCents, toEuroInput } from './ui';

interface Row {
  offers: boolean;
  price: string;
  duration: string;
}

function ServiceDrawer({
  service,
  isNew,
  onClose,
  categories,
  staff,
  staffServices,
}: {
  service: Service | null;
  isNew: boolean;
  onClose: () => void;
  categories: Category[];
  staff: Staff[];
  staffServices: StaffService[];
}) {
  const [form, setForm] = useState<Service | null>(service);
  const [price, setPrice] = useState(toEuroInput(service?.priceCents));
  const [reduced, setReduced] = useState(toEuroInput(service?.reducedPriceCents));
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  // Formular neu befüllen, wenn eine andere Leistung geöffnet wird
  if (service && loadedFor !== service.id) {
    setLoadedFor(service.id);
    setForm(service);
    setPrice(toEuroInput(service.priceCents));
    setReduced(toEuroInput(service.reducedPriceCents));
    setRows(
      Object.fromEntries(
        staff.map((p) => {
          const r = staffServices.find((x) => x.serviceId === service.id && x.staffId === p.id);
          return [p.id, { offers: Boolean(r), price: toEuroInput(r?.priceCents), duration: r?.durationMin ? String(r.durationMin) : '' }];
        }),
      ),
    );
  }
  if (!service && loadedFor) setLoadedFor(null);

  const save = async () => {
    if (!form || !form.name.trim()) return;
    const saved: Service = {
      ...form,
      priceCents: toCents(price),
      reducedPriceCents: reduced.trim() ? toCents(reduced) : undefined,
    };
    const db = getAdapter();
    await db.saveService(saved);
    await db.setStaffServices(
      saved.id,
      Object.entries(rows)
        .filter(([, r]) => r.offers)
        .map(([staffId, r]) => ({
          staffId,
          serviceId: saved.id,
          ...(r.price.trim() ? { priceCents: toCents(r.price) } : {}),
          ...(r.duration.trim() ? { durationMin: Number(r.duration) } : {}),
        })),
    );
    onClose();
  };
  const remove = async () => {
    if (!form || !confirm(`„${form.name}“ wirklich löschen? Bestehende Termine bleiben erhalten.`)) return;
    await getAdapter().deleteService(form.id);
    onClose();
  };
  const set = (patch: Partial<Service>) => form && setForm({ ...form, ...patch });

  return (
    <Drawer
      open={Boolean(service)}
      onClose={onClose}
      title={isNew ? 'Neue Leistung' : 'Leistung bearbeiten'}
      footer={
        <div className="flex gap-2">
          {!isNew && (
            <Button variant="ghost" onClick={remove}>
              Löschen
            </Button>
          )}
          <Button className="flex-1" onClick={save}>
            Speichern
          </Button>
        </div>
      }
    >
      {form && (
        <div className="space-y-5">
          <Field label="Name"><Input value={form.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bereich">
              <Select value={form.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Gruppe"><Input value={form.group ?? ''} onChange={(e) => set({ group: e.target.value || undefined })} placeholder="z. B. Damen" /></Field>
          </div>
          <Field label="Beschreibung"><Textarea value={form.description ?? ''} onChange={(e) => set({ description: e.target.value || undefined })} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Preis (€)"><Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
            <Field label="Ermäßigt (€)"><Input inputMode="decimal" value={reduced} onChange={(e) => setReduced(e.target.value)} placeholder="–" /></Field>
            <Field label="Dauer (Min.)"><Input type="number" min={5} step={5} value={form.durationMin} onChange={(e) => set({ durationMin: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Zielgruppe">
            <Select value={form.audience} onChange={(e) => set({ audience: e.target.value as Audience })}>
              <option value="alle">Alle</option>
              <option value="damen">Damen</option>
              <option value="herren">Herren</option>
            </Select>
          </Field>
          <div>
            <Checkbox label="Aktiv (auf der Website sichtbar)" checked={form.active} onChange={(e) => set({ active: e.target.checked })} />
            <Checkbox label="Online buchbar" checked={form.bookable} onChange={(e) => set({ bookable: e.target.checked })} />
            <Checkbox label="Nur nach Vorgespräch (Laser)" checked={Boolean(form.requiresConsultation)} onChange={(e) => set({ requiresConsultation: e.target.checked })} />
            <Checkbox label="„ab“-Preis anzeigen" checked={Boolean(form.priceFrom)} onChange={(e) => set({ priceFrom: e.target.checked })} />
          </div>

          <div>
            <p className="eyebrow mb-1">Preis je Anbieterin</p>
            <p className="mb-3 text-xs text-muted">Leer lassen = Basispreis bzw. Basisdauer.</p>
            <ul className="divide-y divide-line-soft border-y border-line-soft">
              {staff.filter((p) => p.bookable).map((p) => {
                const r = rows[p.id] ?? { offers: false, price: '', duration: '' };
                const upd = (patch: Partial<Row>) => setRows({ ...rows, [p.id]: { ...r, ...patch } });
                return (
                  <li key={p.id} className="grid grid-cols-[1fr_5rem_4.5rem] items-center gap-2 py-2">
                    <label className="flex min-h-11 items-center gap-3 text-sm">
                      <input type="checkbox" className="h-5 w-5 accent-amber-600" checked={r.offers} onChange={(e) => upd({ offers: e.target.checked })} />
                      {p.name}
                    </label>
                    <Input aria-label={`Preis ${p.name}`} className="!min-h-10 !px-2 text-sm" inputMode="decimal" placeholder={toEuroInput(toCents(price))} value={r.price} disabled={!r.offers} onChange={(e) => upd({ price: e.target.value })} />
                    <Input aria-label={`Dauer ${p.name}`} className="!min-h-10 !px-2 text-sm" type="number" placeholder={String(form.durationMin)} value={r.duration} disabled={!r.offers} onChange={(e) => upd({ duration: e.target.value })} />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </Drawer>
  );
}

export function AdminServices() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('alle');
  const [editing, setEditing] = useState<Service | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { data } = useData(async (db) => {
    const [services, categories, staff, staffServices] = await Promise.all([db.listServices(), db.listCategories(), db.listStaff(), db.listStaffServices()]);
    return { services, categories, staff, staffServices };
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.services.filter((s) => (cat === 'alle' || s.categoryId === cat) && (!q || `${s.name} ${s.group ?? ''}`.toLowerCase().includes(q)));
  }, [data, query, cat]);

  if (!data) return null;
  const { categories, staff, staffServices } = data;

  const openNew = () => {
    setIsNew(true);
    setEditing({
      id: `leistung-${Date.now().toString(36)}`,
      categoryId: cat === 'alle' ? categories[0].id : cat,
      name: '',
      durationMin: 30,
      priceCents: 0,
      audience: 'alle',
      bookable: true,
      active: true,
    });
  };

  return (
    <div>
      <AdminTitle eyebrow="Leistungen & Preise" title={`${data.services.length} Leistungen`}>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Neue Leistung
        </Button>
      </AdminTitle>
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.5} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Leistung suchen" className="!pl-11" aria-label="Leistung suchen" />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="md:!w-64" aria-label="Bereich">
          <option value="alle">Alle Bereiche</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>

      <div className="mt-6 space-y-8">
        {categories
          .filter((c) => filtered.some((s) => s.categoryId === c.id))
          .map((c) => (
            <section key={c.id}>
              <h2 className="mb-2 text-3xl">{c.name}</h2>
              <ul className="divide-y divide-line-soft rounded-2xl border border-line-soft bg-card">
                {filtered
                  .filter((s) => s.categoryId === c.id)
                  .map((s) => {
                    const people = staffServices.filter((r) => r.serviceId === s.id);
                    const custom = people.filter((r) => r.priceCents !== undefined && r.priceCents !== s.priceCents);
                    return (
                      <li key={s.id}>
                        <button
                          onClick={() => {
                            setIsNew(false);
                            setEditing(s);
                          }}
                          className={cn('grid min-h-14 w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-cream-50', !s.active && 'opacity-50')}
                        >
                          <span className="min-w-0">
                            <span className="block truncate">
                              {s.name} {s.group && <span className="text-xs text-muted">· {s.group}</span>}
                            </span>
                            <span className="text-xs text-muted">
                              {formatDuration(s.durationMin)} · {people.length} {people.length === 1 ? 'Person' : 'Personen'}
                              {custom.length > 0 && ` · ${custom.length} mit eigenem Preis`}
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            {!s.active && <Badge>inaktiv</Badge>}
                            {s.requiresConsultation && <Badge tone="honey">Vorgespräch</Badge>}
                            <span className="font-serif text-xl">{formatEuro(s.priceCents, { from: s.priceFrom })}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </section>
          ))}
        {filtered.length === 0 && <Empty>Keine Leistung gefunden.</Empty>}
      </div>
      <ServiceDrawer service={editing} isNew={isNew} onClose={() => setEditing(null)} categories={categories} staff={staff} staffServices={staffServices} />
    </div>
  );
}
