'use client';
import type { ReactNode } from 'react';
import { CartDrawer } from '@/features/shop/cart-drawer';
import { CartProvider } from '@/features/shop/cart';
import { LocaleProvider } from '@/lib/i18n';
import { ServiceWorker } from '@/lib/service-worker';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <CartProvider>
        {children}
        <CartDrawer />
        <ServiceWorker />
      </CartProvider>
    </LocaleProvider>
  );
}
