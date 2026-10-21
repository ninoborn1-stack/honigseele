import type { Metadata } from 'next';
import { products } from '@/content';
import { ShopOverview } from '@/features/shop/shop-overview';

export const metadata: Metadata = {
  title: 'Shop – Naturkosmetik, Gutscheine & Karten',
  description:
    'Die Naturkosmetik-Pflegeserie der Honigseele, handgemacht in der Crememanufaktur Berlin. Dazu Gutscheine von 20 bis 500 € und Yoga-Karten.',
};

export default function ShopPage() {
  return <ShopOverview initialProducts={products} />;
}
