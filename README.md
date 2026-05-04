# Waffel Online Ordering

## Projektziel

Dieses Projekt ist eine klassische Webseite für einen Waffelimbiss mit Online Vorbestellung zur Abholung.

Es ist keine App.

Kunden sollen Produkte ähnlich wie bei einem schnellen Food Ordering System auswählen, konfigurieren, in den Warenkorb legen, online bezahlen und danach eine Bestellnummer sowie eine PDF Rechnung erhalten.

## Tech Stack

- Next.js mit TypeScript
- Supabase Postgres SQL
- Supabase Auth
- Supabase Storage
- Stripe Checkout
- Stripe Webhooks
- Framer Motion
- PDF Rechnungserstellung
- CSV Export für Steuerberater
- VPS oder Root Server mit Node.js Runtime

## Hosting

Die Next.js Webseite läuft auf einem VPS oder Root Server.

Empfohlene Startkonfiguration:

- 2 vCPU
- 4 GB RAM
- 80 GB NVMe SSD
- Ubuntu 24.04 LTS
- Node.js 20.9 oder neuer
- Nginx Reverse Proxy
- HTTPS mit Let’s Encrypt
- PM2 oder Docker für den Next.js Prozess

Empfohlene bessere Konfiguration:

- 4 vCPU
- 8 GB RAM
- 160 GB NVMe SSD

Supabase wird extern genutzt und nicht auf dem VPS selbst gehostet.

## Design

- Farben nur Pink und Weiß
- Modern, sauber, hochwertig und dezent
- Mobile first
- Große Buttons
- Smooth Animationen mit Framer Motion
- Fade Animationen beim Scrollen
- Hover Animationen bei Produktkarten
- Sticky Warenkorb Button auf Mobile
- Kein Reinzoomen oder Rauszoomen auf Mobile

## Content

Texte sollen nicht hart in Komponenten stehen.

Content kommt aus:

- JSON Dateien
- Supabase Datenbank
- Admin Interface

Startdaten liegen in:

- content/products.json
- content/categories.json
- content/toppings.json
- content/site.json
- content/quotes.json
- content/legal.json

Zitate werden zufällig aus `quotes.json` gewählt. Es wird keine externe Zitate API verwendet.

## Bilder und Video

Bilder liegen unter:

- public/images/food
- public/images/drinks
- public/images/shop
- public/images/banners

Video liegt unter:

- public/videos/waffle-making.mp4
- public/videos/waffle-making.webm

Fallback Bild:

- public/images/banners/video-fallback.webp

Empfohlene Größen:

- Produktbilder: 800x800 px, WebP
- Bannerbilder: 1920x1080 px
- Kategorienbilder: 1200x800 px
- Ladenbilder: 1600x900 px
- Desktop Video: 1920x1080, MP4 H.264, unter 8 bis 12 MB
- Mobile Video: 1280x720 oder 1080x1920, unter 5 MB

## Öffnungszeiten

Öffnungszeiten kommen aus `site.json` oder aus der Datenbank.

Oben auf der Webseite wird immer ein Ladenstatus angezeigt:

- Geöffnet
- Schließt bald
- Geschlossen

Wenn geöffnet:

- Text: Wir haben geöffnet
- Farbe: Rot
- Anzeige, wie lange der Laden heute noch geöffnet ist

Wenn schließt bald:

- Text: Wir schließen bald
- Farbe: Orange
- Anzeige, wie lange noch geöffnet ist

Wenn geschlossen:

- Text: Wir haben geschlossen
- Farbe: Rot
- Anzeige, wann wieder geöffnet wird

Allgemeine Öffnungszeiten sollen unten auf der Webseite angezeigt werden.

Beispiel:

- Montag bis Freitag: bis 20:00 Uhr
- Samstag und Sonntag: bis 21:00 Uhr

Der Status soll sich automatisch aktualisieren, ohne die Seite neu zu laden.

Der Checkout darf nur Abholzeiten innerhalb gültiger Öffnungszeiten erlauben.

## Startseite

Die Startseite enthält:

- Hero Hintergrundvideo der Waffelherstellung
- Bilder vom Laden
- Bilder vom Essen
- Kurzbeschreibung des Ladens
- Motivation des Gründers
- Zufällige Motivationszitate aus quotes.json
- Tagesempfehlungen
- Neue Produkte
- Google Maps Link
- Footer mit Impressum, Datenschutz und AGB

Das Video:

- autoplay
- muted
- loop
- playsInline
- keine Controls
- Nutzer darf es nicht pausieren
- Nutzer darf nicht vorspulen oder zurückspringen
- Fallback Bild ist Pflicht

## Menü

Kategorien:

- Waffeln
- Crepes
- Shakes
- Getränke
- Extras

Produkte haben:

- Name
- Beschreibung
- Preis in Cent
- Bild URL
- Kategorie
- vatRate
- active
- isNew
- isRecommended
- isDailySpecial

## Produktkonfiguration

Kunden können wählen:

- Toppings
- Saucen
- Extras
- doppelte Menge
- Notizen

Empfehlungen werden mit Sternen angezeigt.

## Topping Logik

Toppings, Saucen und Extras haben eigene Preise.

Es gibt Gruppen:

- Toppings
- Saucen
- Extras

Jede Gruppe kann eine Gratisanzahl haben.

Beispiel:

- 1 Sauce kostenlos
- 1 Topping kostenlos
- jedes weitere Topping oder jede weitere Sauce kostet den hinterlegten Preis

Regeln:

- Gratisanzahl pro Produkt oder Kategorie
- doppelte Menge zählt als zwei Einheiten
- nicht gratisfähige Optionen werden immer berechnet
- kostenlose und berechnete Optionen werden im Warenkorb angezeigt
- kostenlose und berechnete Optionen werden auf der Rechnung angezeigt
- finale Berechnung erfolgt serverseitig

## Warenkorb

Der Warenkorb zeigt:

- Produkte
- Toppings
- Saucen
- Extras
- Notizen
- kostenlose Optionen
- berechnete Optionen
- Zwischensumme
- Gutschein
- Umsatzsteuer getrennt
- Gesamtbetrag

Kunde muss klar sehen, was bestellt wurde.

## Gutscheine

Gutscheine können sein:

- prozentual
- fester Betrag
- Mindestbestellwert
- Ablaufdatum
- aktiv oder deaktiviert
- maximale Nutzungen

Gutscheine werden serverseitig validiert.

Der Gutschein darf den Gesamtbetrag nicht unter 0 setzen.

Rabatt muss in Bestellung, Rechnung und CSV Export sichtbar sein.

## Umsatzsteuer

Preise werden in Cent gespeichert. aber für kunden im frondend in € formatiert angezeigt

Jedes Produkt hat ein Feld `vatRate`.

Standard:

- Speisen: 7 Prozent
- Getränke: 19 Prozent

Die Steuer wird nicht pauschal global berechnet.

Warenkorb, Rechnung und Export zeigen:

- Netto
- Umsatzsteuer 7 Prozent
- Umsatzsteuer 19 Prozent
- Brutto

## Checkout

Checkout enthält:

- Name als Pflichtfeld
- Telefonnummer optional
- Abholzeit
- Option: in 30 Minuten fertig
- Option: in 1 Stunde fertig
- AGB Zustimmung
- Datenschutz Zustimmung
- vollständige Bestellübersicht vor Zahlung

Es gibt keine Barzahlung.

## Zahlung

Zahlung läuft über Stripe.

Unterstützt werden sollen, soweit über Stripe verfügbar:

- Apple Pay
- Google Pay
- Klarna
- Online Banking (Karten)
- oder gutschein

Wichtige Regeln:

- Frontend sendet nur IDs, Mengen, Gutschein Code, Notizen und Abholzeit
- Server lädt echte Preise aus Supabase
- Server berechnet finalen Betrag
- Server erstellt Stripe Checkout Session
- keine Bestellung ohne erfolgreiche Stripe Zahlung
- Stripe Webhook Signatur muss geprüft werden
- Stripe Webhooks müssen idempotent verarbeitet werden

## Rechnungen

Für jede bezahlte Bestellung wird eine PDF Rechnung erstellt.

Rechnung enthält:

- fortlaufende Rechnungsnummer
- Bestellnummer
- Datum und Uhrzeit
- Kundennamen
- Unternehmensdaten
- Produkte
- Toppings
- Saucen
- Extras
- kostenlose Optionen
- berechnete Optionen
- Gutscheinbetrag
- Netto
- Umsatzsteuer getrennt nach 7 Prozent und 19 Prozent
- Brutto
- Zahlungsart: Stripe / Online bezahlt
- Stripe Payment ID

PDF wird gespeichert und auf der Erfolgsseite herunterladbar gemacht.

## Admin Interface

Admin Bereich läuft geschützt unter:

- admin.domain.de
- oder /admin

Rollen:

- Owner darf alles
- Manager darf Produkte, Preise, Gutscheine, Inhalte und Toppings bearbeiten
- Staff darf nur Terminal und Bestellungen sehen

Admin Funktionen:

- Produkte erstellen, bearbeiten, deaktivieren
- Kategorien erstellen, bearbeiten, deaktivieren
- Toppings, Saucen und Extras verwalten
- Preise verwalten
- Gratisanzahl pro Produkt oder Kategorie festlegen
- Bilder hochladen
- Texte bearbeiten
- Zitate bearbeiten
- Tagesempfehlungen festlegen
- Produkte als neu markieren
- Produkte als empfohlen markieren
- Gutscheine erstellen und verwalten
- Bestellungen live anzeigen
- Bestellstatus ändern
- Rechnungen anzeigen und herunterladen
- CSV Export auslösen

Admin Aktionen müssen serverseitig geprüft und in `audit_logs` gespeichert werden.

## Terminal

Terminal Ansicht für Tablet im Laden.

Funktionen:

- Live Anzeige neuer Bestellungen
- große Bestellkarten
- Bestellnummer
- Abholzeit
- Produkte
- Toppings
- Saucen
- Extras
- Notizen
- Status ändern

Status:

- offen
- in Bearbeitung
- fertig
- storniert

## Steuerberater Export

CSV Tagesexport enthält:

- Datum
- Bestellnummer
- Rechnungsnummer
- Stripe Payment ID
- Zahlungsstatus
- Zahlungsart
- Netto
- Umsatzsteuer 7 Prozent
- Umsatzsteuer 19 Prozent
- Brutto
- Gutscheinbetrag
- Produktdetails
- Toppings
- Saucen
- Extras
- Status

Onlinebestellungen dürfen nicht doppelt als Barumsatz in der Ladenkasse erfasst werden.

Zahlungsart ist:

Stripe / Online bezahlt

Bestellungen dürfen nicht gelöscht werden. Stornierungen müssen sichtbar bleiben.

## Datenbank

Supabase Postgres Tabellen:

- admin_roles
- admins
- categories
- products
- product_images
- option_groups
- options
- product_option_rules
- coupons
- orders
- order_items
- order_item_options
- invoices
- payments
- daily_exports
- audit_logs
- site_content
- quotes

Row Level Security ist Pflicht.

## Sicherheit

Regeln:

- Preise niemals aus dem Frontend übernehmen
- Server berechnet finalen Preis
- Server validiert Gutscheine
- Server validiert Toppings
- Server berechnet Steuer
- Stripe Webhook Signatur prüfen
- Webhooks idempotent verarbeiten
- Supabase Service Role Key niemals im Frontend nutzen
- Admin Rollen serverseitig prüfen
- Kunden dürfen keine fremden Bestellungen sehen
- Freitext Notizen gegen XSS schützen
- SQL Queries parameterisieren
- Rate Limiting für Checkout und Gutscheinprüfung
- keine Secrets im Code speichern
- HTTPS in Produktion Pflicht

## Environment Variables

Diese Variablen werden benötigt:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=

Secrets dürfen niemals in GitHub committed werden.

## Entwicklungsreihenfolge

1. Projektstruktur
2. Types und JSON
3. Supabase SQL Schema
4. Preislogik mit Tests
5. Öffnungszeiten Logik
6. Startseite und Menü
7. Produktdetails und Warenkorb
8. Checkout ohne Stripe
9. Stripe Checkout
10. Stripe Webhook
11. PDF Rechnung
12. Admin Interface
13. Terminal
14. CSV Export
15. Sicherheit prüfen
