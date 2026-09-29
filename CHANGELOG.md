# Changelog — Pedretes Manager

Registre de l'evolució del projecte per sessions de treball.

---

## Sessió 5 — 2026-09-29

**Objectiu:** Publicar a GitHub Pages, fer que l'app funcioni sense backend (accés local Sara/sareta com a Caleta Tracker), completar el mode demo, corregir bugs i redissenyar la UI.

### Desplegament i infraestructura
- **GitHub Pages** via `.github/workflows/deploy.yml` (typecheck + build + deploy a cada push a `main`); `ci.yml` per a branques i PRs.
- `vite.config.ts`: `base: './'` (funciona a Pages, Vercel i local), chunks separats (react, charts, motion, supabase, pdf). Eliminat el codi residual de Gemini/AI Studio.
- `index.html`: favicon SVG propi, meta description, Open Graph, `theme-color`, preconnect de fonts.
- Fitxers morts eliminats: `tailwind.config.js` (Tailwind v4 no el llegeix), `metadata.json`, `text.txt`, `services/sheetsAPI.ts`, dependència `axios`.
- `scripts/`: credencials des de variables d'entorn (abans hi havia una contrasenya d'admin hardcodejada).
- `@types/react` instal·lats; `npm run typecheck` passa net.

### Capa de dades unificada
- Nova interfície `Store` (`services/store.ts`) amb tres implementacions: **Supabase**, **local** (persistit a `localStorage`, clau `pedretes.local.v1`) i **demo** (memòria). Cada escriptura emet un esdeveniment i totes les vistes es refresquen.
- `DataContext` escull el backend; `useProjects()` i `useUsers()` són l'única via d'accés dels components.
- **Accés local**: usuari `Sara` / contrasenya `sareta`, sessió persistida, dades d'exemple realistes (`utils/localSeed.ts`, PRNG determinista) i **exportació/importació JSON** i restauració des de la pàgina Team.
- **Supabase opcional**: si no hi ha variables d'entorn, el client no s'instancia i l'app arrenca igualment (abans la pàgina quedava en blanc).

### Dades reals del taller
- `scripts/import_sheet.py` converteix el full «Formular Sareta» (respostes dels 3 formularis de Google) a `data/sareta-projects.json`: 305 comandes reals (210 Fassung, 74 Pavé, 21 Alliance) que són el seed del compte local. Preu = preu per pedra × nombre de pedres; nom derivat quan falta; files de prova excloses.
- Opcions dels formularis alineades amb els formularis reals (tipus de pedra, materials, estils Fassung/Pavé, disseny «vorhanden / nicht vorhanden», fixació, forma lliure amb suggeriments) i preu calculat per pedra a tots els tipus.

### Pensat per a un taller d'encastadors (i generalitzable)
- **Planificació** (`utils/planning.ts`, pàgina nova): planificador de capacitat que reparteix les comandes obertes per termini entre els dies laborables de cada persona; càrrega per setmana, ordre de treball amb inici/fi previstos, detecció de terminis en risc, assignació suggerida per a comandes sense persona i reassignació en línia.
- **Prediccions per pedra** (`predictPerStone`): mediana i rang de minuts i preu per pedra de comandes similars, amb relaxació progressiva de la coincidència (estil + pedra + material → … → tipus), nivell de fiabilitat i projecció al nombre de pedres; botó per aplicar-ho al formulari. Avís al simulador si el preu queda per sota de la tarifa objectiu.
- **Rendibilitat per segment** (`computeRateBy`): CHF/h per estil, tipus de pedra, mida de comanda i client, amb quota de facturació, preu mitjà per pedra i comparació amb la tarifa objectiu.
- **Clients**: hores, quota, CHF/h efectiu, última comanda i tendència (últims 90 dies vs. anteriors).
- **Recomanacions accionables**: preu per pedra necessari per arribar a la tarifa objectiu, client que paga per sota, concentració de risc (>40 % en un client), segment més rendible, terminis en perill.
- **Configuració** (`SettingsContext`): nom del taller i tarifa horària objectiu, usats a costos, avisos i consells.

### Mode demo complet
- Analítiques amb dades sintètiques (abans mostrava dades de Supabase).
- Els formularis creen comandes a la demo; predicció intel·ligent i simulador usen les dades de demo.
- Les comandes de demo tenen persona assignada (abans la gràfica de càrrega quedava buida).

### Bugs corregits
- Fonts: `@theme` usava `--font-family-*` (sintaxi antiga) i Playfair/Inter no s'aplicaven mai.
- FormAlliance: `p.completed` (camp inexistent) i barreja de minuts/hores al càlcul de data.
- FormPave: el camp `fixierung` mai es guardava (`fixation` al model) i la data suggerida s'escrivia a `date` en lloc de `deadline`.
- Clau de traducció `fixierung` inexistent; textos hardcodejats en català/alemany a Dashboard, SmartPrediction, FormFassung, Login, Landing i Qüestionari.
- Gradient SVG del logo amb id duplicat (es veia negre a la barra lateral).

### Millores funcionals
- **Data d'entrega segons capacitat** (`utils/scheduling.ts`): dies laborables, dies lliures, hores/dia i cua de feina de la persona assignada.
- Simulador amb desglossament de preu (mà d'obra / pedres), preu de l'or editable amb origen (live/cau/referència/manual) i botó «Übernehmen».
- Un únic `ProjectFormPage` per als tres tipus, configurat a `utils/projectTypes.ts` (abans 3 fitxers duplicats de ~290 línies).
- Taulell: cerca, filtre d'estat, canvi d'estat des de la fila, propers terminis amb retard, KPI d'hores planificades, esborrat de projectes, calendari localitzat.
- Analítiques: rendiment per persona, recomanació de retards, mesos sense dades a zero.
- Equip: hores setmanals editables, capacitat/dia visible.
- Toasts de confirmació, ErrorBoundary, tancament de modals amb Escape.
- i18n tipada (`i18n/de.ts` és la font de veritat; en/cat han de tenir les mateixes claus) i idioma persistit.

### UI
- Nou sistema de disseny (`index.css`): paleta crema/tinta amb or antic i coure, ombres suaves, tokens Tailwind v4, estats de focus visibles, `prefers-reduced-motion`.
- Primitives a `components/ui` (Button, Card, Field, Modal, StatusBadge, Kpi, Segmented, Avatar, EmptyState).
- Barra lateral agrupada (Übersicht/Analyse · Neuer Auftrag · Team) amb comptador de temporitzadors actius, capçalera per pàgina i disseny mòbil amb calaix.
- Landing amb hero fosc i vista prèvia de l'app, login a dues columnes (panell de marca + formulari), barra lateral fosca amb accents d'or, KPI principal en fosc, calendari amb barres contínues per projecte, transicions entre pàgines i targetes amb accent de color per tipus.

### Pendent
- [ ] Activar Pages al repositori (Settings → Pages → Source: GitHub Actions) i fer merge a `main`.
- [ ] Restringir les RLS de Supabase a usuaris autenticats.
- [ ] Imatge `og:image` per compartir a xarxes.

---

## Sessió 4 — 2026-04-30

**Objectiu:** Deploy a Vercel, correcció de bugs de producció, landing page pública i mode demo amb qüestionari.

### Context
La sessió anterior havia deixat el codi funcionant en local. Aquesta sessió es va centrar en fer el deploy real a Vercel, diagnosticar i corregir els problemes que apareixien en producció (pàgina en blanc, variables d'entorn, CSS), i afegir una landing page amb demo interactiva per poder mostrar l'app a potencials clients i al portfolio.

### Deploy a Vercel

#### Problemes diagnosticats i resolts
1. **`index.html` amb `importmap` de Google AI Studio** — l'HTML original carregava React i totes les llibreries des de CDN (`aistudiocdn.com`), cosa que xocava completament amb el bundle de Vite. Eliminat.
2. **`tailwind.config.js` apuntava a `./src/**/*`** — tots els components estan a l'arrel, no dins `src/`. Corregit el `content` i afegits els colors `jewelry-*` i les fonts.
3. **CSS no inclòs al bundle** — quan es va netejar l'`index.html` es va perdre el `<link rel="stylesheet">`. Solucionat afegint `import './index.css'` a `index.tsx`.
4. **Tailwind v4 vs v3 syntax** — el projecte usa `@tailwindcss/postcss` v4 però `index.css` tenia sintaxi v3 (`@tailwind base/components/utilities`). Migrat a `@import "tailwindcss"` + `@theme { }` amb variables CSS custom. El CSS va passar de 9KB a 45KB (tots els estils generats correctament).
5. **`vercel.json` amb `rewrites` massa amplis** — la regla `"source": "/(.*)"` interceptava totes les peticions incloent els chunks JS/CSS, fent que Vercel retornés `index.html` per a cada fitxer. Canviat a `routes` amb regles específiques per a `/assets/` i fitxers estàtics.
6. **Variables d'entorn només a nivell de Team** — `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` estaven configurades a nivell de Team de Vercel però no al projecte específic. Afegides via CLI (`npx vercel env add`).
7. **Strings hardcodejats en català** — `"Vençut/Avui"`, `"dies lliures"`, textos de recomanacions d'Analytics en català. Afegides les claus de traducció a `LanguageContext` i substituïts tots els strings per `t()`.

#### Fitxers modificats per al deploy
- `index.html` — netejat (eliminat importmap, CDN Tailwind, config inline)
- `index.css` — migrat a Tailwind v4 + `@theme` amb colors i fonts
- `index.tsx` — afegit `import './index.css'`
- `tailwind.config.js` — paths correctes + colors jewelry-* + fonts
- `vercel.json` — `routes` en comptes de `rewrites`
- `context/LanguageContext.tsx` — 8 claus noves (de/en/cat)
- `components/Dashboard.tsx` — strings traduits
- `components/Analytics.tsx` — recomanacions traduits
- `components/UserManagement.tsx` — string `freeDaysLabel` traduït

### 🌐 Landing Page pública + Mode Demo

#### Landing Page (`components/LandingPage.tsx`)
- Pàgina pública accessible sense login a `pedretes-one.vercel.app`
- Hero amb tagline, dos CTAs: "Demo entdecken" i "Anmelden"
- Secció de 6 funcionalitats amb icones
- Testimonial fictici d'una goldschmiedin de Zuric
- Secció CTA inferior
- Navegació fixa amb logo i botó d'accés

#### Qüestionari de personalització (`components/DemoQuestionnaire.tsx`)
- Modal de 3 passos amb animació (Framer Motion)
- **Pas 1 — Tipus d'obrador** (11 opcions amb icona):
  Schmuck, Uhren, Keramik, Leder, Textil, Bäckerei, Malerei, Mechanik, Schreinerei, Architektur, Anderes
- **Pas 2 — Mida de l'equip**: Solo / 2–3 / 4–10 / +10
- **Pas 3 — Principal repte**: Temps / Clients / Costos / Tot
- Camp opcional per al nom del taller
- Barra de progrés visual

#### Generador de dades sintètiques (`utils/demoData.ts`)
- 11 sectors amb noms de projecte, clients i tipus de treballs específics
- Tots els clients són **B2B** (empreses, hotels, restaurants, institucions)
- Genera 28 projectes amb estats, temps, preus i dates realistes
- Genera equip amb noms segons la mida seleccionada

#### Mode Demo (`context/DemoContext.tsx`)
- Context React que gestiona l'estat del mode demo
- Dades 100% locals (sense tocar Supabase ni la BD real)
- `Dashboard.tsx` adaptat per usar dades de demo: timer funcional en local, `updateDemoProject` en lloc de Supabase
- Banner taronja "Demo-Modus" fix a la part superior amb nom del taller i botó "Demo beenden"
- Flux complet: Landing → Qüestionari → Demo | Anmelden → App real

### Estat al final de sessió
- **URL producció**: https://pedretes-one.vercel.app
- **Branca activa**: `main` (deploy directe)
- **Build**: ✓ sense errors TypeScript
- **Auth**: Supabase Auth funcionant en producció (confirmació email activada)
- **Demo**: accessible públicament sense registre

### Decisions preses
- La landing page substitueix la `LoginPage` com a primera pantalla per a usuaris no autenticats; el login és accessible via "Anmelden"
- El mode demo no crea usuaris a Supabase ni escriu res a la BD — tot és efímer en memòria
- Es va decidir **mantenir** la confirmació d'email de Supabase activada (més segur)
- Els clients de la demo són B2B per reflectir la gestió real d'un obrador professional

### Pendent / Possibles millores futures
- [ ] Afegir pregunta al qüestionari sobre tipus de client (B2B / B2C / Mixt) per adaptar noms de clients generats
- [ ] Analytics en mode demo (ara mostra dades de Supabase en lloc de les sintètiques)
- [ ] FormAlliance / FormFassung / FormPave en mode demo (ara no guarden res)
- [ ] Domini personalitzat a Vercel (ara és `pedretes-one.vercel.app`)
- [ ] Afegir el taller real com a usuari inicial (script o panel Supabase)
- [ ] Icona / favicon personalitzat (ara és el favicon per defecte de Vite)
- [ ] SEO bàsic: `og:title`, `og:description`, `og:image` per compartir a xarxes

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
