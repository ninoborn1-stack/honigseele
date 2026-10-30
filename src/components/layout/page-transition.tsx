'use client';
// Seitenwechsel: Seite blendet weich aus (Opacity + leichter Versatz), neue Seite blendet ein.
// Die Navigation startet sofort – nichts wird künstlich verzögert. Die Blume erscheint nur,
// wenn die neue Seite länger braucht (MOTION.page.veilDelayMs). Danach Fokus auf die Hauptüberschrift.
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { FlowerOfLife } from '@/components/brand/flower-of-life';
import { stripBase } from '@/lib/config';
import { MOTION } from '@/lib/motion-config';

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const first = useRef(true);
  const veilTimer = useRef<number>(0);

  // Ankunft auf neuer Seite: einblenden, Anker oder nach oben, Fokus auf H1
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const html = document.documentElement;
    window.clearTimeout(veilTimer.current);
    html.classList.remove('page-loading', 'page-out');
    html.classList.add('page-in-start');
    const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
    // Startzustand anwenden (Reflow), dann sofort zum Endzustand übergehen lassen
    void document.querySelector<HTMLElement>('[data-page]')?.offsetWidth;
    html.classList.remove('page-in-start');
    const h1 = document.querySelector<HTMLElement>('main h1');
    if (h1 && !target) {
      h1.tabIndex = -1;
      h1.focus({ preventScroll: true });
    }
  }, [pathname]);

  // Klick auf interne Links abfangen (Capture-Phase, vor next/link)
  useEffect(() => {
    const html = document.documentElement;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const a = (e.target as Element).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      html.classList.add('page-out');
      window.clearTimeout(veilTimer.current);
      veilTimer.current = window.setTimeout(() => html.classList.add('page-loading'), MOTION.page.veilDelayMs);
      router.push(stripBase(url.pathname) + url.search + url.hash);
    };
    // Zurück-Taste aus dem Cache: nichts hängen lassen
    const onShow = () => html.classList.remove('page-out', 'page-loading', 'page-in-start');
    document.addEventListener('click', onClick, true);
    addEventListener('pageshow', onShow);
    return () => {
      document.removeEventListener('click', onClick, true);
      removeEventListener('pageshow', onShow);
    };
  }, [router]);

  return (
    <>
      <div data-page>{children}</div>
      <div className="page-veil" role="status" aria-live="polite">
        <FlowerOfLife size={72} animate="bloom" label="Lädt …" />
      </div>
    </>
  );
}
