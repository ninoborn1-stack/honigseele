# Honigseele – Projektgedächtnis

Website + App der **Honigseele** (Anna Kaiser), ganzheitliche Naturkosmetik & professionelle Haarentfernung, Hornstraße 1, 10963 Berlin. Ziel: Anna wird unabhängig von Treatwell, WordPress und Mailchimp. Eigene Buchung, Kalender, Shop, Zahlung, Kundenkonto, später App im Store. Anna und Jamilah pflegen Inhalte selbst (Admin-Bereich) und bauen mit Claude weiter.

Stand: **Demo/Beta**. Alles läuft lokal mit Mock-Backend.

## Befehle

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # statischer Export nach out/
npm start          # out/ lokal ausliefern (npx serve out)
npm test           # Vitest (Domain + MockAdapter)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run format     # Prettier
```

## Architektur-Regeln (nicht brechen)

1. **Statischer Export** (`output: 'export'`). Verboten: API-Routes, Server Actions, Middleware, `next/headers`, Laufzeit-SSR, `next/image`-Optimierung. Dynamische Routen nur mit `generateStaticParams`; sonst Query-Params + `<Suspense>` um `useSearchParams`.
2. **Alle Daten über `DataAdapter`** (`src/data/adapter.ts`, asynchron). Auswahl per `NEXT_PUBLIC_DATA_MODE=mock|supabase` in `src/data/index.ts`. Kein `localStorage` außerhalb von `src/data/mock/` (ESLint-Regel).
3. **Domain-Logik rein und getestet** in `src/domain/`: `slots.ts` (freie Termine), `pricing.ts` (Preis je Anbieterin, Laser-Rabatt 10/20 %), `cancellation.ts` (24 Std./50 %), `vouchers.ts`. Keine React-Imports dort.
4. **`content/` ist die eine Quelle** für Leistungen, Preise, Team, Kurse, Produkte, Texte. Statische Seiten (SEO) lesen daraus zur Build-Zeit, der MockAdapter seedet daraus. Im Browser ersetzt `useData(...)` die Werte durch Adapter-Daten (Admin-Änderungen).
5. **Geld in Cent (Integer)**, Zeiten als ISO-UTC-Strings (`...Z`), Rechnen in `Europe/Berlin` über `src/domain/time.ts` (Achtung: `TZDate.toISOString()` liefert Offset, daher `berlinToISO`).
6. **IDs** sind stabile Slugs (spätere DB-Primärschlüssel).
7. **Keine Preise oder Texte hart in Komponenten.** Keine Logik in `src/app/` (nur Darstellung).
8. Vision vorbereitet, nicht gebaut: `Location`, `Membership`, `CommunityProfile` in `src/domain/types.ts`.

## Ordner

```
content/            Inhalte (JSON) + i18n/de|en.json
scripts/            build-content.mjs (Erst-Migration), make-icons.py
src/app/            Routen
src/components/     ui/ (Basis), layout/ (Header, BottomNav, Footer, Curtain, DemoBar), home/ (Hero)
src/features/       booking/, shop/, account/, admin/, courses/, about/, mails/, payment/, treatments/
src/domain/         Typen + reine Logik (+ Tests)
src/data/           adapter.ts, mock/ (MockAdapter, Seed), supabase/ (Gerüst)
src/lib/            config, use-data (Hooks), i18n, format, ics
docs/               ARCHITEKTUR.md, PLATZHALTER.md, DEMO-RUNDGANG.md
```

## Design

Warm, weich, hochwertig. Lifestyle-Marke. Nicht „KI-generisch“.

| Token | Wert | Einsatz |
|---|---|---|
| `honey-950` | #2B2118 | dunkle Flächen, Text |
| `cream-50` | #F6F0E6 | Hintergrund |
| `cream-100` | #EFE4D2 | zweiter Hintergrund |
| `card` | #FBF7F0 | Karten |
| `honey-400` | #D9A54A | Akzent (nur Flächen/Buttons, nicht als Text auf Creme) |
| `honey-300` | #E6BD6E | Akzent-Text auf dunkel |
| `amber-600` | #B87A1E | kursive Akzentwörter |
| `amber-800` | #8A5A12 | Eyebrows, Links |
| `muted` | #5A4A3A | Fließtext sekundär |
| `line` | #CDB894 | feine Linien |

- Schriften: **Cormorant Garamond** (Überschriften, kursive Akzentwörter via `<em>` bzw. `Title` mit `*Wort*`), **DM Sans** (Text/UI). Selbst gehostet über `@fontsource`.
- **Layout volle Breite:** Container ist die Utility `wrap` (max. 1760 px, Rand `clamp(1.25rem, 3.5vw, 4rem)`). Keine schmalen `max-w-6xl`-Container mehr. Große Display-Typo über `Title size="display|h1|h2|h3"`.
- **CTAs:** primär `ButtonLink`/`Button` mit `arrow`; sekundär `ArrowLink` (Versalien + runder Pfeil-Knopf). Keine reinen Unterstrich-Links als CTA.
- **Bewegung** (`src/components/ui/motion.tsx`): `Title`/`RevealHeading` (Wörter steigen auf), `RevealImage` (Bild öffnet sich von unten), `Parallax`, `Marquee` (Laufband), `CountUp`, `useInView`. Karussells nur mit Pfeilen + Fortschritt, nie horizontales Mausrad-Scrollen.
- **Kopfzeile** (`SiteTop`) ist immer fixiert; setzt `--top-h`. Sticky-Elemente mit `top-[calc(var(--top-h,96px)+1rem)]`.
- Gestaltung: Split-Layouts mit dunklen Honigflächen (`Section tone="dark"`, `.honey-glow`), sanftes Licht (`.honey-light`), feine Linien statt Boxen, Eyebrows (`.eyebrow`), Nummern in Serif (`Numeral`), Lucide-Icons mit `strokeWidth={1.5}`.
- **Keine Waben** als Icons, Aufzählungen, Avatare, Badges oder Muster. Einzige Ausnahme: `<SubtleHoneycomb />` im Hero, per `NEXT_PUBLIC_HONEYCOMB=true` (Standard aus).
- Bewegung ruhig (Fade/Rise, `Reveal`), `prefers-reduced-motion` respektieren.
- **Hero** (`src/components/home/hero.tsx`): Foto öffnet sich aus einer Blütenmaske (`public/images/bloom-mask.svg`), „seele“ steigt Buchstabe für Buchstabe auf, beim Scrollen Rahmen + „So schön, dass Du da bist.“. Regel: jede CSS-Eigenschaft nur von einer Animation; CSS-Grundzustand = Endzustand. GSAP + ScrollTrigger, Lenis nur auf Desktop.
- **Vorhang-Übergang** (`src/components/layout/curtain.tsx`): fünf Streifen, CSS-animiert, fängt interne Links in der Capture-Phase ab. Nicht innerhalb von /buchen, /admin, /kasse. `data-label` am Link setzt das Label, `data-no-curtain` schaltet ab, `data-quick-curtain` (Bottom-Nav) kürzt.
- Mobil zuerst: Bottom-Nav (Start, Behandlungen, **Buchen** Mitte, Shop, Konto), Safe-Area-Insets, Touch-Ziele ≥ 44 px, keine Hover-only-Interaktion, Sticky-Buchen-Button auf Leistungsseiten.

## Ton

Du-Ansprache, herzlich, gendergerecht (Kund*innen), „alle sind willkommen“. Deutsch zuerst, Englisch als Struktur vorbereitet (`content/i18n`).

## Demo-Modus (`NEXT_PUBLIC_DEMO=true`)

Leiste oben (Rollenwechsel Kundin/Team, Mails, Zurücksetzen), Platzhalter-Badges (`<Placeholder />`, nur im Demo-Modus sichtbar), `robots: noindex`. Seed: Termine der nächsten 3 Wochen, Kundin **Lena** (Termin in < 24 Std. für Storno-Demo), Gutschein **HONIG50** (50 €), abgelaufener **SOMMER2024**, Lenas Gutschein **HS-LENA-2026**. Mail-Vorschau unter `/demo/mails/`.

## Konventionen

- TypeScript strict, kleine Komponenten, Kommentare knapp und auf Deutsch.
- Formulare: react-hook-form + zod. Datum: date-fns + @date-fns/tz.
- Neue Platzhalter immer mit `<Placeholder />` markieren **und** in `docs/PLATZHALTER.md` eintragen.
- Vor dem Commit: `npm run typecheck && npm run lint && npm test && npm run build`.
- Änderungen erst als Vorschau-Deploy ansehen, dann freigeben.
