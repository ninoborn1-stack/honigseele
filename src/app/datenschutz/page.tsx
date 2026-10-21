import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = { title: 'Datenschutz' };

export default function Page() {
  return (
    <LegalPage title="Datenschutz">
      <p>Wir verarbeiten Deine Daten nur, um Termine, Bestellungen und den Newsletter abzuwickeln. Server in der EU, Auftragsverarbeitungsverträge mit allen Diensten.</p><h2>Demo-Hinweis</h2><p>In dieser Demo werden alle Eingaben nur lokal in Deinem Browser gespeichert. Es gibt kein Tracking und keine Cookies von Drittanbietern.</p>
    </LegalPage>
  );
}
