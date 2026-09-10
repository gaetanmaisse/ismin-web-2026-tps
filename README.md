# Développement Web : TPs

**Full-Stack TypeScript, DevOps & AI-Assisted Coding**
Mines Saint-Étienne, ISMIN 3A : promotion 2026

📊 **Les slides du cours** : https://gaetanmaisse.github.io/ismin-web-2026-tps/

---

## 🚀 Pour commencer

**Forkez ce dépôt**, puis :

```sh
git clone https://github.com/VOTRE-PSEUDO/ismin-web-2026-tps.git
cd ismin-web-2026-tps
git remote add upstream https://github.com/gaetanmaisse/ismin-web-2026-tps.git
```

Les TPs sont publiés **au fil des séances**. Récupérez celui du jour avec :

```sh
git pull upstream main
```

Chaque TP est un projet autonome : `cd tpNN && npm install`.

## 📚 Les séances

| | Séance | TP |
|---|---|---|
| **Sprint 1 : Fondations & serveur** | | |
| 1 | Git & TypeScript | [`tp01/`](./tp01) |
| 2 | NestJS : API REST & asynchronisme | `tp02/` |
| 3 | Persistance : ORM & base de données | `tp03/` |
| **Sprint 2 : Sécurité & UI** | | |
| 4 | Authentification JWT & Guards | `tp04/` |
| 5 | React : composants & JSX | `tp05/` |
| 6 | État local & Hooks | `tp06/` |
| **Sprint 3 : Fusion & QA** | | |
| 7 | Connecter React à l'API | `tp07/` |
| 8 | Routage client | `tp08/` |
| 9 | Tests automatisés | `tp09/` |
| **Sprint 4 : DevOps & production** | | |
| 10 | Docker | `tp10/` |
| 11 | CI/CD avec GitHub Actions | `tp11/` |
| 12 | Déploiement cloud | `tp12/` |

## 🧵 Le fil rouge : ModelZoo

Tous les TPs construisent la même application : **ModelZoo**, un catalogue de modèles d'IA : chercher, comparer, garder une shortlist. Vous commencez par une interface TypeScript en séance 1 et vous terminez avec une application full-stack déployée en production en séance 12.

Chaque TP démarre d'un état fonctionnel : si vous n'avez pas terminé le précédent, vous repartez d'une base saine et vous suivez quand même.

## 🤖 L'IA dans ce cours

Les assistants sont autorisés et encouragés : comme assistants, jamais comme substituts. L'outillage évolue avec vos compétences : [Le Chat](https://chat.mistral.ai) dans le navigateur pour commencer, puis l'intégration à l'éditeur, puis un agent en ligne de commande sur les séances DevOps.

> ⚠️ **Règle d'or** : pendant les TP, je passe et je vous demande d'expliquer votre code. Si vous ne savez pas expliquer une partie, je la supprime.

## ✅ Prérequis

- [Node.js **26**](https://nodejs.org/en/download) (npm est inclus) : `node --version` doit afficher `v26.x`
  <br/>Toute la promo sur la même version : un `.nvmrc` est à la racine du dépôt, `nvm use` ou `fnm use` suffit.
- [Git](https://git-scm.com) et un compte [GitHub](https://github.com)
- [VS Code](https://code.visualstudio.com) ou l'éditeur de votre choix
- Un compte [Le Chat](https://chat.mistral.ai) (gratuit)
