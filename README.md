# Honigseele – Website & App (Demo)

Neue Website der Honigseele, Berlin-Kreuzberg: eigene Buchung, Kalender, Shop, Kundenkonto und Admin-Bereich. Eine Codebasis für Website, PWA und später iOS/Android.

## Starten

```bash
npm install
npm run dev
```

Dann http://localhost:3000 öffnen. Keine Konten, keine API-Keys nötig – die Demo speichert alles im Browser. „Zurücksetzen“ in der Demo-Leiste stellt die Ausgangsdaten wieder her.

## Weitere Befehle

```bash
npm run build      # statischer Export nach out/
npm start          # out/ lokal ausliefern
npm test           # Unit-Tests (Buchungslogik, Mock-Backend)
npm run lint
npm run typecheck
```

## Schalter (`.env`)

| Variable | Standard | Wirkung |
|---|---|---|
| `NEXT_PUBLIC_DEMO` | `true` | Demo-Leiste, Platzhalter-Badges, `noindex` |
| `NEXT_PUBLIC_DATA_MODE` | `mock` | `mock` oder später `supabase` |
| `NEXT_PUBLIC_HONEYCOMB` | `false` | dezentes Wabenmuster im Hero |

## Dokumentation

- [CLAUDE.md](CLAUDE.md): Projektgedächtnis (Regeln, Design-Tokens, Konventionen)
- [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md): Aufbau und **Umstieg auf Supabase, Stripe und Capacitor**
- [docs/DEMO-RUNDGANG.md](docs/DEMO-RUNDGANG.md): Klickpfad für die Präsentation
- [docs/PLATZHALTER.md](docs/PLATZHALTER.md): Was noch von Anna kommt

## Nächste Schritte zur Produktion (kurz)

1. **Supabase** (Frankfurt): Tabellen aus `src/domain/types.ts`, `SupabaseAdapter` implementieren, Magic-Link-Login.
2. **Stripe**: Payment Element statt simulierter Zahlungsmaske, Webhook über Edge Function, Setup Intent für „Karte hinterlegen“.
3. **E-Mails** über Resend/Brevo, Erinnerungen per Cron.
4. **Capacitor**: `npx cap init` mit `webDir: out`, Push-Benachrichtigungen, App Store über Annas Apple-Developer-Konto.
5. `NEXT_PUBLIC_DEMO=false`, Hosting auf Cloudflare Pages oder Vercel Pro, Domain umziehen.
