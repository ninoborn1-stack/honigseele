import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MailPreview } from '@/features/mails/mail-preview';

export const metadata: Metadata = { title: 'Mail-Vorschau', robots: { index: false } };

export default function MailsPage() {
  return (
    <Suspense>
      <MailPreview />
    </Suspense>
  );
}
