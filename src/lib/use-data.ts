'use client';
// Lädt Daten über den DataAdapter und lädt nach jeder Änderung neu.
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAdapter, type DataAdapter } from '@/data';

export function useData<T>(
  fetcher: (db: DataAdapter) => Promise<T>,
  deps: unknown[] = [],
  initial?: T,
): { data: T | undefined; loading: boolean; reload: () => void } {
  const [data, setData] = useState<T | undefined>(initial);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef(fetcher);
  fetchRef.current = fetcher;

  const load = useCallback(() => {
    let alive = true;
    fetchRef
      .current(getAdapter())
      .then((d) => alive && setData(d))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    let cancel = load();
    const unsub = getAdapter().subscribe(() => {
      cancel();
      cancel = load();
    });
    return () => {
      cancel();
      unsub();
    };
  }, [load]);

  return { data, loading, reload: load };
}

export function useSession() {
  const { data, loading } = useData((db) => db.getSession(), [], null);
  return { session: data ?? null, loading };
}

/** Admin-editierbarer Textblock: statischer Wert aus content/, im Browser durch den Adapter ersetzt */
export function useBlock(id: string, fallback: string): string {
  const { data } = useData((db) => db.listBlocks(), []);
  return data?.find((b) => b.id === id)?.value ?? fallback;
}
