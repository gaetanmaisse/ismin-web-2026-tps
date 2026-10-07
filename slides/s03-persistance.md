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

---

# Il est temps de passer à autre chose

<img src="/medias/s03-boyfriend.jpg" class="h-96 mx-auto rounded" />

<div class="pt-4 text-center op-75">
Vos données méritent mieux qu’un tableau en mémoire.
</div>

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
Souple sur le schema, très bien pour certains usages, mais l’intégrité devient votre problème.
</div>
<div class="pt-2 text-xs op-60">→ un autre cours</div>
</div>

</div>

<v-click>

<div class="pt-8 text-center">
On commence avec <b>SQLite</b>&nbsp;: une base relationnelle complète… dans un simple fichier.<br/>
<span class="op-75 text-sm">Zéro serveur à installer, et la base tient dans un fichier&nbsp;: elle vous suivra jusque dans Docker, en séance 12.</span>
</div>

</v-click>

---
layout: section
---

# 1. L’asynchronisme

<div class="op-75 pt-2">Attendre sans bloquer</div>

---

# Un service qui devient asynchrone

<div class="grid grid-cols-2 gap-4 pt-2">
<div>

**Hier&nbsp;: tout en mémoire**

```ts
export class DatasetsService {
  create(dataset: Dataset): Dataset {
    …
  }

  findAll(): Dataset[] {
    …
  }

  findOne(id: string): Dataset | undefined {
    …
  }
}
```

</div>
<div>

**Aujourd’hui, avec une base de données**

```ts
export class DatasetsService {
  create(dataset: Dataset): Promise<Dataset> {
    …
  }

  findAll(): Promise<Dataset[]> {
    …
  }

  findOne(id: string): Promise<Dataset | null> {
    …
  }
}
```

</div>
</div>

<v-click>

<div class="pt-6">

Dès qu’une seule opération devient asynchrone, **tout ce qui l’appelle le devient aussi**. C’est contagieux, et ça remonte jusqu’au controller.

D’où la question suivante&nbsp;: c’est quoi, au juste, une opération asynchrone&nbsp;?

</div>

</v-click>

---

# Node exécute votre code sur un seul thread

<div class="text-sm op-75 mb-4">
Pas de <code>pthread_create</code> ici. Une seule file d’exécution, donc <b>on ne bloque jamais</b>.
</div>

<v-clicks>

- Lire un fichier, appeler une API, interroger une base&nbsp;: tout cela **prend du temps**
- Pendant ce temps, le thread doit rester libre pour traiter les autres requests
- Donc&nbsp;: on ne dit pas « attends le résultat », on dit **« préviens-moi quand tu l’as »**

</v-clicks>

<v-click>

<div class="pt-8 p-4 bg-blue-500 bg-opacity-10 rounded">
Conséquence directe&nbsp;: une fonction qui fait des entrées/sorties ne renvoie pas un résultat, elle renvoie une <b>Promise</b> de résultat.
</div>

</v-click>

---

# Ce qui se passe quand on bloque

<img src="/medias/s03-thisisfine.jpg" class="h-80 mx-auto rounded" />

<div class="pt-4 text-center op-75">
Bloquer le thread, c’est bloquer tout le monde.
</div>

---

# Deux façons d’écrire la même chose

````md magic-move
```ts
// ① Promises : une valeur qui arrivera plus tard, et une chaîne de then
readFile('datasets.json')
  .then((data) => parse(data))
  .then((datasets) => save(datasets))
  .then(() => console.log('done'))
  .catch(handle);
```

```ts
// ② async/await : on lit comme du synchrone
try {
  const data = await readFile('datasets.json');
  const datasets = await parse(data);
  await save(datasets);
  console.log('done');
} catch (err) {
  handle(err);
}
```
````

---

# `async` / `await` en pratique

```ts {1-5|7-9,18-20|11-15|all}
// async devant une fonction : elle renvoie TOUJOURS une Promise
async function loadDatasets(): Promise<Dataset[]> {
  const raw = await readFile('datasets.json', 'utf8');
  return JSON.parse(raw);        // un fichier à nous : on lui fait confiance
}

// await : dans une fonction async, ou à la racine d'un module ES
async function main() {
  const datasets = await loadDatasets();              // ✅

  // Plusieurs appels en parallèle : Promise.all
  const [locaux, distants] = await Promise.all([
    loadDatasets(),
    fetchFromHuggingFace(),
  ]);
}

function nope() {
  const datasets = await loadDatasets();              // ❌ erreur de compilation
}
```

<div class="pt-2 text-sm op-75">
<code>Promise.all</code> lance tout en même temps et attend le dernier. En série, ce serait deux fois plus lent.
</div>

---

# Et ça remonte jusqu’au controller

<img src="/medias/s03-gru.png" class="h-96 mx-auto rounded" />

<div class="pt-4 text-center op-75">
Dans le TP, chaque route du controller gagne un <code>await</code>. Rien d’autre.
</div>

---

# SQL, le minimum vital

<div class="text-sm op-75 mb-3">Rappel express&nbsp;: vous n’écrirez presque pas de SQL aujourd’hui, mais il faut savoir ce que l’outil produit.</div>

```sql
CREATE TABLE Dataset (
  name        TEXT PRIMARY KEY,
  org         TEXT NOT NULL,
  licence     TEXT NOT NULL,
  rows        INTEGER NOT NULL,
  downloads   INTEGER NOT NULL DEFAULT 0
);

INSERT INTO Dataset (name, org, licence, rows)
     VALUES ('squad', 'stanfordnlp', 'cc-by-sa-4.0', 98169);

SELECT * FROM Dataset WHERE rows > 50000 ORDER BY downloads DESC;

UPDATE Dataset SET downloads = 1500000 WHERE name = 'squad';

DELETE FROM Dataset WHERE name = 'squad';
```

<div class="pt-3 text-sm op-75">
Une <b>table</b> = une classe. Une <b>ligne</b> = un objet. Une <b>colonne</b> = un attribut. La foreign key viendra avec les relations, en section 4.
</div>

---
layout: section
---

# 2. Les ORM

<div class="op-75 pt-2">Des objets plutôt que du SQL</div>

---

# Le problème que résout un ORM

<div class="grid grid-cols-2 gap-6 pt-4">
<div>

**Sans ORM**

```ts
const rows = await db.query(
  'SELECT * FROM Dataset WHERE org = ?',
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
const datasets = await prisma.dataset.findMany({
  where: { org },
});

// datasets est de type Dataset[]
// Autocomplétion complète,
// erreurs à la compilation
```

</div>
</div>

<v-click>

<div class="pt-8">

**O**bject-**R**elational **M**apping&nbsp;: faire correspondre des **tables** à des **objets**, et écrire des queries dans votre langage plutôt qu’en chaînes de caractères.

</div>

</v-click>

---

# Il y a un piège

<img src="/medias/s03-anakin.jpg" class="h-96 mx-auto rounded" />

<div class="pt-4 text-center op-75">
L’ORM écrit le SQL, vous restez responsable de ce qu’il écrit.
</div>

---

# Ce qu’un ORM vous coûte

<v-clicks>

<div>

### 🎭 L’illusion que la base a disparu

`prisma.dataset.findMany()` ressemble à un appel de méthode. C’est un **aller-retour réseau** vers un autre processus. Vous l’oublierez, et vous en mettrez un dans une boucle.

</div>

<div>

### 🐌 Des queries que vous n’avez pas écrites

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

---
layout: section
---

# 3. Prisma

<div class="op-75 pt-2">Le schema d’abord</div>

---

# Le schema, source de vérité

`prisma/schema.prisma`

```prisma {1-3|5-8|10-17|all}
datasource db {
  provider = "sqlite"
}                              // l'URL de la base est dans prisma.config.ts

generator client {
  provider = "prisma-client"   // le client TypeScript, généré dans src/generated/
  output   = "../src/generated/prisma"
}

model Dataset {
  name        String  @id
  org         String
  licence     String             // pas d'union côté base : une chaîne
  rows        Int
  downloads   Int     @default(0)
  description String?            // le ? = colonne nullable
}
```

<div class="pt-2 text-sm op-75">
Un seul fichier décrit la base <b>et</b> les types TypeScript. Les deux ne peuvent pas diverger.
</div>

---

# Trois commandes

```sh {1-3|5-7|9-11|all}
# 1. Créer/mettre à jour la base à partir du schema
npx prisma migrate dev --name ajout-du-dataset
#    → écrit un fichier SQL dans prisma/migrations/, et l'applique

# 2. Régénérer le client typé, après chaque migration
npx prisma generate
#    → met à jour les types TypeScript à partir du schema

# 3. Inspecter la DB
npm run db:studio
#    → une interface web sur localhost:5555 (le script passe l'URL que Studio 7 exige)
```

<v-click>

<div class="pt-4 p-4 bg-blue-500 bg-opacity-10 rounded text-sm">

Les **migrations sont versionnées avec le code**. Votre binôme lance `prisma migrate dev` et obtient exactement votre base. En production, `prisma migrate deploy` applique les migrations manquantes.

C’est du Git pour le schema de données.

</div>

</v-click>

---

# Le seul chemin vers la base

<img src="/medias/s03-drake.jpg" class="h-96 mx-auto rounded" />

<div class="pt-4 text-center op-75">
Le schema change, la migration suit. Jamais l’inverse.
</div>

---

# Le client, en pratique

```ts {1-6|8-13|15-20|all}
// Lire
await prisma.dataset.findMany();
await prisma.dataset.findMany({ where: { licence: 'cc0-1.0' } });
await prisma.dataset.findUnique({ where: { name } });      // → Dataset | null
await prisma.dataset.findMany({ orderBy: { downloads: 'desc' }, take: 10 });

// Écrire
await prisma.dataset.create({ data: { name, org, licence, rows } });
await prisma.dataset.update({ where: { name }, data: { downloads: 42 } });
await prisma.dataset.delete({ where: { name } });
await prisma.dataset.upsert({ where: { name }, create: {...}, update: {...} });

// Compter, agréger
await prisma.dataset.count();
await prisma.dataset.aggregate({ _avg: { rows: true } });
```

<div class="pt-2 text-sm op-75">
Tout renvoie une <b>Promise</b>&nbsp;: chaque appel part sur le réseau. D’où les <code>await</code> partout.
</div>

---

# Ce que le client généré vous donne

<img src="/medias/s03-rollsafe.jpg" class="h-80 mx-auto rounded" />

<div class="pt-4 text-center op-75">
Le type sort du schema, pas de votre bonne foi.
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
  constructor() {
    super({ adapter: new PrismaBetterSqlite3({ url }) });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
```

<div class="text-sm op-75 pt-1">
<code>onModuleInit</code> est appelé avant d’écouter, et peut être <code>async</code>&nbsp;: le bon moment pour ouvrir la connexion.
</div>

</div>
<div>

**Injecté comme n’importe quel service**

```ts
@Injectable()
export class DatasetsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  findAll() {
    return this.prisma.dataset.findMany();
  }
}
```

</div>
</div>

<v-click>

<div class="pt-8">

**Le controller ne change presque pas**&nbsp;: un `await` par route, rien d’autre. C’est tout l’intérêt de la séparation d’hier&nbsp;:
on remplace le stockage sans toucher aux routes.

</div>

</v-click>

---
layout: section
---

# 4. Les relations

<div class="op-75 pt-2">Une colonne, deux directions</div>

---

# Douze lignes, la même chaîne

<img src="/medias/s03-buzz.jpg" class="h-96 mx-auto rounded" />

<div class="pt-4 text-center op-75">
Une valeur répétée, c’est une table qui manque.
</div>

---

# Une organisation, plusieurs datasets

```prisma {1-8|10-19|all}
model Organisation {
  id      String  @id @default(uuid())
  slug    String  @unique        // "mozilla"
  name    String                 // "Mozilla"
  country String?                // le ? = colonne nullable

  datasets Dataset[]             // ← le côté "plusieurs"
}

model Dataset {
  name        String  @id
  licence     String
  rows        Int
  downloads   Int     @default(0)
  description String?

  org         Organisation @relation(fields: [orgId], references: [id])
  orgId       String             // ← la foreign key, vraie colonne
}
```

<div class="pt-2 text-sm op-75">
Côté base&nbsp;: une seule colonne <code>orgId</code>. Côté TypeScript&nbsp;: deux propriétés navigables dans les deux sens.
</div>

---

# Charger la relation&nbsp;: `include`

```ts {1-4|6-12|all}
// Sans include : orgId seulement, pas l'organisation
const dataset = await prisma.dataset.findUnique({ where: { name } });
// { name: 'common_voice', orgId: '5f1e…' }

// Avec include : Prisma fait le join
const dataset = await prisma.dataset.findUnique({
  where: { name },
  include: { org: true },
});
// { name: 'common_voice', orgId: '5f1e…',
//   org: { id: '5f1e…', slug: 'mozilla', name: 'Mozilla' } }
```

<v-click>

<div class="pt-6 text-sm op-75">
Et le type TypeScript s’ajuste&nbsp;: sans <code>include</code>, accéder à <code>model.org</code> est une <b>erreur de compilation</b>. C’est ce qui distingue Prisma d’un ORM classique.
</div>

</v-click>

---

# Vous allez le faire. Tout le monde le fait.

<img src="/medias/s03-clown.jpg" class="h-96 mx-auto rounded" />

<div class="pt-4 text-center op-75">
Une boucle de queries, c’est le piège de l’après-midi.
</div>

---

# 🐌 Le piège du N+1

<div class="grid grid-cols-2 gap-6 pt-2">
<div>

**Ce qu’on écrit naturellement**

```ts
const datasets = await prisma.dataset.findMany();

for (const dataset of datasets) {
  const org = await prisma.organisation
    .findUnique({ where: { id: dataset.orgId } });

  console.log(dataset.name, org.name);
}
```

</div>
<div>

**Ce que la base reçoit**

```sql
SELECT * FROM Dataset;              -- 1

SELECT * FROM Organisation WHERE id = 1;
SELECT * FROM Organisation WHERE id = 2;
SELECT * FROM Organisation WHERE id = 3;
-- … une par dataset              -- N
```

<div class="pt-2 text-sm op-75">
17 datasets → <b>18 queries</b>.<br/>
10 000 datasets → 10 001 queries.
</div>

</div>
</div>

<v-click>

<div class="pt-6 p-4 bg-green-500 bg-opacity-10 rounded">

**La correction tient en un mot&nbsp;:**

```ts
const datasets = await prisma.dataset.findMany({ include: { org: true } });
// → 2 queries, quel que soit le nombre de datasets
```

</div>

</v-click>

---

# Les transactions&nbsp;: tout ou rien

Deux écritures qui doivent réussir ou échouer **ensemble**&nbsp;:

```ts
await prisma.$transaction([
  prisma.dataset.create({ data: nouveauDataset }),
  prisma.organisation.update({
    where: { id: orgId },
    data: { datasetCount: { increment: 1 } },   // un compteur ajouté à Organisation
  }),
]);
```

<v-click>

<div class="pt-6">

Si la seconde échoue, la première est **annulée**. Sans transaction, vous auriez un modèle créé et un compteur faux&nbsp;: une incohérence silencieuse, qui ne se verra que des semaines plus tard.

</div>

</v-click>

---
layout: section
---

# TP

<div class="op-75 pt-2"><code>tp03/README.md</code>, étapes 1 à 7</div>

<div class="pt-8 text-sm inline-block text-left">

1. `cp .env.example .env`, `npm install`, et constater dans `tp02`&nbsp;: tout a disparu
2. Écrire le modèle `Model` dans `schema.prisma`
3. Première migration&nbsp;: `npx prisma migrate dev`
4. Brancher `ModelsService` sur Prisma&nbsp;: les tests d’hier doivent repasser au vert
5. Ajouter `Organisation` et la relation, **sans changer la forme de l’API**
6. Adapter le seed&nbsp;: les organisations d’abord, les modèles ensuite
7. Repérer le N+1 dans votre code, et le corriger

</div>

<div class="pt-8 text-sm op-75">
🖐 Bloqué&nbsp;? Levez la main.
</div>

---

# Correction&nbsp;: combien de queries&nbsp;?

<div class="pt-4">

Activez les logs, appelez `GET /models`, et comptez&nbsp;:

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

`include` fait le join. C’est ce qu’on veut.

</div>
</div>

<v-click>

<div class="pt-8">

**Le réflexe à garder&nbsp;:** devant une lenteur, la première question n’est jamais « quel index ajouter&nbsp;? » mais **« combien de queries ma page envoie-t-elle&nbsp;? »**

</div>

</v-click>

---
layout: center
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
