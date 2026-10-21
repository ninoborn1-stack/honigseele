import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VoucherBuilder } from '@/features/shop/voucher-builder';

export const metadata: Metadata = {
  title: 'Gutscheine',
  description: 'Gutscheine der Honigseele von 20 bis 500 €: allgemein, Kosmetik oder Pediküre. Digital, 3 Jahre gültig, online einlösbar.',
};

export default function VoucherPage() {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <VoucherBuilder />
    </Suspense>
  );
}
