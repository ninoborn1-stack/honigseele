# Was wir noch von Anna brauchen

Auf der Seite gibt es keine sichtbaren Platzhalter-Hinweise mehr (Stand: echte Fotos eingebaut). Einzige Ausnahme: ausgedachte Bewertungen tragen weiter „Beispiel“, damit sie nicht als echt gelten. Offene Punkte stehen nur noch hier und im Code (`isPlaceholder` / `bioPlaceholder` / `placeholder: true` in `content/`).

## Marke & Bilder

| Was                                                                                                                         | Wo in der Demo                    | Datei                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Original-Logo** (eingetragene Marke, SVG/PNG für hellen und dunklen Grund)                                                | Header, Footer, Intro-Ende, Mails | Dateien nach `public/brand/`, Pfade in `content/brand.json` eintragen, `placeholder: false`                                                     |
| **App-Icon, Favicon, Splash** (heute: Blume des Lebens als Platzhalter)                                                     | App, Browser-Tab, Capacitor       | `scripts/make-icons.py` anpassen und ausführen (erzeugt `public/icons/` und `resources/`)                                                       |
| **Google-Bewertungen** (Live-Anbindung, Place-ID, Profil-Link)                                                              | Startseite „Was andere sagen“     | `content/site.json` → `google` (heute Beispieldaten)                                                                                            |
| **Instagram** (automatische Beiträge, Zugang Instagram Graph API)                                                           | Startseite                        | `content/site.json` → `instagram` (heute Platzhalter-Kacheln)                                                                                   |
| Fotos für **Mani & Pedi, Coaching, Gutschein** (heute noch Stock)                                                           | Behandlungen, Kurse, Shop         | `content/images.json` (`placeholder: true`), Foto nach `public/images/real/`, `npm run images`                                                  |
| **Laser, Empfang, Regal, Arm-Massage** in höherer Auflösung (heute 540 px)                                                  | Behandlungen, Kontakt, Startseite | `public/images/real/`                                                                                                                           |
| Fotos der übrigen Honigseelen (Asita, Juli, Nadine, Isabell, Larissa, Elsa, Kati, Maria) – erst dann erscheinen sie im Team | Über uns, Startseite              | Foto nach `public/images/real/team-<id>.jpg`, Schlüssel `team.<id>` in `content/images.json`, in `content/staff.json` `photo` + `visible: true` |
| Produktfotos der Pflegeserie                                                                                                | Shop, Produktseiten               | `content/products.json` → `image` (heute Linienzeichnungen)                                                                                     |

## Inhalte

| Was                                                                                                  | Wo                          | Datei                                                                           |
| ---------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------- |
| **Öffnungszeiten**                                                                                   | Footer, Admin-Einstellungen | `content/site.json` → `settings.openingHours` (`openingHoursPlaceholder: true`) |
| **Arbeitszeiten aller Anbieterinnen** (heute plausible Demo-Zeiten)                                  | Slot-Berechnung, Admin-Team | `content/working-hours.json`                                                    |
| Kurzporträts/Bios: heute kurze Texte aus den Rollen – bitte von jeder Honigseele selbst              | Über uns                    | `content/staff.json` (`bio`)                                                    |
| Dauer der Gesichtsbehandlungen (heute geschätzt)                                                     | Preislisten, Buchung        | `content/services.json` (Kategorie `gesicht-augen`)                             |
| Dauer je Laser-Zone (heute geschätzt)                                                                | Preislisten, Buchung        | `content/services.json` (Kategorie `laser`)                                     |
| Preis und Dauer **Laser-Vorgespräch**                                                                | Laser-Seite, Buchung        | `laser-vorgespraech`                                                            |
| Preise/Dauer **Coaching** (Seelengeflüster, Einzel-, Stress-Coaching, Ernährungsberatung)            | Kurse & Coaching            | `content/services.json` (`coaching-*`)                                          |
| **Kurse:** Termine, Preise, Kapazitäten, Beschreibungen, 5er/10er-Kartenpreise                       | Kursplan, Shop              | `content/courses.json`, `content/products.json` (`yoga-*-karte`)                |
| MBSR (Kurslänge, Preis), Waxing-Schulung (Inhalte, Termine), Events                                  | Kurse                       | `content/courses.json`                                                          |
| **Schröpfen** und **Somatic Bodywork (Pantarei)**: Texte, Leistungen, Preise                         | eigene Bereichsseiten       | `content/categories.json` (`isPlaceholder`), neue Einträge in `services.json`   |
| Pflegeserie: weitere Produkte (Shop-Seite 2), Beschreibungen, Anwendung, Inhaltsstoffe               | Shop                        | `content/products.json` (`isPlaceholder`)                                       |
| Zuordnung der Produkte zu Ritualen (Gesicht, Augen & Lippen, Körper, Hände & Nägel, Rund ums Waxing) | Shop-Filter                 | `src/features/shop/rituals.ts`                                                  |
| FAQ-Antworten Waxing/Laser (Entwürfe im Ton der Seite)                                               | Bereichsseiten              | `content/faq.json`                                                              |
| Vorbereitung/Nachsorge für Gesicht, Körper, Mani/Pedi, Pakete (Entwürfe)                             | Bereichsseiten              | `content/care.json` (`placeholder: true`)                                       |
| Echte Bewertungszitate (mit Erlaubnis)                                                               | Startseite, Über uns        | `content/site.json` → `reviews`                                                 |
| Paket-Inhalte im Detail (heute aus den Namen abgeleitet)                                             | Wohlfühl-Pakete             | `content/packages.json` → `includes`                                            |
| Wer bietet welche Leistung an (Zuordnung prüfen)                                                     | Buchung                     | `content/staff-services.json`                                                   |
| Abweichende Preise je Anbieterin (heute nur Spa-Pediküre bei Justyna/Sandra)                         | Preislisten, Buchung        | `content/staff-services.json` → `priceCents`                                    |
| Räume (Anzahl, Namen, welche Behandlung wo)                                                          | Slot-Berechnung             | `content/rooms.json`                                                            |
| Puffer zwischen Terminen (heute 10 Min.)                                                             | Slot-Berechnung             | `content/site.json` → `settings.bufferMin`                                      |
| Stellenanzeigen                                                                                      | Über uns → Jobs             | Block `jobs.text`                                                               |
| Englische Texte                                                                                      | ganze Seite                 | `content/i18n/en.json` (heute nur Navigation)                                   |

## Recht & Konten

| Was                                                     | Hinweis                                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| Impressum (Rechtsform, USt-ID)                          | heute keine Rechtsform/USt-ID angegeben                                  |
| Datenschutz, AGB, Widerrufsbelehrung, Zahlung & Versand | geprüfte Texte, am besten über einen Rechtstext-Dienst mit Updates       |
| „Vertrag widerrufen“-Button                             | gesetzlich vorgeschrieben, Formular folgt                                |
| Konten auf Anna                                         | Domain, Hosting, Supabase, Stripe, GitHub, Apple Developer, Resend/Brevo |
| Mailchimp-Export                                        | Newsletter-Kontakte übernehmen                                           |
| Kartenterminal / Kasse                                  | Entscheidung für einen TSE-zertifizierten Anbieter                       |
| Google-Unternehmensprofil                               | Zugang für SEO                                                           |
