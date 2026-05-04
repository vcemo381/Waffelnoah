# AGENTS.md

## Aufgabe
Codex soll dieses Repository schrittweise entwickeln.

Nicht alles auf einmal bauen.

Vor jeder Änderung:
1. README.md lesen
2. AGENTS.md lesen
3. bestehende Dateien prüfen
4. nur die angeforderte Aufgabe bearbeiten

## Projekt
Klassische Webseite für einen Waffelimbiss mit Online Vorbestellung zur Abholung.

Keine App.

## Regeln
- Preise niemals aus dem Frontend übernehmen
- Frontend sendet nur IDs, Mengen, Gutschein Code, Notizen und Abholzeit
- Server berechnet Preise, Toppings, Gratisoptionen, Gutscheine, Netto, Steuer und Brutto
- Keine Bestellung ohne bestätigte Stripe Zahlung
- Stripe Webhook Signatur prüfen
- Stripe Webhook idempotent verarbeiten
- Supabase Row Level Security verwenden
- Service Role Key niemals im Frontend nutzen
- Admin Rollen serverseitig prüfen
- Bestellungen nicht löschen
- Geldwerte immer in Cent speichern
- Keine Float Berechnung für Geld
- Secrets niemals committen
- Gratisoptionen gelten pro Produkt oder Kategorie
- Produktregel überschreibt Kategorieregel
- `freeEligible` entscheidet, ob eine Option kostenlos sein darf
- `freeEligible: false` wird immer berechnet
- Standardstrategie ist `cheapest`, optionale `priority` darf überschreiben

## Tech Stack
- Next.js
- TypeScript
- Supabase
- Stripe
- Framer Motion
- PDF Rechnung
- CSV Export

## Design
- Pink und Weiß
- Modern
- Dezent
- Mobile first
- Kein Zoom auf Mobile
- Smooth Animationen

## Test Regeln
Preislogik braucht Tests.

Tests müssen Fälle abdecken:
- Gratis Topping
- Gratis Sauce
- weitere kostenpflichtige Optionen
- nicht gratisfähige Optionen
- doppelte Menge
- Gutschein prozentual
- Gutschein fester Betrag
- Steuer 7 Prozent
- Steuer 19 Prozent
- gemischter Warenkorb

## Arbeitsweise
Wenn eine Datei schon existiert, nicht blind überschreiben.

Erst lesen, dann gezielt ändern.

Nach Änderungen TypeScript prüfen.

Keine großen Refactorings ohne Auftrag.
