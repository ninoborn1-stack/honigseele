'use client';
import { CalendarHeart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/** Buchen-Button, der auf Leistungsseiten immer erreichbar bleibt (mobil über der Bottom-Nav) */
export function StickyBook({ href, label }: { href: string; label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 420);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <Link
      href={href}
      data-label="Buchen"
      className={cn(
        'fixed left-1/2 z-40 flex min-h-12 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-honey-950 px-6 text-sm font-medium text-cream-50 shadow-xl shadow-honey-950/25 transition-all duration-500',
        'bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-8',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0',
      )}
    >
      <CalendarHeart className="h-4 w-4 text-honey-300" strokeWidth={1.5} />
      <span className="sm:hidden">Jetzt buchen</span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
