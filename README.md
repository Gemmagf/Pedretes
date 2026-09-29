# Pedretes · Atelier-Management

Aplicació web per a la gestió d'un taller d'encastadors / joieria de Zuric: comandes **Alliance**, **Fassung** i **Pavé**, registre de temps en directe, rendibilitat, capacitat de l'equip i pressupostos en PDF (format suís).

**Demo pública:** https://gemmagf.github.io/Pedretes/

## Com funciona

L'app és una SPA estàtica (React + Vite + Tailwind v4) que funciona sense servidor. Té tres modes de dades, i s'escull automàticament:

| Mode | Quan s'activa | On viuen les dades |
|---|---|---|
| **Local** | Inici de sessió amb usuari `Sara` / contrasenya `sareta` | Al navegador (`localStorage`). Es poden exportar/importar com a JSON des de la pàgina *Team* |
| **Demo** | Botó «Demo entdecken» a la portada | En memòria, es generen segons el tipus de taller i s'esborren en sortir |
| **Supabase** | Només si el build té `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` | PostgreSQL a Supabase amb autenticació per correu |

El compte local es carrega la primera vegada amb l'**historial real del taller** (`data/sareta-projects.json`: 305 comandes des del juliol de 2025, importades del full «Formular Sareta»). Es pot restaurar des de *Team → Daten*.

Per actualitzar-lo, exporta el full de càlcul com a `.xlsx` i executa:

```bash
pip install openpyxl
python3 scripts/import_sheet.py Formular-Sareta.xlsx
```

## Funcionalitats

- **Taulell**: KPI per període, calendari mensual amb barres de projecte, llista de projectes amb temporitzador, canvi d'estat ràpid, cerca i filtres per estat i persona, propers terminis amb alertes de retard.
- **Nova comanda** (un sol formulari per als tres tipus): simulador de pressupost en directe amb desglossament (mà d'obra / pedres), recàrrecs de dificultat i urgència, **data d'entrega calculada segons la capacitat real** (dies laborables, dies lliures i cua de feina de la persona assignada), valor de l'or (cotització en directe amb valor de referència editable) i valors d'experiència a partir de comandes similars.
- **Planificació**: les comandes obertes es reparteixen per ordre de termini entre els dies laborables de l'equip (capacitat real per persona, dies lliures). Mostra la càrrega per setmana, l'ordre de treball amb data prevista d'acabament, i marca les comandes que no arribaran al termini. Les no assignades van a qui queda lliure abans.
- **Analítiques**: facturació avui/mes/any/total, tendència mensual, tarifa mitjana vs. tarifa objectiu, rendibilitat (CHF/h) per tipus, per estil, per tipus de pedra i per mida de comanda, clients amb hores, quota, CHF/h, última comanda i tendència, rendiment per persona, i **recomanacions concretes**: preu per pedra necessari perquè un estil arribi a la tarifa objectiu, clients que paguen per sota, concentració de risc, terminis en perill.
- **Valors d'experiència** al simulador: minuts i preu **per pedra** apresos de comandes similars (coincidència per estil, tipus de pedra, material o forma, amb nivell de fiabilitat), projectats al nombre de pedres introduït i aplicables amb un clic. Avís si el preu introduït queda per sota de la tarifa objectiu.
- **Configuració del taller** (Team → Atelier): nom del taller per als pressupostos i tarifa horària objectiu.
- **Equip**: hores setmanals, hores extra, dies laborables i dies lliures per persona; còpia de seguretat de les dades en mode local; canvi de contrasenya en mode Supabase.
- **Pressupost PDF** des de qualsevol comanda (IVA 8,1 %, condicions de pagament).
- Interfície en **alemany, anglès i català** (l'idioma es recorda).

## Desenvolupament

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # TypeScript estricte de tot el projecte
npm run build      # genera dist/
```

Per usar Supabase en local, copia `.env.example` a `.env.local` i omple les claus. Sense claus l'app funciona igualment en mode local/demo.

## Desplegament a GitHub Pages

El workflow `.github/workflows/deploy.yml` construeix i publica `dist/` a cada push a `main` (i manualment amb *Run workflow*).

1. A GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. (Opcional) **Settings → Secrets and variables → Actions**: afegeix `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` si vols el mode Supabase a producció.
3. Fes push a `main`. L'app queda a `https://<usuari>.github.io/Pedretes/`.

Vite usa `base: './'` i l'enrutament és per hash (`#/analytics`), així que el mateix build funciona a GitHub Pages, a Vercel (`vercel.json`) o obrint-lo des de qualsevol subcarpeta.

## Estructura

```
components/        pàgines i components (AppShell, Dashboard, ProjectFormPage, SimulatorPanel, …)
components/ui/     primitives de UI (Button, Card, Field, Modal, StatusBadge, …)
context/           Auth, Data (selecció del backend), Demo, Users, Language, Toast
hooks/useProjects  accés unificat a projectes amb refresc automàtic
services/          store.ts (interfície Store + store en memòria/localStorage), supabase.ts, auth.ts, goldAPI.ts
utils/             analytics, scheduling (capacitat), projectTypes (config dels 3 tipus), pdfExport, seeds
i18n/              traduccions tipades (de és la font de veritat)
scripts/           import_sheet.py (full de càlcul → JSON), migració a Supabase, creació d'usuaris
data/              sareta-projects.json: historial real de comandes (seed del compte local)
```
