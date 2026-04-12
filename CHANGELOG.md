# Changelog — Pedretes Manager

Registre de l'evolució del projecte per sessions de treball.

---

## Sessió 3 — 2026-04-12

**Objectiu:** Autenticació multi-usuari, exportació PDF d'ofertes en format suís i llengua alemanya com a principal.

### Context
L'app fins ara no tenia cap control d'accés: qualsevol persona amb l'URL podia veure i modificar totes les dades. Calia un sistema on cada membre del taller (Sarah, Valentin, etc.) pugui crear el seu propi compte i accedir amb la seva contrasenya. A més, el client va demanar poder exportar ofertes/pressupostos en format professional suís per enviar als clients de la joieria, i establir l'alemany com a llengua principal de l'app.

### Noves funcionalitats

#### 🔐 Autenticació amb Supabase Auth
- **`services/auth.ts`** (fitxer nou) — capa d'abstracció sobre Supabase Auth amb les funcions: `signIn`, `signUp`, `signOut`, `changePassword`, `getCurrentUser`, `onAuthStateChange`. Centralitza tota la lògica d'autenticació en un sol lloc.
- **`context/AuthContext.tsx`** (fitxer nou) — context React que detecta la sessió existent en carregar l'app (via `getSession`) i escolta canvis en temps real (via `onAuthStateChange`). Exposa `user` (id, email, nom) i la funció `logout` a tots els components.
- **`components/LoginPage.tsx`** (fitxer nou) — pàgina de login/registre integrada en un sol formulari amb dues pestanyes (Anmelden / Registrieren). Inclou: toggle de visibilitat de contrasenya, validació client-side (longitud mínima, confirmació de contrasenya, nom obligatori), missatges d'error localitzats en alemany, i gestió del flux amb/sense confirmació d'email activada a Supabase.
- **`App.tsx`** — afegit `AuthProvider` al arbre de providers. La lògica de ruta protegida és simple: si `loading` → spinner; si no hi ha `user` → `<LoginPage />`; si hi ha `user` → app completa. Cap llibreria externa de rutes protegides, tot inline.
- **`Navigation.tsx`** — a la part inferior de la barra lateral es mostra l'avatar (inicial del nom), el nom complet i l'email de l'usuari connectat, amb un botó de logout (icona `LogOut` de lucide).
- **`UserManagement.tsx`** — nova secció `<ChangePasswordCard>` a la pàgina Team que permet a l'usuari actiu canviar la seva pròpia contrasenya sense sortir de l'app. Usa `changePassword` de `services/auth.ts` que crida `supabase.auth.updateUser`.

#### 📄 Exportació d'ofertes en PDF (format suís Zuric)
- **`utils/pdfExport.ts`** (fitxer nou) — genera un PDF professional de format A4 amb `jsPDF`. Estructura del document:
  - Capçalera daurada amb nom del taller i número d'oferta
  - Bloc de client (esquerra) i projecte (dreta) amb data de lliurament
  - Taula de serveis: temps de treball (a 120 CHF/h), pedres (preu/unitat × quantitat), or retornat, detalls d'estil/layout/fixació
  - Totals: subtotal sense IVA → MwSt 8.1% → total en barra daurada
  - Condicions de pagament (30 dies neto), validesa (30 dies), peu de pàgina amb dades del taller
  - El preu total s'agafa de `agreedPrice` si existeix; si no, es calcula des de les línies
- **`components/ProjectCard.tsx`** — afegit botó "Offerte exportieren (PDF)" a la part inferior de cada targeta de projecte (formularis Alliance, Fassung, Pavé)
- **`components/Dashboard.tsx`** — afegit botó "PDF" a les accions de cada fila de projecte expandida al dashboard
- Dependència `jspdf` instal·lada

#### 🌐 Alemany com a idioma per defecte
- `context/LanguageContext.tsx` — canviat l'estat inicial de `'cat'` a `'de'`. L'app s'obre en alemany; l'usuari pot canviar a Anglès o Català des del selector a la capçalera.

### Decisions tècniques
- La confirmació d'email de Supabase s'ha deixat **activada** (comportament per defecte i més segur). El codi detecta si l'usuari s'ha creat amb sessió activa o no i mostra el missatge adequat.
- No s'han tocat les RLS policies de Supabase perquè les taules `projects` i `users` ja eren accessibles amb l'anon key. En un entorn de producció real caldria restringir-les a `auth.role() = 'authenticated'`.
- El PDF es genera 100% al client (sense servidor), el que permet descarregues instantànies sense backend addicional.

### Fitxers nous
- `services/auth.ts`
- `context/AuthContext.tsx`
- `components/LoginPage.tsx`
- `utils/pdfExport.ts`

### Fitxers modificats
- `App.tsx` — `AuthProvider` + ruta protegida
- `components/Navigation.tsx` — usuari actiu + logout
- `components/UserManagement.tsx` — canvi de contrasenya
- `components/ProjectCard.tsx` — botó exportar PDF
- `components/Dashboard.tsx` — botó PDF a files expandides
- `context/LanguageContext.tsx` — idioma per defecte `'de'`
- `package.json` / `package-lock.json` — dependència `jspdf`

### Estat al final de sessió
- Branca: `correction-of-features`
- PR #1 obert cap a `main`: https://github.com/Gemmagf/Pedretes/pull/1
- Build de producció: ✓ sense errors TypeScript
- App funcional a `http://localhost:3001`

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
