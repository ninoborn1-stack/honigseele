import type { Metadata } from 'next';
import { Account } from '@/features/account/account';

export const metadata: Metadata = { title: 'Mein Konto', robots: { index: false } };

export default function AccountPage() {
  return <Account />;
}
