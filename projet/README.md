# Projet : une application pour un client

*Développement Web, ISMIN 3A. En binôme. Le code et le rapport produit le dimanche 25 octobre, le rapport d'audit le dimanche 8 novembre.*

## 🎯 La mission

Un client a un problème. Il vous l'explique mal, comme tous les clients. Votre travail : comprendre ce dont il a vraiment besoin, décider ce que vous construisez, le construire, et le lui livrer.

Les dix clients sont dans [`SUJETS.md`](./SUJETS.md). Un sujet par binôme, premier arrivé, premier servi.

**Le client, c'est moi.** Chaque sujet a son fil dans les [Discussions](https://github.com/gaetanmaisse/ismin-web-2026-tps/discussions) du dépôt. Vous y posez vos questions, je réponds en tant que client, et tout le monde voit les réponses. Le brief est flou exprès : ce que vous ne demandez pas, vous ne le saurez pas. Et un client ne parle pas de base de données ni d'API : il parle de son problème.

**Trois fonctionnalités, pas une de plus.** Bien faites, testées, et qui démarrent d'une seule commande. Une quatrième ne rapporte rien. Choisir les trois bonnes, c'est la moitié du projet.

## 🤖 IA

Pour le code, tout est permis : Le Chat, Continue, un agent en ligne de commande. Les outils gratuits vus en cours suffisent. **Deux exceptions : le rapport produit et le rapport d'audit s'écrivent à la main**, voir plus bas. La note ne porte pas sur la quantité de code, elle porte sur vos décisions et sur ce qui fonctionne vraiment.

Deux conséquences :

- Un assistant produit du code, pas des décisions. C'est à vous de choisir quoi construire, quoi couper, et de le justifier.
- Chaque affirmation de votre rapport produit renvoie à une preuve : un commit, `fichier:ligne`, un message du fil. Une affirmation sans preuve ne compte pas.

## 🧱 Le socle technique, imposé

| Exigence | Comment je le vérifie |
|---|---|
| Back en NestJS et Prisma, front en React, en TypeScript | Je lis le dépôt |
| Authentification JWT, avec les rôles dont votre client a besoin | Je crée un compte de chaque rôle et je me connecte |
| `docker compose up` à la racine démarre tout, base comprise | Je clone sur une machine neuve et je lance |
| `GET /health` répond `200` | Je l'appelle, une fois l'application lancée |
| Tests automatisés, côté API et côté front | `npm test` dans chaque dossier |

Vous pouvez partir de zéro ou réutiliser le code des TPs. Docker se voit en séance 12, le mercredi 7 octobre : d'ici là, lancez l'API et le front comme en TP.

## 🗓 Les jalons

| Date | Jalon | Ce que vous rendez |
|---|---|---|
| **Vendredi 9 octobre** | **Le cadrage** | Un commentaire dans le fil de votre sujet : ce que vous avez compris du besoin, les trois fonctionnalités, ce que vous laissez de côté, le lien du dépôt. Le client y réagit s'il n'est pas d'accord, comme à n'importe quelle question. |
| **Dimanche 25 octobre, 23 h 59** | **Le code et le rapport produit** | Un tag `v1.0` sur `main`, qui démarre avec `docker compose up`, avec `RAPPORT.md` à la racine. C'est la version notée : les commits suivants ne comptent pas. Le lendemain, je vous envoie par mail le projet que vous auditez. |
| **Dimanche 8 novembre, 23 h 59** | **Le rapport d'audit** | Un fichier `AUDIT.md`, en pièce jointe d'un mail. Le projet à auditer arrive le 26 octobre : rien ne vous empêche de le faire avant les vacances. |

**Tout passe par GitHub, sauf l'audit** : les questions et le cadrage dans les Discussions du cours, le code et le rapport produit dans votre dépôt. L'audit, lui, est confidentiel : l'attribution et le rendu se font par mail.

Le dépôt : un par binôme, sur GitHub, public ou privé partagé avec `gaetanmaisse`. S'il est privé, partagez-le aussi, le 26 octobre, avec le binôme qui vous audite : je vous dis lequel par mail.

## 📝 Le rapport produit : `RAPPORT.md`, 1 500 mots au plus

**En Markdown, dans le dépôt.** Pas de slides, pas de PDF, pas de Word : un fichier `RAPPORT.md` à la racine, lisible directement sur GitHub. 1 500 mots au plus, code et tableaux compris : `wc -w RAPPORT.md` fait foi.

**Écrit à la main, entièrement.** Aucune IA pour le rédiger, le reformuler ou le corriger. C'est le seul endroit où je lis votre raisonnement, pas celui d'un assistant. Court, avec vos mots et vos fautes, vaut mieux que propre et générique.

Il passe par [Pangram](https://www.pangram.com), un détecteur de textes générés par IA. **Un rapport produit écrit par une IA, je ne le lis pas : c'est 0 au rapport produit**, la part de la réflexion produit qui se note sur lui.

1. **Le besoin.** Ce que le client voulait vraiment, et en quoi c'était différent de son premier message. Les questions qui vous ont fait changer d'idée, avec le lien vers le fil.
2. **Les trois fonctionnalités.** Et ce que vous avez coupé, avec la raison.
3. **Le journal de décisions.** Cinq à dix entrées : ce que vous avez choisi, ce que vous avez écarté, pourquoi. Chaque entrée renvoie à un commit.
4. **L'IA, écartée.** Au moins une fois où l'assistant a proposé quelque chose que vous n'avez pas retenu. Citez sa proposition, dites pourquoi.

## 🔍 L'audit : le projet d'un autre binôme

Vous auditez la version `v1.0` d'un autre binôme, comme l'API du TP5 en séance 6. Vous lancez l'application, vous la testez en tant que client, vous lisez son code. **L'audit est pour moi seul** : il m'arrive par mail, le binôme audité ne le lit pas.

**Le rapport d'audit : un fichier `AUDIT.md`, en Markdown**, 1 000 mots au plus. Pas de slides : on garde le plan de la séance 6, pas sa forme.

1. **Le problème** le plus important : le fichier et la ligne, et le scénario « si quelqu'un fait X, alors Y ».
2. **La solution** : le principe, l'effort, et le test qui prouverait que c'est réglé.
3. **Le backlog** : trois à cinq autres problèmes, classés, avec leur impact et leur effort.
4. **Ce qui est réussi** : deux choses que vous reprendriez dans votre propre projet, et pourquoi.

L'IA peut vous aider à lire le code. Choisir, vérifier et classer, c'est vous : chaque problème cité doit exister dans le code. Et **le rapport d'audit s'écrit entièrement à la main**, comme le rapport produit. Il passe aussi par Pangram : **un rapport d'audit écrit par une IA, je ne le lis pas, c'est 0 à l'audit.**

## ✅ La grille, une note par binôme

| Critère | Poids | Ce que je regarde |
|---|---|---|
| Le socle technique | 35 % | Chaque ligne du tableau du socle, vérifiée une par une sur la `v1.0` |
| La réflexion produit | 35 % | Les questions posées au client dans le fil, et le rapport produit : les trois bonnes fonctionnalités, des coupes justifiées, le journal de décisions |
| L'audit | 30 % | Le rapport d'audit : des problèmes réels et vérifiés, le plus important bien choisi, un backlog bien classé |

> ⚠️ **Règle d'or** : ce que vous ne pouvez pas prouver par le dépôt ou par le fil ne compte pas.
