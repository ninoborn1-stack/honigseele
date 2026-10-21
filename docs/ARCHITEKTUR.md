# Architektur

## Grundidee

Eine Codebasis für **Website, PWA und App** (später iOS/Android über Capacitor). Deshalb ist die Seite ein **statischer Export**: Next.js rendert alle Seiten zur Build-Zeit in den Ordner `out/`. Alles Dynamische (Buchung, Konto, Admin) läuft im Browser und spricht über eine **Adapter-Schicht** mit den Daten.

```
                ┌──────────────┐
 content/*.json │ Inhalte      │──► Build: statische Seiten (SEO)
                └──────┬───────┘
                       │ Seed
                ┌──────▼───────┐        ┌────────────────────┐
 UI (React) ───►│ DataAdapter  │◄──────►│ MockAdapter        │ heute (localStorage)
                │ (Interface)  │        ├────────────────────┤
                └──────────────┘        │ SupabaseAdapter    │ später (Postgres, Auth, Storage)
                       ▲                └────────────────────┘
                ┌──────┴───────┐
                │ src/domain/  │ reine Logik: Slots, Preise, Storno, Gutscheine (getestet)
                └──────────────┘
```

## Schichten

| Schicht | Ort | Darf | Darf nicht |
|---|---|---|---|
| Routen | `src/app/` | Seiten zusammensetzen, Metadaten, `generateStaticParams` | Datenlogik, localStorage |
| Features | `src/features/*` | Hooks + UI pro Bereich | direkt auf Speicher zugreifen |
| Komponenten | `src/components/` | Darstellung | Datenzugriff (Ausnahme: Footer-Newsletter über Adapter) |
| Domain | `src/domain/` | reine Funktionen, Typen | React, Browser-APIs |
| Daten | `src/data/` | Speicher, Netzwerk | UI |

## Datenfluss im Browser

- `useData(db => db.listServices(), deps, initial)` lädt über den Adapter und lädt nach jeder Schreib-Operation neu (`adapter.subscribe`).
- Statische Seiten bekommen `initial` aus `content/`, damit Suchmaschinen und der erste Render vollständige Inhalte haben. Im Browser werden sie durch die Adapter-Daten ersetzt (z. B. nach Preisänderung im Admin).

## Buchung

1. `findSlots` (Domain) berechnet aus Arbeitszeiten, Abwesenheiten (Urlaub, Pausen, **Treatwell-Blocks**), bestehenden Buchungen inkl. Puffer, Dauer je Anbieterin und freien Räumen die möglichen Startzeiten. Mehrere Leistungen werden lückenlos hintereinander gelegt; bei „egal“ darf jede Leistung eine andere Anbieterin haben.
2. `createBooking` prüft den Slot erneut (keine Doppelbuchung), löst Gutscheine ein und setzt den Zahlungsstatus.
3. Storno über `cancellationQuote` (Domain): bis 24 Std. kostenlos, danach 50 %. Bei hinterlegter Karte wird die Gebühr belastet.
4. Laser: ohne erledigtes Vorgespräch nur das Vorgespräch buchbar (`laserGate`).

## Umstieg auf Produktion

### Supabase (Daten, Login, Dateien)
- Projekt in Region Frankfurt anlegen, Konto auf Anna.
- Tabellen aus `src/domain/types.ts` ableiten (1:1, Cent als `integer`, Zeiten als `timestamptz`).
- `src/data/supabase/supabase-adapter.ts` implementieren, `NEXT_PUBLIC_DATA_MODE=supabase` setzen.
- `findSlots` als Postgres-Funktion oder Edge Function (Logik aus `src/domain/slots.ts` übernehmen; die Tests bleiben die Referenz).
- Row Level Security: Kundinnen sehen nur eigene Daten, Team-Rolle alles.
- Login per Magic Link (Supabase Auth) statt Demo-Login.

### Stripe (Zahlung)
- Stripe-Konto auf Anna, Zahlarten Karte, PayPal, Klarna, Apple Pay aktivieren.
- `PaymentSheet` durch Stripe Payment Element ersetzen; Payment Intent über Supabase Edge Function erzeugen.
- Webhook (Edge Function) bestätigt Buchung/Bestellung erst nach erfolgreicher Zahlung.
- „Karte hinterlegen“ = Setup Intent; Storno-Gebühr per Off-Session-Zahlung.
- Kasse vor Ort: fertiger TSE-zertifizierter Anbieter (z. B. SumUp/Zettle mit Kassensystem), **nicht selbst bauen**.

### E-Mails
- Resend oder Brevo; Vorlagen aus `src/features/mails/mail-preview.tsx` übernehmen. Erinnerung 24 Std. vorher und Bewertungsbitte per Cron (Supabase Scheduled Function).
- Mailchimp-Kontakte importieren.

### App (Capacitor)
- `npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`, `npx cap init Honigseele de.honigseele.app --web-dir=out`.
- `npm run build && npx cap sync`, dann in Xcode/Android Studio öffnen.
- Push über `@capacitor/push-notifications` (APNs/FCM), Apple-Developer-Konto auf Anna.
- Hinweis: Rein „verpackte Websites“ lehnt Apple gern ab. Mit Push, Konto, Buchung und Offline-Shell ist der App-Charakter gegeben.

### Hosting
- Cloudflare Pages oder Vercel Pro (Vercel Hobby ist für Geschäftliches nicht erlaubt). Ausgabeordner `out/`.
- Vorschau-Deploys je Branch, Freigabe per Merge.
- Vor Livegang `NEXT_PUBLIC_DEMO=false` (entfernt Demo-Leiste, Badges und noindex).
