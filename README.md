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
```

Les TP sont publiés **au fil des séances**. À partir de la séance 2, vous déclarez le dépôt du cours comme `upstream`, une fois, puis vous récupérez le TP du jour :

```sh
git remote add upstream https://github.com/gaetanmaisse/ismin-web-2026-tps.git   # une seule fois
git config --global pull.rebase false                                             # une seule fois : un pull fusionne
git pull --no-edit upstream main                                                  # à chaque séance
```

Chaque TP est un projet autonome : `cd tpNN && npm install`.

## 📚 Les séances

| | Séance | TP |
|---|---|---|
| **Sprint 1 : Fondations & serveur** | | |
| 1 | Git & TypeScript | [`tp01/`](./tp01) |
| 2 | NestJS : API REST & asynchronisme | [`tp02/`](./tp02) |
| 3 | Persistance : ORM & base de données | [`tp03/`](./tp03) |
| **Sprint 2 : Sécurité & UI** | | |
| 4 | Authentification JWT & Guards | [`tp04/`](./tp04) |
| 5 | L'authentification, suite : les présentations et le TP4 | [`tp04/`](./tp04) |
| 6 | L'audit d'une vraie API | [`tp05/`](./tp05) |
| **Sprint 3 : Fusion & QA** | | |
| 7 | React, du composant à l'API | [`tp07/`](./tp07) |
| 8 | React, la suite : le réseau et le CORS | [`tp07/`](./tp07) |
| 9 | Annulée : finir le TP7 chez soi, avancer le projet | |
| **Sprint 4 : l'application complète** | | |
| 10 | Le routage, la connexion et les formulaires | [`tp08/`](./tp08), [`tp09/`](./tp09) |
| 11 | La connexion et les formulaires, suite | [`tp09/`](./tp09) |
| 12 | Docker : l'application en une commande | [`tp10/`](./tp10) |

## 🎓 Le projet

**Une application pour un client**, en binôme. C'est lui qui fait la note du cours.

- 📄 **L'énoncé** : [`projet/README.md`](./projet/README.md), à lire en entier
- 🏫 **Les dix sujets** : [`projet/SUJETS.md`](./projet/SUJETS.md), dix clients d'une école fictive
- 💬 **Les fils des sujets** : les [Discussions](https://github.com/gaetanmaisse/ismin-web-2026-tps/discussions) du dépôt, pour prendre un sujet et poser vos questions au client
- 📊 **Les slides** : https://gaetanmaisse.github.io/ismin-web-2026-tps/projet/

| Date | Ce que vous rendez |
|---|---|
| **Vendredi 9 octobre** | Le cadrage, dans le fil de votre sujet |
| **Dimanche 25 octobre, 23 h 59** | Le code et le rapport produit : un tag `v1.0` dans votre dépôt |
| **Dimanche 8 novembre, 23 h 59** | Le rapport d'audit, par mail |

## 🧵 Le fil rouge : ModelZoo

Tous les TPs construisent la même application : **ModelZoo**, un catalogue de modèles d'IA : chercher, comparer, garder une shortlist. Vous commencez par une interface TypeScript en séance 1 et vous terminez avec une application full-stack, qui démarre d'une seule commande avec Docker.

Chaque TP démarre d'un état fonctionnel : si vous n'avez pas terminé le précédent, vous repartez d'une base saine et vous suivez quand même.

## 🤖 L'IA dans ce cours

Les assistants sont autorisés et encouragés : comme assistants, jamais comme substituts. L'outillage évolue avec vos compétences : [Le Chat](https://chat.mistral.ai) dans le navigateur pour commencer, puis l'intégration à l'éditeur, puis un agent en ligne de commande sur les séances DevOps.

Dans ce dépôt, l'IA intégrée à l'éditeur est coupée par un réglage de projet (`.vscode/settings.json`) : on commence avec l'assistant dans le navigateur, et on ouvre l'éditeur plus tard, quand vous saurez relire ce qu'il propose.

> ⚠️ **Règle d'or** : pendant les TP, je passe et je vous demande d'expliquer votre code. Si vous ne savez pas expliquer une partie, je la supprime.

## ✅ Prérequis

- [Node.js **26**](https://nodejs.org/en/download) (npm est inclus) : `node --version` doit afficher `v26.x`
  <br/>Toute la promo sur la même version : un `.nvmrc` est à la racine du dépôt, `nvm use` ou `fnm use` suffit.
- [Git](https://git-scm.com) et un compte [GitHub](https://github.com)
- [VS Code](https://code.visualstudio.com) ou l'éditeur de votre choix
- Un compte [Le Chat](https://chat.mistral.ai) (gratuit)
