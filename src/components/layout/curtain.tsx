'use client';
// Vorhang-Übergang: fünf Streifen, nur CSS-animiert. JS setzt is-leaving / is-entering am <html>.
// Angepasst an den Next-Router: kein Neuladen, sondern router.push nach dem Schließen.
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { stripBase } from '@/lib/config';

const CLOSE_MS = 760;
const QUICK_MS = 420;
/** In diesen Bereichen wäre der Vorhang zu viel */
const quiet = (path: string) => path.startsWith('/buchen') || path.startsWith('/admin') || path.startsWith('/kasse');

export function Curtain() {
  const router = useRouter();
  const pathname = usePathname();
  const labelRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // Neue Seite angekommen → Vorhang öffnen
  useEffect(() => {
    const root = document.documentElement;
    if (first.current) {
      first.current = false;
      return;
    }
    if (!root.classList.contains('is-leaving')) return;
    // Anker (z. B. /#newsletter) anspringen, sonst nach oben
    const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
    root.classList.remove('is-leaving');
    root.classList.add('is-entering');
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const a = (e.target as Element).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.noCurtain !== undefined) return;
      const href = a.getAttribute('href') || '';
      if (/^(#|mailto:|tel:|https?:)/.test(href) && !href.startsWith(location.origin)) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return;
      // Router-Pfade sind ohne Unterordner (basePath)
      const target = stripBase(url.pathname);
      if (quiet(target) && quiet(stripBase(location.pathname))) return;

      e.preventDefault();
      e.stopPropagation();
      const quick = Boolean(a.closest('[data-quick-curtain]'));
      root.classList.toggle('is-quick', quick);
      if (labelRef.current) labelRef.current.textContent = (a.dataset.label || a.textContent || '').trim().slice(0, 28);
      root.classList.remove('is-entering');
      void root.offsetWidth;
      root.classList.add('is-leaving');
      router.prefetch(target + url.search);
      window.setTimeout(() => router.push(target + url.search + url.hash), quick ? QUICK_MS : CLOSE_MS);
    };
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === 'curtainOut') root.classList.remove('is-entering', 'is-quick');
    };
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) root.classList.remove('is-leaving', 'is-entering');
    };
    // Capture-Phase: vor dem Klick-Handler von next/link
    document.addEventListener('click', onClick, true);
    root.addEventListener('animationend', onEnd);
    window.addEventListener('pageshow', onShow);
    return () => {
      document.removeEventListener('click', onClick, true);
      root.removeEventListener('animationend', onEnd);
      window.removeEventListener('pageshow', onShow);
    };
  }, [router]);

  return (
    <div className="curtain" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} style={{ ['--i' as string]: i }} />
      ))}
      <div ref={labelRef} className="curtain-label" />
    </div>
  );
}
