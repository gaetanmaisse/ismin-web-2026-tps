---
theme: seriph
favicon: ./favicon-mse.png
layout: center
title: "Le projet : une application pour un client"
info: |
  ## Développement Web · ISMIN 3A
  Full-Stack TypeScript, DevOps & AI-Assisted Coding
class: text-center
highlighter: shiki
fonts:
  sans: Roboto
  serif: Roboto
  mono: JetBrains Mono
  weights: '300,400,500,700'
drawings:
  persist: false
transition: slide-left
mdc: true
---

<CourseCover :sprint="4" :seance="13" />

# Le projet

## Une application pour un client

<div class="pt-4 op-75">En binôme. Le code et le rapport produit le 25 octobre, le rapport d’audit le 8 novembre</div>

<div class="pt-10 text-sm op-75">
📱 <b>gaetanmaisse.github.io/ismin-web-2026-tps/projet</b>
</div>

---

# Le client, c’est moi

<div class="grid grid-cols-2 gap-8 pt-2">
<div>

Un client a un problème. Il vous l’explique mal, comme tous les clients.

Votre travail&nbsp;: comprendre ce dont il a **vraiment** besoin, décider ce que vous construisez, le construire, et le lui livrer.

<div class="pt-4">

**Trois fonctionnalités, pas une de plus.** Bien faites, testées, et qui démarrent d’une seule commande. Choisir les trois bonnes, c’est la moitié du projet.

</div>
</div>
<div>

<div class="p-4 bg-blue-500 bg-opacity-10 rounded">

**Les questions se posent dans les Discussions du repo**, un fil par sujet.

Je réponds en tant que client, et tout le monde voit les réponses.

Le brief est flou exprès&nbsp;: ce que vous ne demandez pas, vous ne le saurez pas.

</div>

<div class="pt-4 text-sm op-75">
<a href="https://github.com/gaetanmaisse/ismin-web-2026-tps/discussions" target="_blank">
github.com/gaetanmaisse/ismin-web-2026-tps/discussions
</a>
</div>
</div>
</div>

---

# Les dix sujets

<div class="text-sm op-75 -mt-2 mb-4">Dix clients d’une même école d'ingénieur fictive.</div>

<div class="grid grid-cols-2 gap-8 pt-2">
<div>

1. **La salle blanche**
2. **Les échantillons du labo**
3. **Les demandes de mesure**
4. **Les soutenances de stage**
5. **Le forum entreprises**

</div>
<div>

6. **Le foyer**
7. **La salle de sport**
8. **L’entraide étudiante**
9. **La science dans les écoles**
10. **La junior-entreprise**

</div>
</div>

<div class="pt-6">

Un sujet par binôme, **premier arrivé, premier servi**&nbsp;: annoncez votre choix en répondant au fil du sujet, avec les noms du binôme.

</div>

<div class="pt-4 text-sm op-75">
Les briefs complets&nbsp;: <a href="https://github.com/gaetanmaisse/ismin-web-2026-tps/blob/main/projet/SUJETS.md" target="_blank"><code>projet/SUJETS.md</code></a>. L’énoncé&nbsp;: <a href="https://github.com/gaetanmaisse/ismin-web-2026-tps/blob/main/projet/README.md" target="_blank"><code>projet/README.md</code></a>.
</div>

---

# Le socle technique, imposé

<div class="text-sm">

| Exigence                                                        | Comment je le vérifie                              |
|-----------------------------------------------------------------|----------------------------------------------------|
| `docker compose up` à la racine démarre tout, base comprise     | Je clone sur une machine neuve et je lance         |
| NestJS et Prisma, React, en TypeScript                          | Je lis le repo                                     |
| Authentification JWT, avec les rôles dont votre client a besoin | Je crée un compte de chaque rôle et je me connecte |
| `GET /health` répond `200`                                      | Je l’appelle, une fois l’application lancée        |
| Des tests automatisés, côté API et côté front                   | `npm test` dans chaque dossier                     |

</div>

<div class="pt-3 text-sm op-75">
Docker se voit en séance 12, le mercredi 7 octobre&nbsp;: d’ici là, lancez l’API et le front comme en TP. Vous pouvez partir de zéro ou réutiliser le code des TPs.
</div>

---

# L’IA

<div class="grid grid-cols-2 gap-8 pt-4">
<div>

Pour le code, tout est permis.

⚠ **Les 2 rapports, produit et audit, qui s’écrivent entièrement à la main.**

La note ne porte pas sur la quantité de code. Elle porte sur vos décisions, et sur ce qui fonctionne vraiment.

</div>
<div>

<div class="p-4 bg-blue-500 bg-opacity-10 rounded">

**Un assistant produit du code, pas des décisions.** Choisir quoi construire, quoi couper, et le justifier&nbsp;: c’est vous.

</div>

</div>
</div>

---

# Les jalons

<div class="text-sm pt-2">

| Date                                   | Jalon                             | Ce que vous rendez                                                                                                                          |
|----------------------------------------|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| **Ven. 9 octobre**                     | **Le cadrage**                    | Un commentaire dans le fil de votre sujet&nbsp;: le besoin compris, les trois fonctionnalités, ce que vous laissez de côté, le lien du repo |
| **Dim. 25 octobre, 23&nbsp;h&nbsp;59** | **Le code et le rapport produit** | Le code sur `main`, qui démarre avec `docker compose up`, avec `RAPPORT.md` à la racine. C’est la version notée                             |
| **Dim. 8 novembre, 23&nbsp;h&nbsp;59** | **Le rapport d’audit**            | Un fichier `AUDIT.md`, en pièce jointe d’un mail                                                                                            |

</div>

<div class="mt-4 p-3 bg-blue-500 bg-opacity-10 rounded text-sm">

**Tout passe par GitHub, sauf l’audit.** Les questions et le cadrage&nbsp; via les Discussions GitHub. Le code et le rapport produit&nbsp;: votre repo. L’audit: l’attribution et le rendu passent par mail.

</div>

---

# Le rapport produit&nbsp;: `RAPPORT.md`

<div class="p-3 mb-4 bg-blue-500 bg-opacity-10 rounded text-sm">

**Écrit à la main, entièrement, en Markdown.** Aucune IA pour le rédiger, le reformuler ou le corriger. 
Un fichier `RAPPORT.md` dans le repo: pas de slides, pas de PDF.
Court, avec vos mots et vos fautes.

</div>

<div>

1. **Le besoin.** Ce que le client voulait vraiment, et en quoi c’était différent de son premier message. Les questions qui vous ont fait changer d’idée.
2. **Les trois fonctionnalités**, et ce que vous avez tranché, avec la raison.
3. **L’IA, écartée.** Au moins une proposition de l’assistant que vous n’avez pas retenue, citée, avec la raison.

</div>

---
layout: center
class: text-center
---

<div class="text-3xl font-bold">
Un rapport produit écrit par une IA, je ne le lis pas.
</div>

<div class="pt-4 text-5xl font-bold text-red-600">
0 au rapport produit.
</div>

<img src="/medias/pangram.svg" alt="Pangram" class="h-12 mx-auto mt-14" />

<div class="pt-4 italic op-75">
«&nbsp;On n’a pas voulu prendre ce risque.&nbsp;»
</div>
<div class="pt-1 text-sm op-60">
L’Académie Goncourt, septembre 2026. Moi non plus.
</div>

---

# L’audit&nbsp;: le projet d’un autre binôme

<div class="grid grid-cols-2 gap-8 pt-2">
<div>

Vous auditez le projet d'un autre binôme, comme l’API du TP5 en séance 6&nbsp;: vous lancez l’application, vous la testez en client, vous lisez son code.

<div class="mt-4 p-4 bg-blue-500 bg-opacity-10 rounded text-sm">

**L’audit est pour moi seul.** Il m’arrive par mail&nbsp;; le binôme audité ne le lit pas.

</div>

<div class="pt-4 text-sm op-75">
L’IA peut vous aider à lire le code. Choisir, vérifier et classer, c’est vous&nbsp;: chaque problème cité doit exister dans le code. <b>Le rapport d’audit s’écrit à la main.</b>
</div>
</div>
<div class="text-sm">

Le rapport d’audit&nbsp;: `AUDIT.md`, en **Markdown**: pas de slides ou de PDF.

1. **Le problème** le plus important&nbsp; (ou l'amélioration): le fichier, la ligne, le scénario «&nbsp;si quelqu’un fait X, alors Y&nbsp;».
2. **La solution**&nbsp;: le principe, l’effort, le test qui prouverait que c’est réglé.
3. **Le backlog**&nbsp;: trois à cinq autres problèmes, classés.
4. **Ce qui est réussi**&nbsp;: deux choses que vous reprendriez dans votre projet, et pourquoi.

</div>
</div>

---
layout: center
class: text-center
---

<div class="text-3xl font-bold">
Un rapport d’audit écrit par une IA, je ne le lis pas.
</div>

<div class="pt-4 text-5xl font-bold text-red-600">
0 à l’audit.
</div>

<img src="/medias/pangram.svg" alt="Pangram" class="h-12 mx-auto mt-14" />

<div class="pt-4 italic op-75">
«&nbsp;On n’a pas voulu prendre ce risque.&nbsp;»
</div>
<div class="pt-1 text-sm op-60">
L’Académie Goncourt, septembre 2026. Moi non plus.
</div>

---

# La grille, une note par binôme

<div class="text-sm pt-2">

| Critère                  | Poids     | Ce que je regarde                                                                                                                                        |
|--------------------------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Le socle technique**   | 35&nbsp;% | Le respect des exigences et des bonnes pratiques de code et de test                                                                                      |
| **La réflexion produit** | 35&nbsp;% | Les questions posées au client dans le fil, et le rapport produit&nbsp;: les trois bonnes fonctionnalités, des coupes justifiées                         |
| **L’audit**              | 30&nbsp;% | Le rapport d’audit&nbsp;: des problèmes réels et vérifiés, le plus important bien choisi, un backlog bien classé                                         |

</div>

---

# D’ici le 9 octobre

<div class="pt-4">

1. **Choisir un sujet**&nbsp;: répondez au thread du sujet avec les noms du binôme. Premier arrivé, premier servi.
2. **Poser vos premières questions** au client, dans ce même thread.
3. **Créer le repo** du binôme sur GitHub, public ou privé partagé avec `gaetanmaisse`.
4. **Vendredi 9 octobre, le cadrage**&nbsp;: un commentaire dans le thread de votre sujet. Ce que vous avez compris du besoin, les trois fonctionnalités, ce que vous laissez de côté, le lien du repo.

</div>

<div class="pt-6 text-sm op-75">
L’énoncé complet&nbsp;: <a href="https://github.com/gaetanmaisse/ismin-web-2026-tps/blob/main/projet/README.md" target="_blank"><code>projet/README.md</code></a>. Les dix briefs&nbsp;: <a href="https://github.com/gaetanmaisse/ismin-web-2026-tps/blob/main/projet/SUJETS.md" target="_blank"><code>projet/SUJETS.md</code></a>.
</div>
