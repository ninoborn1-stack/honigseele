import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = { title: 'Widerrufsbelehrung' };

export default function Page() {
  return (
    <LegalPage title="Widerrufsbelehrung">
      <h2 id="widerrufen">Vertrag widerrufen</h2><p>Hier entsteht der gesetzlich vorgeschriebene Button „Vertrag widerrufen“ mit Formular.</p>
    </LegalPage>
  );
}
