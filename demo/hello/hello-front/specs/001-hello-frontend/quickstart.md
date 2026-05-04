# Quickstart: Application Frontend Hello

**Pré-requis**: Node.js 22.x, npm 10.x, Angular CLI 20.x (`npm install -g @angular/cli@20`)

---

## 1. Initialisation du projet Angular

Depuis le **répertoire courant** `hello-front/` :

```bash
cd /home/pbousquet/DevFestNantes/demo/hello/hello-front
ng new hello-front --routing=false --style=css --directory=. --force
```

> `--directory=.` initialise Angular dans le répertoire courant (contient déjà `.specify/`, `specs/`).
> `--force` évite le blocage sur les fichiers existants.
> `--routing=false` : application page unique, pas de routage Angular.

---

## 2. Vérification des versions

```bash
ng version
# Angular CLI: 20.3.x
# Angular: 20.3.x
# TypeScript: ~5.9.x
```

---

## 3. Configuration du proxy de développement

Créer `proxy.conf.json` à la racine du projet :

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  },
  "/health": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Référencer dans `angular.json` (section `serve > options`) :

```json
"proxyConfig": "proxy.conf.json"
```

---

## 4. Génération des artefacts Angular

```bash
# Service HTTP (couche traitement)
ng generate service services/hello

# Composant racine principal (standalone, déjà existant : app.component.ts)
# Composants enfants
ng generate component components/greeting --inline-template=false
ng generate component components/health-status --inline-template=false
```

---

## 5. Lancement de l'application

```bash
# L'API backend doit être démarrée au préalable sur http://localhost:3000
ng serve
# → http://localhost:4200
```

---

## 6. Tests unitaires

```bash
ng test
# Lance Karma + Jasmine en mode watch
```

---

## Structure de fichiers attendue (post-init)

```
hello-front/
├── src/
│   ├── app/
│   │   ├── app.component.ts       ← composant racine (standalone)
│   │   ├── app.component.html     ← template principal (3 zones)
│   │   ├── app.component.css
│   │   ├── app.component.spec.ts
│   │   ├── app.config.ts          ← bootstrap standalone (provideHttpClient, etc.)
│   │   ├── components/
│   │   │   ├── greeting/
│   │   │   │   ├── greeting.component.ts
│   │   │   │   ├── greeting.component.html
│   │   │   │   └── greeting.component.css
│   │   │   └── health-status/
│   │   │       ├── health-status.component.ts
│   │   │       ├── health-status.component.html
│   │   │       └── health-status.component.css
│   │   ├── services/
│   │   │   ├── hello.service.ts   ← appels HTTP
│   │   │   └── hello.service.spec.ts
│   │   └── models/
│   │       └── hello-api.models.ts ← interfaces TypeScript (HelloDto, HealthDto, ApiErrorResponse)
│   ├── index.html
│   └── styles.css
├── proxy.conf.json
├── angular.json
├── package.json
├── tsconfig.json
├── openapi.yaml                   ← contrat API (référence)
├── specs/                         ← documentation Speckit
└── .specify/                      ← configuration Speckit
```
