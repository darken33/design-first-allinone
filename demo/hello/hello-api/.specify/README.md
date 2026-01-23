# .specify/ – Navigation Guide

Le répertoire `.specify/` contient tous les documents de **gouvernance, architecture et pratiques** du projet HelloAPI.

---

## 📁 Structure de `.specify/`

```
.specify/
│
├─ memory/
│  └─ constitution.md
│     └─ 📌 SOURCE UNIQUE DE VÉRITÉ
│        • 6 Principes d'architecture obligatoires
│        • Règles de développement non-négociables
│        • Politique de gouvernance et amendments
│        • À consulter pour toute décision architecturale
│
├─ ARCHITECTURE_ANALYSIS.md
│  └─ Analyse détaillée du projet (11 sections)
│     • Stack technologique complet
│     • Architecture en couches
│     • Testing strategy
│     • Security & configuration
│     • Deployment & operability
│     • Recommandations (P0/P1/P2)
│
├─ GOVERNANCE_SUMMARY.md
│  └─ Résumé exécutif (C-level)
│     • Résultats clés (statut architecture, tests, déploiement)
│     • Constitution adoptée (les 6 principes)
│     • Roadmap de développement (court/moyen/long terme)
│     • Indicateurs de succès
│     • FAQ
│
├─ CODE_REVIEW_CHECKLIST.md
│  └─ 📋 Checklist pour revue de PR
│     • Architecture & couches
│     • OpenAPI contract-first
│     • Test coverage (unit + integration)
│     • Java 25 & modern practices
│     • Container & K8s ready
│     • Security checklist
│     • Red flags (à rejeter absolument)
│
├─ DEVELOPER_GUIDE.md
│  └─ 👨‍💻 Guide pratique pour développeurs
│     • Quick start pour contributeurs
│     • Pattern complet: ajouter une endpoint API (10 étapes)
│     • Test patterns (unitaire, intégration, mocks)
│     • Security patterns (validation, secrets, error handling)
│     • Architecture patterns (dépendances externes)
│     • Documentation patterns
│     • Debugging guide
│     • Pre-commit checklist
│
├─ templates/
│  ├─ plan-template.md          (À CRÉER)
│  ├─ spec-template.md          (À CRÉER)
│  ├─ tasks-template.md         (À CRÉER)
│  └─ commands/
│
└─ README.md
   └─ (Ce fichier)
```

---

## 🎯 Quoi Consulter Selon le Besoin

### "Je dois implémenter une nouvelle feature"
→ **Lire:** `DEVELOPER_GUIDE.md` (Pattern complet 10 étapes)  
→ **Utiliser:** Code Review Checklist avant PR

### "Je dois faire une revue de code PR"
→ **Utiliser:** `CODE_REVIEW_CHECKLIST.md`  
→ **Consulter:** Constitution si questions gouvernance

### "Je dois comprendre l'architecture du projet"
→ **Lire:** `ARCHITECTURE_ANALYSIS.md` (sections 1-6)  
→ **Référence:** Constitution (6 principes résumé)

### "Je dois décider d'une direction architecturale"
→ **Consulter:** Constitution `memory/constitution.md`  
→ **Approfondir:** ARCHITECTURE_ANALYSIS (section 9 opportunities)

### "Je dois manager le projet"
→ **Lire:** `GOVERNANCE_SUMMARY.md`  
→ **Utiliser:** Roadmap & indicateurs succès  
→ **Référence:** Constitution pour amendments

### "Je dois debugger un bug en prod"
→ **Consulter:** `DEVELOPER_GUIDE.md` (Debugging guide)  
→ **Référence:** `JVM-CONFIG.md` (JVM tuning)

---

## 📚 Documents et Leur Rôle

| Document | Lecteurs | Fréquence | Durée Lecture |
|----------|----------|-----------|---------------|
| **constitution.md** | Tous (source unique vérité) | À chaque décision | 20 min |
| **ARCHITECTURE_ANALYSIS.md** | Archi, leads tech, ref developers | Onboarding + trimestriel | 45 min |
| **GOVERNANCE_SUMMARY.md** | Managers, product, stakeholders | Sprint planning | 15 min |
| **CODE_REVIEW_CHECKLIST.md** | Reviewers | À chaque PR | 10-15 min |
| **DEVELOPER_GUIDE.md** | Contributeurs | Au démarrage + feature | 60 min (pattern complet) |
| **JVM-CONFIG.md** | Devs, ops | Debug/perf tuning | Variable |
| **README.md** (projet root) | Tous | Onboarding | 5 min |

---

## 🔄 Document Update Workflow

### Quand amender la Constitution?

1. **Identifier le besoin**
   - Nouveau principe découvert?
   - Changement architectural?
   - Clarification requise?

2. **Proposer amendment**
   - Créer issue ou discussion
   - Documenter rationale
   - Proposer impact sur autres principes

3. **Approbation**
   - Lead architecture approuve
   - Équipe dev consent
   - Bump version (`constitution.md`)

4. **Propagate changes**
   - Mettre à jour ARCHITECTURE_ANALYSIS si applicable
   - Mettre à jour DEVELOPER_GUIDE patterns si applicable
   - Mettre à jour CODE_REVIEW_CHECKLIST si applicable

### Quand mettre à jour DEVELOPER_GUIDE?

- ✅ Nouveaux patterns découverts
- ✅ Clarifications suite feedback dev
- ✅ Changements framework/libraries majeurs
- ❌ Typos mineurs (normal review process)

### Quand créer templates/?

- **plan-template.md:** Architecture decision documentation
- **spec-template.md:** OpenAPI specification boilerplate
- **tasks-template.md:** Task/user story template avec constitution compliance

---

## 💡 Best Practices pour Navigation

### Pour Developers
1. Commencer par **DEVELOPER_GUIDE.md** (patterns)
2. Utiliser **CODE_REVIEW_CHECKLIST.md** avant PR
3. Consulter **constitution.md** pour architecturale questions

### Pour Reviewers
1. Imprimer/copier **CODE_REVIEW_CHECKLIST.md**
2. Référencer **DEVELOPER_GUIDE.md** patterns si corrections requises
3. Escalader à **constitution.md** si governance question

### Pour Managers/Leads
1. Garder **GOVERNANCE_SUMMARY.md** handy (roadmap, KPIs)
2. Approfondir avec **ARCHITECTURE_ANALYSIS.md** si needed
3. Utiliser **constitution.md** comme source arbitre

---

## 🚀 Onboarding Nouveau Contributeur

**Jour 1:**
- [ ] Lire `README.md` (projet root, 5 min)
- [ ] Parcourir DEVELOPER_GUIDE Quick Start (10 min)
- [ ] Clone repo + `mvn clean package` (15 min)

**Jour 2:**
- [ ] Lire DEVELOPER_GUIDE Pattern complet (60 min)
- [ ] Implémenter small test feature (helloWorld endpoint) (60 min)
- [ ] Revision avec mentor (30 min)

**Puis:**
- [ ] Utiliser CODE_REVIEW_CHECKLIST pour PRs futures
- [ ] Consulter constitution au besoin
- [ ] Poser questions sur Slack/Discord si confusion

---

## ✨ Version d'Information

| Document | Version | LastUpdated |
|----------|---------|-------------|
| constitution.md | 1.0.0 | 2026-01-23 |
| ARCHITECTURE_ANALYSIS.md | 1.0.0 | 2026-01-23 |
| GOVERNANCE_SUMMARY.md | 1.0.0 | 2026-01-23 |
| CODE_REVIEW_CHECKLIST.md | 1.0.0 | 2026-01-23 |
| DEVELOPER_GUIDE.md | 1.0.0 | 2026-01-23 |
| (ce fichier) | 1.0.0 | 2026-01-23 |

---

## 📞 Questions?

1. **Question sur development?** → `DEVELOPER_GUIDE.md` + patterns
2. **Question sur governance?** → `constitution.md`
3. **Question sur architecture?** → `ARCHITECTURE_ANALYSIS.md`
4. **Question sur code review?** → `CODE_REVIEW_CHECKLIST.md`
5. **Question sur strategy?** → `GOVERNANCE_SUMMARY.md`

---

**Welcome to HelloAPI Project!** 🚀

Pour commencer → Lire `DEVELOPER_GUIDE.md` Quick Start section.
