'use client';
import { useEffect } from 'react';
import { withBase } from '@/lib/config';

/**
 * Registriert den Service Worker (Offline-Shell) nur im Produktions-Build.
 * Prüft bei jedem Aufruf auf eine neue Version und lädt einmal neu, sobald sie übernimmt –
 * so landet jeder Deploy sofort beim Besucher.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloaded = false;
    const onChange = () => {
      if (!hadController || reloaded) return;
      reloaded = true;
      location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onChange);
    navigator.serviceWorker
      .register(withBase('/sw.js'), { updateViaCache: 'none' })
      .then(async (reg) => {
        await reg.update();
        // Wartende neue Version sofort übernehmen lassen
        const push = (w: ServiceWorker | null) => w?.postMessage('SKIP_WAITING');
        push(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const next = reg.installing;
          next?.addEventListener('statechange', () => next.state === 'installed' && push(next));
        });
      })
      .catch(() => undefined);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onChange);
  }, []);
  return null;
}
