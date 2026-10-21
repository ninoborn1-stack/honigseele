import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = { title: 'Zahlung & Versand' };

export default function Page() {
  return (
    <LegalPage title="Zahlung & Versand">
      <p>Zahlung per Karte, PayPal, Klarna oder Apple Pay. Versand innerhalb Deutschlands 3 €. Gutscheine kommen digital per E-Mail.</p>
    </LegalPage>
  );
}
