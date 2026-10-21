# Was wir noch von Anna brauchen

Alle Stellen sind in der Demo mit einem dezenten Badge „Platzhalter“ markiert (nur im Demo-Modus sichtbar). Im Code: `<Placeholder` bzw. `isPlaceholder` / `bioPlaceholder` / `placeholder: true` in `content/`.

## Marke & Bilder

| Was | Wo in der Demo | Datei |
|---|---|---|
| **Original-Logo und Schriftzug** (SVG/PNG) | Header, Footer, Mails, App-Icon | `src/components/layout/logo.tsx`, `public/icons/` (`scripts/make-icons.py`) |
| **Annas Einstiegsfoto** der heutigen Seite in voller Auflösung (≥ 2400 px breit) | Hero Startseite | Block `home.hero.image` in `content/site.json` (oder im Admin unter „Texte & Seiten“ hochladen) |
| Team-Fotos (Porträts aller Honigseelen) | Über uns, Buchung (Anbieterin), Startseite | `content/staff.json` → Feld `photo` |
| Raum- und Behandlungsfotos (ersetzen Stockfotos) | Behandlungsbereiche, Kurse, Über uns | `public/images/stock/` (`CREDITS.md`) |
| Produktfotos der Pflegeserie | Shop, Produktseiten | `content/products.json` → `image` (heute Linienzeichnungen) |

## Inhalte

| Was | Wo | Datei |
|---|---|---|
| **Öffnungszeiten** | Footer, Admin-Einstellungen | `content/site.json` → `settings.openingHours` (`openingHoursPlaceholder: true`) |
| **Arbeitszeiten aller Anbieterinnen** (heute plausible Demo-Zeiten) | Slot-Berechnung, Admin-Team | `content/working-hours.json` |
| Kurzporträts/Bios (außer Anna, Asita, Elsa) | Über uns | `content/staff.json` (`bioPlaceholder`) |
| Dauer der Gesichtsbehandlungen (heute geschätzt) | Preislisten, Buchung | `content/services.json` (Kategorie `gesicht-augen`) |
| Dauer je Laser-Zone (heute geschätzt) | Preislisten, Buchung | `content/services.json` (Kategorie `laser`) |
| Preis und Dauer **Laser-Vorgespräch** | Laser-Seite, Buchung | `laser-vorgespraech` |
| Preise/Dauer **Coaching** (Seelengeflüster, Einzel-, Stress-Coaching, Ernährungsberatung) | Kurse & Coaching | `content/services.json` (`coaching-*`) |
| **Kurse:** Termine, Preise, Kapazitäten, Beschreibungen, 5er/10er-Kartenpreise | Kursplan, Shop | `content/courses.json`, `content/products.json` (`yoga-*-karte`) |
| MBSR (Kurslänge, Preis), Waxing-Schulung (Inhalte, Termine), Events | Kurse | `content/courses.json` |
| **Schröpfen** und **Somatic Bodywork (Pantarei)**: Texte, Leistungen, Preise | eigene Bereichsseiten | `content/categories.json` (`isPlaceholder`), neue Einträge in `services.json` |
| Pflegeserie: weitere Produkte (Shop-Seite 2), Beschreibungen, Anwendung, Inhaltsstoffe | Shop | `content/products.json` (`isPlaceholder`) |
| FAQ-Antworten Waxing/Laser (Entwürfe im Ton der Seite) | Bereichsseiten | `content/faq.json` |
| Vorbereitung/Nachsorge für Gesicht, Körper, Mani/Pedi, Pakete (Entwürfe) | Bereichsseiten | `content/care.json` (`placeholder: true`) |
| Echte Bewertungszitate (mit Erlaubnis) | Startseite, Über uns | `content/site.json` → `reviews` |
| Paket-Inhalte im Detail (heute aus den Namen abgeleitet) | Wohlfühl-Pakete | `content/packages.json` → `includes` |
| Wer bietet welche Leistung an (Zuordnung prüfen) | Buchung | `content/staff-services.json` |
| Abweichende Preise je Anbieterin (heute nur Spa-Pediküre bei Justyna/Sandra) | Preislisten, Buchung | `content/staff-services.json` → `priceCents` |
| Räume (Anzahl, Namen, welche Behandlung wo) | Slot-Berechnung | `content/rooms.json` |
| Puffer zwischen Terminen (heute 10 Min.) | Slot-Berechnung | `content/site.json` → `settings.bufferMin` |
| Stellenanzeigen | Über uns → Jobs | Block `jobs.text` |
| Englische Texte | ganze Seite | `content/i18n/en.json` (heute nur Navigation) |

## Recht & Konten

| Was | Hinweis |
|---|---|
| Impressum (Rechtsform, USt-ID) | heute keine Rechtsform/USt-ID angegeben |
| Datenschutz, AGB, Widerrufsbelehrung, Zahlung & Versand | geprüfte Texte, am besten über einen Rechtstext-Dienst mit Updates |
| „Vertrag widerrufen“-Button | gesetzlich vorgeschrieben, Formular folgt |
| Konten auf Anna | Domain, Hosting, Supabase, Stripe, GitHub, Apple Developer, Resend/Brevo |
| Mailchimp-Export | Newsletter-Kontakte übernehmen |
| Kartenterminal / Kasse | Entscheidung für einen TSE-zertifizierten Anbieter |
| Google-Unternehmensprofil | Zugang für SEO |
