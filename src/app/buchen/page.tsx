import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingFlow } from '@/features/booking/booking-flow';
import { Loading } from '@/components/ui/loading';

export const metadata: Metadata = {
  title: 'Termin buchen',
  description: 'Buche Deinen Termin in der Honigseele online: Waxing, Laser, Gesicht, Massage, Mani- & Pediküre und Wohlfühl-Pakete.',
};

export default function BookingPage() {
  return (
    <Suspense fallback={<Loading className="min-h-svh" label="Buchung wird geladen …" />}>
      <BookingFlow />
    </Suspense>
  );
}
