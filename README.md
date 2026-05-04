# Waffelnoah – Projekt Grundstruktur

## Ziel
Dieses Repository enthält die **Grundstruktur** für eine klassische Next.js Webseite (keine App) für einen Waffelimbiss mit Online-Vorbestellung zur Abholung.

In diesem Schritt wurde **nur Struktur + Platzhalter** erstellt – noch keine vollständige Business-Logik.

## Stack
- Next.js (App Router)
- TypeScript
- Supabase
- Stripe
- Framer Motion
- PDF Rechnungen
- CSV Export

## Projektregeln (Kurzfassung)
- Preise niemals aus dem Frontend übernehmen.
- Frontend sendet nur IDs, Mengen, Gutschein-Code, Notizen und Abholzeit.
- Finale Preis-, Steuer- und Gutscheinberechnung nur serverseitig.
- Keine Bestellung ohne bestätigte Stripe Zahlung.
- Stripe Webhook Signatur prüfen und idempotent verarbeiten.
- Supabase RLS verwenden.
- Service Role Key niemals im Frontend.
- Admin-Rollen serverseitig prüfen.
- Bestellungen nicht löschen.
- Geld nur in **Cent** speichern, keine Float-Berechnung.
- Secrets niemals committen.

## Struktur
- `public/` Medienordner
- `content/` JSON Inhaltsdaten
- `supabase/migrations/` SQL Migrationen
- `src/app/` Seiten + API Routen
- `src/components/` UI Komponenten
- `src/lib/` Fachlogik, Integrationen, Sicherheit
- `src/types/` zentrale TypeScript Typen
- `src/utils/` Hilfsfunktionen

## Setup (später)
1. Next.js Projekt initialisieren / Dependencies installieren.
2. `.env.example` nach `.env.local` kopieren.
3. Supabase + Stripe Keys eintragen.
4. Migrationen einspielen.

## Hinweis
Dieses Repo ist absichtlich auf **Schritt 1 (Grundgerüst)** begrenzt. Weitere Features werden schrittweise implementiert.
