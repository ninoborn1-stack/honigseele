'use client';
import { useEffect } from 'react';
import { withBase } from '@/lib/config';

/** Registriert den Service Worker (Offline-Shell) nur im Produktions-Build. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register(withBase('/sw.js')).catch(() => undefined);
  }, []);
  return null;
}
