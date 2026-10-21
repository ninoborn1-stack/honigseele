import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingFlow } from '@/features/booking/booking-flow';

export const metadata: Metadata = {
  title: 'Termin buchen',
  description: 'Buche Deinen Termin in der Honigseele online: Waxing, Laser, Gesicht, Massage, Mani- & Pediküre und Wohlfühl-Pakete.',
};

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <BookingFlow />
    </Suspense>
  );
}
