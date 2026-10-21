'use client';
// Kopfbereich: Demo-Leiste + Navigation, immer sichtbar (fixiert).
// Setzt --top-h, damit Inhalte darunter beginnen. Auf der Startseite liegt er über dem Hero.
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { DemoBar } from './demo-bar';
import { Header } from './header';

export function SiteTop() {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const inFlow = pathname.startsWith('/admin') || pathname.startsWith('/buchen');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty('--top-h', `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [inFlow]);

  if (inFlow) return <DemoBar />;
  return (
    <>
      <div ref={ref} className="fixed inset-x-0 top-0 z-50">
        <DemoBar />
        <Header />
      </div>
      {/* Platzhalter, damit Unterseiten nicht unter der Kopfzeile beginnen */}
      {pathname !== '/' && <div aria-hidden style={{ height: 'var(--top-h, 96px)' }} />}
    </>
  );
}
