# Name: Waffelnoah
# Waffel Shop Online Bestellung

## Ziel
Webseite für Online Vorbestellungen mit Stripe Zahlung, Rechnung und Admin Interface.

## Tech Stack
- Next.js + TypeScript
- Supabase (Postgres + Auth + Storage)
- Stripe (Zahlung)
- Framer Motion (Animation)

## Wichtige Regeln
- Preise werden IMMER serverseitig berechnet
- Frontend sendet nur IDs und Mengen
- Keine Bestellung ohne Stripe Bestätigung
- Toppings haben Gratisregeln (z. B. 1 Sauce kostenlos)
- Mehrwertsteuer: Speisen 7%, Getränke 19%
- Rechnungen müssen erzeugt werden
- Bestellungen dürfen nicht gelöscht werden

## Features
- Menü mit Kategorien
- Produktkonfiguration mit Toppings
- Warenkorb
- Checkout
- Stripe Zahlung
- PDF Rechnung
- Admin Interface
- Terminal Ansicht
- CSV Export für Steuerberater

## Sicherheit
- Stripe Webhook Signatur prüfen
- Keine Preise aus Frontend übernehmen
- Row Level Security in Supabase
- Admin Rollen: Owner, Manager, Staff
