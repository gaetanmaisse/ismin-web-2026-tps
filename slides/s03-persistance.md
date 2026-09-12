---
theme: seriph
favicon: ./favicon-mse.png
layout: center
title: "Séance 3 : Persistance : ORM & base de données"
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

<CourseCover :sprint="1" :seance="3" />

# La persistance

## ORM & base de données

<div class="pt-4 op-75">Séance 3&nbsp;: Sprint 1, Fondations & serveur</div>

<div class="pt-10 text-sm op-75">
📱 <b>gaetanmaisse.github.io/ismin-web-2026-tps</b>
</div>

<!--
⏱ MINUTAGE PRÉVU (minutes depuis le début)
  +00  Reprise : tout a disparu
  +10  Stocker des données : les options
  +22  Ce qu'est un ORM
  +37  Prisma en pratique
  +52  TP partie 1 : schéma, migration, service branché
  +85  PAUSE (15 min)
  +100 Relations et le piège du N+1
  +115 TP partie 2 : relation, seed, N+1
  +140 Correction
  +145 Revue de fin de sprint, en binôme
  +165 Fin

⚠️ SI EN RETARD, coupez dans cet ordre :
  1. « Les transactions »
  2. « SQL, le minimum vital » (à sauter : ils ont un cours dédié)
  3. Le bonus du TP
Ne coupez JAMAIS le N+1 : c'est LE piège des ORM.

🔴 C'est la séance de REVUE DE FIN DE SPRINT 1 : garder 20 min,
huit binômes à deux minutes trente.

Ctrl+Shift+R pour remettre le relevé à zéro MAINTENANT.
-->

---
layout: center
---

# Faites l’expérience maintenant

<div class="pt-4 text-left max-w-md mx-auto">

```sh
# Votre API d'hier tourne encore ?
curl localhost:3000/models      # → vos modèles

# Arrêtez-la (Ctrl+C), relancez-la
npm run start:dev
curl localhost:3000/models      # → []
```

</div>

<v-click>

<div class="pt-8 text-center text-lg">
<b>Tout a disparu.</b>
</div>

<div class="pt-4 text-center op-75">
Vos données vivaient dans votre <code>ModelZoo</code>, en mémoire.<br/>
Un redémarrage, une mise à jour, un plantage, et il ne reste rien.
</div>

</v-click>

<!--
🔴 Le faire pour de vrai au vidéoprojecteur. La frustration est
le meilleur argument de la séance.
-->

---

# Où mettre les données, alors&nbsp;?

<div class="grid grid-cols-3 gap-4 pt-6 text-sm">

<div class="p-4 border border-gray-500 border-opacity-30 rounded">
<div class="font-bold">📄 Un fichier JSON</div>
<div class="pt-2 op-75">
Simple. Mais il faut tout relire pour chercher, tout réécrire pour modifier, et deux écritures simultanées se corrompent.
</div>
<div class="pt-2 text-xs op-60">→ pour de la configuration, pas pour des données vivantes</div>
</div>

<div class="p-4 border border-blue-500 border-opacity-50 rounded">
<div class="font-bold">🗄 Une base relationnelle</div>
<div class="pt-2 op-75">
Recherche indexée, écritures concurrentes, contraintes d’intégrité, transactions. Cinquante ans de maturité.
</div>
<div class="pt-2 text-xs op-60">→ notre choix</div>
</div>

<div class="p-4 border border-gray-500 border-opacity-30 rounded">
<div class="font-bold">📦 Une base NoSQL</div>
<div class="pt-2 op-75">
Souple sur le schéma, très bien pour certains usages, mais l’intégrité devient votre problème.
</div>
<div class="pt-2 text-xs op-60">→ un autre cours</div>
</div>

</div>

<v-click>

<div class="pt-8 text-center">
On commence avec <b>SQLite</b>&nbsp;: une base relationnelle complète… dans un simple fichier.<br/>
<span class="op-75 text-sm">Zéro serveur à installer. On passera à PostgreSQL en séance 10, et ce sera une ligne à changer.</span>
</div>

</v-click>

---

# SQL, le minimum vital

<div class="text-sm op-75 mb-3">Rappel express&nbsp;: vous n’écrirez presque pas de SQL aujourd’hui, mais il faut savoir ce que l’outil produit.</div>

```sql
CREATE TABLE Model (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  org         TEXT NOT NULL,
  task        TEXT NOT NULL,
  parameters  REAL NOT NULL,
  downloads   INTEGER NOT NULL DEFAULT 0
);

INSERT INTO Model (id, name, org, task, parameters)
     VALUES ('mistral-7b', 'Mistral-7B', 'mistralai', 'text-generation', 7.2);

SELECT * FROM Model WHERE parameters > 5 ORDER BY downloads DESC;

UPDATE Model SET downloads = 1500000 WHERE id = 'mistral-7b';

DELETE FROM Model WHERE id = 'mistral-7b';
```

<div class="pt-3 text-sm op-75">
Une <b>table</b> = une classe. Une <b>ligne</b> = un objet. Une <b>colonne</b> = un attribut. La clé étrangère viendra avec les relations, après la pause.
</div>

<!--
🔴 À SAUTER par défaut : la promo a un cours dédié aux bases de données.
La garder en réserve uniquement si le sondage à main levée montre que
SQL n'est pas encore passé chez eux.

Notre sujet ici n'est pas SQL mais la CONNEXION à la base depuis une
application : le schéma comme source de vérité, les migrations
versionnées, le client typé, et le piège du N+1.
-->

---
layout: section
---

# 1. Les ORM

<div class="op-75 pt-2">Des objets plutôt que du SQL</div>

---

# Le problème que résout un ORM

<div class="grid grid-cols-2 gap-6 pt-4">
<div>

**Sans ORM**

```ts
const rows = await db.query(
  'SELECT * FROM Model WHERE org = ?',
  [org],
);

// rows est de type any[]
// Aucune vérification, aucune
// autocomplétion, une faute de
// frappe = une erreur à l'exécution
```

</div>
<div>

**Avec un ORM**

```ts
const models = await prisma.model.findMany({
  where: { org },
});

// models est de type Model[]
// Autocomplétion complète,
// erreurs à la compilation
```

</div>
</div>

<v-click>

<div class="pt-8">

**O**bject-**R**elational **M**apping&nbsp;: faire correspondre des **tables** à des **objets**, et écrire des requêtes dans votre langage plutôt qu’en chaînes de caractères.

</div>

</v-click>

---

# Ce qu’un ORM vous coûte

<v-clicks>

<div>

### 🎭 L’illusion que la base a disparu

`prisma.model.findMany()` ressemble à un appel de méthode. C’est un **aller-retour réseau** vers un autre processus. Vous l’oublierez, et vous en mettrez un dans une boucle.

</div>

<div>

### 🐌 Des requêtes que vous n’avez pas écrites

L’ORM génère le SQL. La plupart du temps c’est bien. Parfois c’est catastrophique, et vous ne le verrez qu’en production, avec de vraies données.

</div>

<div>

### 🔍 Le réflexe à prendre

Savoir **afficher le SQL généré**. Avec Prisma&nbsp;:

```ts
new PrismaClient({ log: ['query'] })
```

</div>

</v-clicks>

<!--
Message central de la séance : un ORM n'exempte pas de comprendre
ce qui se passe en dessous. On le démontre avec le N+1 après la pause.
-->

---
layout: section
---

# 2. Prisma

<div class="op-75 pt-2">Le schéma d’abord</div>

---

# Le schéma, source de vérité

`prisma/schema.prisma`

```prisma {1-4|6-8|10-18|all}
datasource db {
  provider = "sqlite"          // ← séance 10 : "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Model {
  id         String  @id
  name       String
  org        String
  task       String              // pas d'union côté base : une chaîne
  parameters Float
  downloads  Int     @default(0)
  license    String?             // le ? = colonne nullable
}
```

<div class="pt-2 text-sm op-75">
Un seul fichier décrit la base <b>et</b> les types TypeScript. Les deux ne peuvent pas diverger.
</div>

---

# Trois commandes

```sh {1-3|5-7|9-11|all}
# 1. Créer/mettre à jour la base à partir du schéma
npx prisma migrate dev --name ajout-du-modele
#    → écrit un fichier SQL dans prisma/migrations/, l'applique, régénère le client

# 2. Régénérer le client typé (fait automatiquement par migrate)
npx prisma generate
#    → met à jour les types TypeScript à partir du schéma

# 3. Inspecter la base à la souris
npx prisma studio
#    → une interface web sur localhost:5555
```

<v-click>

<div class="pt-4 p-4 bg-blue-500 bg-opacity-10 rounded text-sm">

Les **migrations sont versionnées avec le code**. Votre binôme lance `prisma migrate dev` et obtient exactement votre base. En production, `prisma migrate deploy` applique les migrations manquantes.

C’est du Git pour le schéma de données.

</div>

</v-click>

---

# Le client, en pratique

```ts {1-6|8-13|15-20|all}
// Lire
await prisma.model.findMany();
await prisma.model.findMany({ where: { task: 'translation' } });
await prisma.model.findUnique({ where: { id } });        // → Model | null
await prisma.model.findMany({ orderBy: { downloads: 'desc' }, take: 10 });

// Écrire
await prisma.model.create({ data: { id, name, org, task, parameters } });
await prisma.model.update({ where: { id }, data: { downloads: 42 } });
await prisma.model.delete({ where: { id } });
await prisma.model.upsert({ where: { id }, create: {...}, update: {...} });

// Compter, agréger
await prisma.model.count();
await prisma.model.aggregate({ _avg: { parameters: true } });
```

<div class="pt-2 text-sm op-75">
Tout renvoie une <b>promesse</b>&nbsp;: chaque appel part sur le réseau. D’où les <code>await</code> partout.
</div>

---

# Brancher Prisma dans Nest

<div class="grid grid-cols-2 gap-4 pt-2">
<div>

**Un service qui gère la connexion**

```ts
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit {

  async onModuleInit() {
    await this.$connect();
  }
}
```

</div>
<div>

**Injecté comme n’importe quel service**

```ts
@Injectable()
export class ModelsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  findAll() {
    return this.prisma.model.findMany();
  }
}
```

</div>
</div>

<v-click>

<div class="pt-8">

**Le contrôleur ne change presque pas**&nbsp;: un `await` par route, rien d’autre. C’est tout l’intérêt de la séparation d’hier&nbsp;:
on remplace le stockage sans toucher aux routes.

</div>

</v-click>

---
layout: section
---

# TP · partie 1

<div class="op-75 pt-2"><code>tp03/README.md</code>, étapes 1 à 4</div>

<div class="pt-8 text-sm inline-block text-left">

1. `cp .env.example .env`, `npm install`, et constater dans `tp02`&nbsp;: tout a disparu
2. Écrire le modèle `Model` dans `schema.prisma`
3. Première migration&nbsp;: `npx prisma migrate dev`
4. Brancher `ModelsService` sur Prisma&nbsp;: les tests d’hier doivent repasser au vert

</div>

<div class="pt-8 text-sm op-75">
🖐 Bloqué&nbsp;? Levez la main.
</div>

<!--
⏱ +52.

Amorçage en Randori : écrire le schéma ensemble, lancer la première
migration au vidéoprojecteur, ouvrir prisma studio pour montrer la
table vide. 10 minutes.

Blocages classiques :
- oublier DATABASE_URL dans .env → message d'erreur clair, les laisser lire
- findUnique renvoie null, pas undefined → le service doit s'adapter,
  et license nullable aussi : null en base, undefined dans le domaine
- oublier `await` → une Promise qui part en JSON
- avant l'étape 3, rien ne compile : prisma.model n'existe pas encore,
  c'est normal, le leur dire avant qu'ils cherchent

⏱ Pause de 15 min à +85, annoncée à l'oral. Noter l'écart réel.
-->

---
layout: section
---

# 3. Les relations

<div class="op-75 pt-2">Une colonne, deux directions</div>

---

# Une organisation, plusieurs modèles

```prisma {1-8|10-20|all}
model Organisation {
  id      Int     @id @default(autoincrement())
  slug    String  @unique        // "mistralai"
  name    String                 // "Mistral AI"
  country String?                // le ? = colonne nullable

  models  Model[]                // ← le côté "plusieurs"
}

model Model {
  id         String @id
  name       String
  task       String
  parameters Float
  downloads  Int    @default(0)
  license    String?

  org        Organisation @relation(fields: [orgId], references: [id])
  orgId      Int                 // ← la clé étrangère, vraie colonne
}
```

<div class="pt-2 text-sm op-75">
Côté base&nbsp;: une seule colonne <code>orgId</code>. Côté TypeScript&nbsp;: deux propriétés navigables dans les deux sens.
</div>

---

# Charger la relation&nbsp;: `include`

```ts {1-4|6-12|all}
// Sans include : orgId seulement, pas l'organisation
const model = await prisma.model.findUnique({ where: { id } });
// { id: '…', name: '…', orgId: 3 }

// Avec include : Prisma fait la jointure
const model = await prisma.model.findUnique({
  where: { id },
  include: { org: true },
});
// { id: '…', name: '…', orgId: 3,
//   org: { id: 3, slug: 'mistralai', name: 'Mistral AI' } }
```

<v-click>

<div class="pt-6 text-sm op-75">
Et le type TypeScript s’ajuste&nbsp;: sans <code>include</code>, accéder à <code>model.org</code> est une <b>erreur de compilation</b>. C’est ce qui distingue Prisma d’un ORM classique.
</div>

</v-click>

---

# 🐌 Le piège du N+1

<div class="grid grid-cols-2 gap-6 pt-2">
<div>

**Ce qu’on écrit naturellement**

```ts
const models = await prisma.model.findMany();

for (const model of models) {
  const org = await prisma.organisation
    .findUnique({ where: { id: model.orgId } });

  console.log(model.name, org.name);
}
```

</div>
<div>

**Ce que la base reçoit**

```sql
SELECT * FROM Model;              -- 1

SELECT * FROM Organisation WHERE id = 1;
SELECT * FROM Organisation WHERE id = 2;
SELECT * FROM Organisation WHERE id = 3;
-- … une par modèle              -- N
```

<div class="pt-2 text-sm op-75">
17 modèles → <b>18 requêtes</b>.<br/>
10 000 modèles → 10 001 requêtes.
</div>

</div>
</div>

<v-click>

<div class="pt-6 p-4 bg-green-500 bg-opacity-10 rounded">

**La correction tient en un mot&nbsp;:**

```ts
const models = await prisma.model.findMany({ include: { org: true } });
// → 2 requêtes, quel que soit le nombre de modèles
```

</div>

</v-click>

<!--
🔴 NE JAMAIS COUPER cette slide. C'est LE piège des ORM, celui qui
met des applications à genoux en production.

Le démontrer en direct : activer log: ["query"] et montrer les 18 lignes
défiler dans le terminal, puis les 2 avec include. Ça se voit.
-->

---

# Les transactions&nbsp;: tout ou rien

Deux écritures qui doivent réussir ou échouer **ensemble**&nbsp;:

```ts
await prisma.$transaction([
  prisma.model.create({ data: nouveauModele }),
  prisma.organisation.update({
    where: { id: orgId },
    data: { modelCount: { increment: 1 } },   // un compteur ajouté à Organisation
  }),
]);
```

<v-click>

<div class="pt-6">

Si la seconde échoue, la première est **annulée**. Sans transaction, vous auriez un modèle créé et un compteur faux&nbsp;: une incohérence silencieuse, qui ne se verra que des semaines plus tard.

</div>

</v-click>

<!--
Sacrifiable si retard. Le concept suffit, ils n'en ont pas besoin
pour le TP.
-->

---
layout: section
---

# TP · partie 2

<div class="op-75 pt-2"><code>tp03/README.md</code>, étapes 5 à 7</div>

<div class="pt-8 text-sm inline-block text-left">

5. Ajouter `Organisation` et la relation, **sans changer la forme de l’API**
6. Adapter le seed&nbsp;: les organisations d’abord, les modèles ensuite
7. Repérer le N+1 dans votre `findAll`, et le corriger

</div>

<!--
⏱ +122.

L'étape 7 est la plus formatrice : leur faire activer log: ["query"]
et compter les requêtes eux-mêmes.
-->

---

# Correction&nbsp;: combien de requêtes&nbsp;?

<div class="pt-4">

Activez le journal, appelez `GET /models`, et comptez&nbsp;:

</div>

```ts
// prisma.service.ts
super({ log: ['query'] });
```

<div class="grid grid-cols-2 gap-6 pt-6 text-sm">
<div class="p-4 border border-red-500 border-opacity-40 rounded">

**18 lignes dans le terminal**

Vous avez un N+1. Cherchez la boucle avec un `await` dedans.

</div>
<div class="p-4 border border-green-500 border-opacity-40 rounded">

**2 lignes**

`include` fait la jointure. C’est ce qu’on veut.

</div>
</div>

<v-click>

<div class="pt-8">

**Le réflexe à garder&nbsp;:** devant une lenteur, la première question n’est jamais « quel index ajouter&nbsp;? » mais **« combien de requêtes ma page envoie-t-elle&nbsp;? »**

</div>

</v-click>

---
layout: center
---

# 📋 Revue de fin de sprint 1

<div class="pt-6">

En binôme, deux minutes trente pour montrer&nbsp;:

</div>

<div class="pt-4 text-left max-w-lg mx-auto">

1. Votre API qui répond, avec des données qui **survivent au redémarrage**
2. Votre historique Git&nbsp;: des commits réguliers, des messages qui suivent la convention
3. **Un bout de code proposé par l’IA que vous avez corrigé**&nbsp;: lequel, et pourquoi

</div>

<div class="pt-8 op-75 text-sm">
Ce n’est pas noté. C’est pour se situer, et pour prendre l’habitude de défendre son code.
</div>

<!--
🔴 20 MINUTES BUDGÉTÉES, huit binômes. Ne pas les sacrifier si la séance déborde :
c'est ici que la règle d'or passe du contrôle individuel pendant les TP
à une explication devant les autres.

Prendre des notes pour le RETEX : qui a décroché, qui est en avance.
-->

---
layout: center
class: text-center
---

# Sprint 2&nbsp;: la semaine prochaine

## Sécurité & interface

<div class="pt-6 op-75">
Votre API est ouverte à tous les vents&nbsp;: n’importe qui peut supprimer n’importe quoi.<br/>
Lundi, on la verrouille, puis on lui donne enfin un visage.
</div>

<div class="pt-10 text-sm op-60">
Slides&nbsp;: gaetanmaisse.github.io/ismin-web-2026-tps
</div>

<!--
⏱ AVANT DE PARTIR :
  1. Ctrl+Shift+T → CSV de minutage
  2. docs/RETEX-seance-03.md
  3. ./publier-tp.sh corrige 03
  4. Préparer le sprint 2 pendant la semaine
-->
