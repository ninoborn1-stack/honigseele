import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = { title: 'Allgemeine Geschäftsbedingungen' };

export default function Page() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen">
      <h2>Terminabsage</h2><p>Termine können bis 24 Stunden vorher kostenlos abgesagt werden. Danach berechnen wir 50 % der Ursprungssumme.</p>
    </LegalPage>
  );
}
