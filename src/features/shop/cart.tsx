'use client';
// Warenkorb-Zustand. Gespeichert über den Adapter, damit er Reloads übersteht.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getAdapter } from '@/data';
import type { CartLine } from '@/data/adapter';
import type { Product } from '@/domain/types';

interface CartCtx {
  lines: CartLine[];
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (line: CartLine) => void;
  update: (index: number, quantity: number) => void;
  remove: (index: number) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const db = getAdapter();
    const load = () => db.getCart().then(setLines);
    load();
    return db.subscribe(load);
  }, []);

  const save = useCallback((next: CartLine[]) => {
    setLines(next);
    void getAdapter().setCart(next);
  }, []);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      open,
      setOpen,
      add: (line) => {
        const i = lines.findIndex((l) => l.productId === line.productId && !l.meta && !line.meta);
        if (i >= 0) save(lines.map((l, j) => (j === i ? { ...l, quantity: l.quantity + line.quantity } : l)));
        else save([...lines, line]);
        setOpen(true);
      },
      update: (index, quantity) =>
        save(quantity <= 0 ? lines.filter((_, j) => j !== index) : lines.map((l, j) => (j === index ? { ...l, quantity } : l))),
      remove: (index) => save(lines.filter((_, j) => j !== index)),
      clear: () => save([]),
    }),
    [lines, open, save],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart außerhalb von CartProvider');
  return ctx;
}

/** Stückpreis einer Zeile (Gutscheine: frei gewählter Wert) */
export function unitPrice(line: CartLine, product: Product | undefined): number {
  if (line.meta?.valueCents) return Number(line.meta.valueCents);
  return product?.priceCents ?? 0;
}
