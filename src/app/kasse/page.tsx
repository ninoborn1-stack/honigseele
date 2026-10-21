import type { Metadata } from 'next';
import { Checkout } from '@/features/shop/checkout';

export const metadata: Metadata = { title: 'Kasse', robots: { index: false } };

export default function CheckoutPage() {
  return <Checkout />;
}
