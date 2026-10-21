// Gerüst für die Produktion. NICHT implementiert.
// TODO (Etappe 1, Produktion):
// - @supabase/supabase-js einbinden, Projekt in Region Frankfurt (eu-central-1)
// - Tabellen 1:1 aus src/domain/types.ts ableiten (IDs = Primärschlüssel, Cent als integer, timestamptz)
// - findSlots als Postgres-Funktion (RPC) oder Edge Function, Logik aus src/domain/slots.ts übernehmen
// - createBooking/createOrder: Stripe Payment Intent über Edge Function, Bestätigung per Webhook
// - Row Level Security: Kundinnen sehen nur eigene Daten, Team-Rolle sieht alles
// - Storage-Bucket für Bilder aus dem Admin-Bereich
import type { DataAdapter } from '../adapter';

const notYet = () => {
  throw new Error('SupabaseAdapter ist noch nicht implementiert. NEXT_PUBLIC_DATA_MODE=mock nutzen.');
};

export class SupabaseAdapter implements DataAdapter {
  constructor() {
    return new Proxy(this, {
      get: (target, prop) =>
        prop === 'subscribe' ? () => () => undefined : prop in target ? Reflect.get(target, prop) : notYet,
    });
  }
}
export interface SupabaseAdapter extends DataAdapter {}
