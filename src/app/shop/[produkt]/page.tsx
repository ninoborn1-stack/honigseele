import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products } from '@/content';
import { SITE_URL } from '@/lib/config';
import { ProductDetail } from '@/features/shop/product-detail';

const careProducts = products.filter((p) => p.kind === 'pflege');

export function generateStaticParams() {
  return careProducts.map((p) => ({ produkt: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ produkt: string }> }): Promise<Metadata> {
  const { produkt } = await params;
  const p = careProducts.find((x) => x.id === produkt);
  if (!p) return {};
  return { title: `${p.name}${p.size ? ` ${p.size}` : ''}`, description: p.description };
}

export default async function ProductPage({ params }: { params: Promise<{ produkt: string }> }) {
  const { produkt } = await params;
  const product = careProducts.find((p) => p.id === produkt);
  if (!product) notFound();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: 'Honigseele' },
    image: `${SITE_URL}${product.image}`,
    offers: {
      '@type': 'Offer',
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: 'EUR',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/shop/${product.id}/`,
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail initial={product} />
    </>
  );
}
