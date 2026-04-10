# Changelog — Pedretes Manager

Registre de l'evolució del projecte per sessions de treball.

---

## Sessió 2 — 2026-04-10

**Objectiu:** Migració del backend a Supabase i implementació de noves funcionalitats.

### Canvis tècnics
- **Migració de Google Sheets → Supabase (PostgreSQL)**
  - Creació de les taules `projects` i `users` a Supabase
  - Nou fitxer `services/supabase.ts` que substitueix `services/sheetsAPI.ts`
  - Script de migració `scripts/migrate.ts` per importar dades històriques
  - **228 projectes** importats: 62 Pavé, 17 Alliance, 149 Fassung

### Noves funcionalitats
- **Timer per projecte** — Inici/aturada des del dashboard. Acumula temps real a la BD i recalcula el cost estimat (120 CHF/h) en directe.
- **Projectes desplegables** — Cada projecte al taulell s'expandeix per mostrar: timer, barra de progrés (temps real vs estimat), cost acumulat vs preu acordat.
- **Pàgina d'analítiques** (`/analytics`)
  - Revenue per avui / mes / any / total històric
  - Tendència mensual (gràfica de línia, últims 12 mesos)
  - Rendibilitat per tipus (CHF/hora): Fassung, Alliance, Pavé
  - Top 10 clients per facturació
  - Recomanacions automàtiques basades en les dades
- **Predicció intel·ligent** (`SmartPrediction`) — Als tres formularis: mostra temps predit i preu predit basats en projectes similars de la pròpia BD (filtre per estil + material + tipus de pedra).
- **Preu de l'or en temps real** — S'obté via `metals.live` + `frankfurter.app` (USD→CHF). Fallback automàtic a ~95 CHF/g si les APIs fallen.
- **Gestió d'usuaris millorada**
  - Dies laborables configurables per persona (Dl–Dg)
  - Dies lliures individuals (vacances, absències)
  - Integrat al contexte per a futurs càlculs de disponibilitat al calendari

### Bugs corregits
- Ruta `/fassung` apuntava a `FormAlliance` en comptes de `FormFassung`
- Botó submit de `FormFassung` tenia `form="projectForm"` (id incorrecte, era `fassungForm`)
- `FormFassung` usava noms de camp en alemany incompatibles amb el model de dades
- `sheetMappings` de Google Sheets no incloïa `agreedPrice`, `assignedTo`, `deadline`, `totalTime`, `actualTime` → els camps mai es llegien ni s'enviaven

### Estat al final de sessió
- Branca: `correction-of-features`
- PR obert cap a `main` pendent de revisió
- Supabase projecte: `sinomclhlaqwahtidetp`
- App funcional a `http://localhost:3001`

---

## Sessió 1 — anterior

**Objectiu:** Configuració inicial del projecte i primers formularis.

### Canvis
- Creació del projecte React + TypeScript + Vite + Tailwind
- Implementació dels tres formularis: Alliance, Fassung, Pavé
- Dashboard amb calendari, KPIs i gràfiques (Chart.js)
- Integració inicial amb Google Sheets via Apps Script
- Context de llengua (de / en / cat)
- Context d'usuaris (hardcoded)
- Navegació lateral responsive

### Estat al final de sessió
- Branca: `correction-of-features`
- La UI funcionava però les dades no es mapejaven correctament entre Sheets i l'app
