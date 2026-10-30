import { Suspense } from 'react';
import { Loading } from '@/components/ui/loading';
import { AdminCalendar } from '@/features/admin/calendar';

export default function AdminCalendarPage() {
  return (
    <Suspense fallback={<Loading label="Kalender wird geladen …" />}>
      <AdminCalendar />
    </Suspense>
  );
}
