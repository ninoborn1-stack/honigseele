import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = { title: 'Impressum' };

export default function Page() {
  return (
    <LegalPage title="Impressum">
      <p>Angaben gemäß § 5 DDG. Inhaberin: Anna Kaiser. Rechtsform und USt-ID: noch offen.</p>
    </LegalPage>
  );
}
