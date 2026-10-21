// Auswahl der Datenquelle per NEXT_PUBLIC_DATA_MODE=mock|supabase.
import type { DataAdapter } from './adapter';
import { MockAdapter } from './mock/mock-adapter';
import { SupabaseAdapter } from './supabase/supabase-adapter';

let instance: DataAdapter | null = null;

export function getAdapter(): DataAdapter {
  if (instance) return instance;
  instance =
    process.env.NEXT_PUBLIC_DATA_MODE === 'supabase' ? new SupabaseAdapter() : new MockAdapter();
  return instance;
}

export type { DataAdapter } from './adapter';
