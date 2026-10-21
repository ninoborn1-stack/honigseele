import { Eyebrow, Section } from '@/components/ui/typography';

export const metadata = { title: 'Offline' };

export default function OfflinePage() {
  return (
    <Section tone="light" className="text-center">
      <Eyebrow>Keine Verbindung</Eyebrow>
      <h1 className="mt-5 text-5xl">
        Kurz <em>durchatmen</em>.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-muted">Du bist gerade offline. Sobald Du wieder Netz hast, geht es weiter. Deine Termine im Konto sind gespeichert.</p>
    </Section>
  );
}
