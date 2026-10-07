---
theme: seriph
favicon: ./favicon-mse.png
layout: center
title: "Séance 6 : L’audit d’une vraie API"
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

<CourseCover :sprint="2" :seance="6" />

# L’audit

## Une vraie API, un regard critique

<div class="pt-4 op-75">Séance 6&nbsp;: Sprint 2, Sécurité & UI</div>

<div class="pt-10 text-sm op-75">
📱 <b>gaetanmaisse.github.io/ismin-web-2026-tps</b>
</div>

---

# La mission

<div class="pt-2 text-lg">

<v-clicks>

- Cette application est **complète.** Auth, organisations, models, 25 tests verts. C’est le corrigé du TP4.
- **MAIS** elle n’est pas prête pour la production.
- Vous la recevez en **héritage**, comme un développeur qui arrive sur un projet. Vous la lisez, vous trouvez ce qu’il faut améliorer, vous le classez.
- **L'utilisation de l'IA**, pour lire et pour lister. Choisir, classer et répondre aux questions, c’est vous.
- **En binôme**, sur le thème de votre choix. **Quatre slides**, cinq à dix minutes.

</v-clicks>

</div>

---

# Six thèmes, à choisir en binôme

| Thème                              | Par où commencer                                                                   |
|------------------------------------|------------------------------------------------------------------------------------|
| **Sécurité de l’authentification** | `src/auth/`, `src/users.ts`, `.env.example`                                        |
| **Intégrité des données**          | `models.service.ts`, `schema.prisma`                                               |
| **Contrat d’API et documentation** | les controllers, le README, la réponse de chaque route, la collection Bruno du TP2 |
| **Validation des entrées**         | les `dto/`, `model.ts`                                                             |
| **Configuration et démarrage**     | `.env.example`, `main.ts`, les scripts npm, le seed, le `Dockerfile`               |
| **Qualité et tests**               | `test/`, `vitest.config.ts`, ce que les tests ne couvrent pas                      |

<div class="pt-3 text-sm op-75">
Deux binômes peuvent prendre le même thème, pas le même sujet&nbsp;: dites-moi ce que vous creusez.
</div>

---

# Quatre slides, le même gabarit pour tous

<div class="grid grid-cols-2 gap-6 pt-2">
<div>

### 1 · Le problème

Une faille ou un manque. Votre thème en titre, **le fichier et la ligne**, et le scénario&nbsp;: «&nbsp;si quelqu’un fait X, alors Y&nbsp;». **Une seule.** Le code, dans VS Code.

### 2 · La solution

Le code, ou son principe. L’effort&nbsp;: petit, moyen, grand. **Le test** qui prouverait que c’est réglé.

</div>
<div>

### 3 · Le backlog

Trois à cinq lignes, classées&nbsp;: problème, impact, effort.

### 4 · L’IA, écartée

**Ce que l’IA a proposé et que vous n’avez pas retenu**, et pourquoi. Citez sa proposition.

</div>
</div>

<div class="pt-4 text-sm op-75">
Le PDF par mail à 14h45. Présentation après la pause, cinq à dix minutes.
</div>

---
layout: center
---

<img src="/medias/s06-exit.jpg" class="h-96 mx-auto rounded" />

---

# La séance

<div class="grid grid-cols-2 gap-8 pt-2">
<div>

| Heure | Quoi |
|---|---|
| 13:15 | Les six thèmes, les binômes choisissent |
| 13:25 | Recherche, 1 h 20 |
| 14:45 | Pause |
| 15:00 | Présentations, cinq à dix minutes par binôme |

</div>
<div>

```sh
git pull --no-edit upstream main
cd tp05
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm test
```

<div class="pt-2 text-sm op-75">
Cinq à dix minutes chacun, questions comprises.
Ce que vous ne savez pas expliquer sans IA n'est pas dans vos slides.
</div>

</div>
</div>

---
layout: center
class: text-center
---

# Le récap

## Six thèmes, un seul gabarit

<div class="pt-6 op-75">
Vos présentations, vérifiées dans le code et remises au même format.<br/>
Chaque constat renvoie au fichier et à la ligne du TP5.
</div>

<div class="pt-8 text-sm op-60">
✅ vérifié dans le code&nbsp;&nbsp;·&nbsp;&nbsp;⚠️ rectifié&nbsp;&nbsp;·&nbsp;&nbsp;☑️ corrigé depuis dans le dépôt
</div>

---

# L’audit en un tableau

<div class="text-sm pt-2">

| Thème | L’amélioration prioritaire | Effort |
|---|---|---|
| **Sécurité de l’authentification** | Aucune limite d’essais au login | petit |
| **Intégrité des données** | Deux écritures sans transaction | petit |
| **Contrat d’API** | Une doc manuscrite fausse, remplacée par une doc générée | petit |
| **Validation des entrées** | `name` sans longueur maximale | petit |
| **Configuration et démarrage** | Le seed écrase les données, l’image embarque `.env` | petit, moyen |
| **Qualité et tests** | Un test désactivé sur un soupçon d’instabilité | petit |

</div>

<div class="pt-4 text-sm op-75">
Pour chaque thème&nbsp;: le problème, la solution avec son test, le backlog et ce que l’IA a proposé à tort. Ce qu’aucun binôme n’a présenté est à la fin.
</div>

---

# Authentification&nbsp;· Le problème

<div class="font-mono text-sm op-75 -mt-2 mb-4">src/auth/auth.controller.ts · lignes 18 à 28 · POST /auth/login</div>

<div class="grid grid-cols-5 gap-6">
<div class="col-span-3">

```ts
@Post('login')
@HttpCode(200)
async login(@Body() dto: LoginDto) {
  const user = findUser(dto.username);
  if (!user || !verifyPassword(dto.password, user.passwordHash)) {
    throw new UnauthorizedException('Wrong username or password');
  }
  // … le token est signé et renvoyé
}
```

</div>
<div class="col-span-2 text-sm">

Rien ne compte les échecs&nbsp;: ni par compte, ni par adresse IP. Aucun délai, aucun verrouillage.

**Si** un script envoie cinquante requêtes par seconde avec `alice` et une liste de mots de passe courants, **alors** rien ne l’arrête&nbsp;: les logs ne montrent qu’une suite de 401.

</div>
</div>

<div class="mt-4 p-3 bg-orange-500 bg-opacity-10 rounded text-sm">
⚠️ La présentation citait <code>routes/auth.js</code> et un second facteur&nbsp;: ni l’un ni l’autre n’existe dans ModelZoo, l’IA a décrit une autre application. Le constat, lui, est juste. Et <code>RATE_LIMIT_LOGIN=5</code>, dans <code>.env.example</code>, n’est lu par personne.
</div>

---

# Authentification&nbsp;· La solution

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```ts
// app.module.ts : une limite par adresse IP, sur toute l’API
imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]), /* … */],
providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],

// auth.controller.ts : bien plus serrée sur le login
@Throttle({ default: { ttl: 60_000, limit: 5 } })
@Post('login')
```

<div class="text-sm pt-2">

- **Par adresse IP**&nbsp;: `@nestjs/throttler`, ci-dessus.
- **Par compte**&nbsp;: cinq échecs en quinze minutes verrouillent le compte, quelle que soit l’IP. Un compteur par `username`.
- **Une réponse uniforme**&nbsp;: même message pour un mauvais identifiant et un mauvais mot de passe. C’est déjà le cas&nbsp;: à vérifier, pas à « corriger ».

</div>
</div>
<div class="col-span-2 text-sm">

<div class="p-4 bg-blue-500 bg-opacity-10 rounded">

**Effort**

<div class="text-2xl font-bold">petit</div>

pour l’IP, moyen pour le compte

</div>

<div class="p-4 mt-4 border border-gray-500 border-opacity-30 rounded">

**Le test qui prouve que c’est réglé**

Cinq mauvais mots de passe&nbsp;: 401. Le sixième&nbsp;: 429. Le septième, avec le **bon** mot de passe&nbsp;: 429 aussi.

</div>
</div>
</div>

---

# Authentification&nbsp;· Le backlog et l’IA écartée

<div class="text-sm">

| Problème | Où | Impact | Effort |
|---|---|---|---|
| Le token affiché par un `console.log` | `src/auth/auth.guard.ts:31` | élevé&nbsp;: tout lecteur des logs rejoue la session | petit |
| Un token ne se révoque pas | `JwtModule`, `expiresIn: '1h'` | moyen&nbsp;: un token volé vaut une heure | grand |
| ~~Le second facteur n’est pas compté~~ | | n’existe pas dans ModelZoo | |

</div>

<div class="mt-4 p-4 bg-blue-500 bg-opacity-10 rounded text-sm">

**L’IA a proposé**&nbsp;: <i>« Bloquez l’adresse IP pendant 24 h après 5 tentatives échouées, et ajoutez un CAPTCHA sur le formulaire de connexion. »</i>

**Écarté, parce que**&nbsp;: toute une entreprise sort derrière une seule IP, cinq erreurs d’un collègue mettent tout le monde dehors pour la journée. Et le CAPTCHA ne gêne pas une attaque sur l’API, qui ne passe jamais par le formulaire. L’axe IP est gardé, en fenêtre courte et en limitation de débit, pas en bannissement.

</div>

---

# Intégrité des données&nbsp;· Le problème

<div class="font-mono text-sm op-75 -mt-2 mb-4">src/models/models.service.ts · lignes 64 à 75 · createWithOrganisation()</div>

<div class="grid grid-cols-5 gap-6">
<div class="col-span-3">

```ts {6-12}
async createWithOrganisation(
  organisation: { slug: string; name: string; country?: string },
  model: Omit<Model, 'downloads' | 'org'>,
  createdBy?: string,
): Promise<Model> {
  const org = await this.prisma.organisation.create({
    data: organisation,
  });
  const row = await this.prisma.model.create({
    data: { ...model, createdBy, orgId: org.id },
    include: { org: true },
  });
  return this.toModel(row);
}
```

</div>
<div class="col-span-2 text-sm">

Deux écritures, deux requêtes indépendantes.

**Si** la création du model échoue, un identifiant déjà pris par exemple, **alors** l’organisation, elle, est déjà en base. Un second essai échoue à son tour&nbsp;: le slug est pris.

Comme un paiement débité dont la commande n’est jamais expédiée.

</div>
</div>

<div class="mt-4 p-3 bg-green-500 bg-opacity-10 rounded text-sm">
✅ Vérifié. À savoir&nbsp;: la méthode n’est appelée nulle part. Du code mort avec un bug latent se finit ou se supprime, il ne reste pas en l’état.
</div>

---

# Intégrité des données&nbsp;· La solution

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```ts {2-4}
async createWithOrganisation(organisation, model, createdBy?) {
  return this.prisma.$transaction(async (tx) => {
    const org = await tx.organisation.create({ data: organisation });
    const row = await tx.model.create({
      data: { ...model, createdBy, orgId: org.id },
      include: { org: true },
    });
    return this.toModel(row);
  });
}
```

<div class="text-sm pt-2">

Dans la transaction, on écrit avec `tx`, jamais avec `this.prisma`. Tout réussit, et la base valide&nbsp;: **commit**. Une écriture échoue, et la base annule tout&nbsp;: **rollback**.

</div>
</div>
<div class="col-span-2 text-sm">

<div class="p-4 bg-blue-500 bg-opacity-10 rounded">

**Effort**

<div class="text-2xl font-bold">petit</div>

</div>

<div class="p-4 mt-4 border border-gray-500 border-opacity-30 rounded">

**Le test qui prouve que c’est réglé**

Appeler la méthode avec l’identifiant d’un model qui existe déjà&nbsp;: elle échoue, et l’organisation n’existe **pas** en base après l’appel.

</div>
</div>
</div>

---

# Intégrité des données&nbsp;· Le backlog et l’IA écartée

<div class="text-sm">

| Problème | Où | Impact | Effort |
|---|---|---|---|
| `create` vérifie puis insère&nbsp;: deux requêtes simultanées passent la vérification | `models.service.ts:48-61` | moyen&nbsp;: la seconde reçoit une 500 au lieu d’une 409 | petit&nbsp;: attraper l’erreur Prisma `P2002` |
| `deletedAt` migré, que personne ne lit ni n’écrit | `prisma/schema.prisma:35` | moyen&nbsp;: le schéma promet une corbeille qui n’existe pas | moyen&nbsp;: finir, ou retirer la colonne |
| Aucun `onDelete` sur la relation | `prisma/schema.prisma:37` | faible&nbsp;: la base refuse la suppression (`P2003`), l’API répond 500. ⚠️ Pas de models orphelins, contrairement à la présentation | petit&nbsp;: choisir, puis répondre 409 |

</div>

<div class="mt-4 p-4 bg-blue-500 bg-opacity-10 rounded text-sm">

**L’IA a proposé**&nbsp;: mettre la deuxième écriture dans un `try/catch`, et supprimer à la main l’organisation dans le `catch`.

**Écarté, parce que**&nbsp;: si le processus meurt entre les deux écritures, ou pendant le `delete`, le nettoyage ne s’exécute jamais. Seule la base garantit le tout ou rien.

</div>

---

# Contrat d’API&nbsp;· Le problème

<div class="font-mono text-sm op-75 -mt-2 mb-4">docs/api.md · « Mis à jour le 9 septembre »</div>

<div class="grid grid-cols-2 gap-6 text-sm">
<div class="p-4 border border-gray-500 border-opacity-30 rounded">

**Ce que dit la doc**

- « Pas d’authentification, l’API est interne. »
- `POST /models` avec `{ id, name, org, task, parameters, downloads, license? }`
- « `org` est un texte libre, par exemple `"MistralAI"`. »

</div>
<div class="p-4 border border-gray-500 border-opacity-30 rounded">

**Ce que répond l’API**

- Sans token&nbsp;: **401**
- Avec un token, et `downloads`&nbsp;: **400**, `property downloads should not exist`
- Sans `downloads`, avec `"MistralAI"`&nbsp;: **422**, organisation inconnue

</div>
</div>

<div class="pt-4">

**Si** un développeur suit la doc à la lettre, **alors** il ne peut pas créer un seul model&nbsp;: trois erreurs d’affilée.

</div>

<div class="mt-4 p-3 bg-orange-500 bg-opacity-10 rounded text-sm">
⚠️ Complété&nbsp;: la présentation laissait les deux exemples en blanc. Les voici, tirés de <code>docs/api.md</code> et de l’API.
</div>

---

# Contrat d’API&nbsp;· La solution

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```ts
// src/main.ts : /docs, et le document OpenAPI sur /docs-json
const config = new DocumentBuilder()
  .setTitle('Model catalogue API')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

```ts
// Chaque champ du DTO se décrit lui-même
@ApiPropertyOptional({ enum: TASKS, enumName: 'Task' })
@IsOptional()
@IsIn(TASKS)
task?: Task;
```

<div class="text-sm pt-2">

Une seule source de vérité&nbsp;: le code qui valide est celui qui documente. Et `docs/api.md` se supprime&nbsp;: une doc fausse est pire qu’aucune doc.

</div>
</div>
<div class="col-span-2 text-sm">

<div class="p-4 bg-blue-500 bg-opacity-10 rounded">

**Effort**

<div class="text-2xl font-bold">petit</div>

</div>

<div class="p-4 mt-4 border border-gray-500 border-opacity-30 rounded">

**Le test qui prouve que c’est réglé**

Ouvrir `/docs`, «&nbsp;Authorize&nbsp;» avec un token, puis «&nbsp;Try it out&nbsp;» sur `POST /models` avec l’exemple proposé&nbsp;: 201.

</div>

<div class="pt-3 text-xs op-75">
☑️ Fait dans le dépôt depuis la séance. C’est le contrat dont le front a besoin dès aujourd’hui.
</div>
</div>
</div>

---

# Contrat d’API&nbsp;· Le backlog et l’IA écartée

<div class="text-sm">

| Problème | Où | Impact | Effort |
|---|---|---|---|
| La pagination est écrite et validée, mais ignorée | `models.service.ts:77`, le paramètre `_pagination` | élevé à cent mille models | petit&nbsp;: `skip` et `take` |
| Le tri par défaut, par téléchargements décroissants, n’est écrit nulle part | `models.service.ts:84` | moyen&nbsp;: l’ordre fait partie du contrat | petit |
| ~~Le token requis et les champs optionnels du `PATCH` mal décrits~~ | `@ApiBearerAuth()`, `@ApiPropertyOptional()` | ☑️ corrigé depuis | |

</div>

<div class="mt-4 p-4 bg-blue-500 bg-opacity-10 rounded text-sm">

**L’IA a proposé**&nbsp;: le plugin CLI de `@nestjs/swagger`, qui déduit la doc des types, et un exemple et une description sur chaque propriété.

**Écarté, parce que**&nbsp;: avec trois DTO, un plugin de compilation coûte plus qu’il ne rapporte, et un `@ApiProperty()` nu suffit à publier le contrat. Un choix défendable aujourd’hui, à revoir quand les DTO se multiplieront.

</div>

---

# Validation des entrées&nbsp;· Le problème

<div class="font-mono text-sm op-75 -mt-2 mb-4">src/models/dto/create-model.dto.ts · lignes 27 à 29</div>

<div class="grid grid-cols-5 gap-6">
<div class="col-span-3">

```ts
@IsString()
@IsNotEmpty()
name!: string;
```

<div class="pt-4 text-sm">

Une API reçoit des données de l’extérieur&nbsp;: elle ne les accepte jamais sans contrôle. Les types TypeScript disparaissent à la compilation&nbsp;; seuls les décorateurs de `class-validator` protègent le service à l’exécution.

</div>
</div>
<div class="col-span-2 text-sm">

`name` est non vide, mais il n’a aucune limite de longueur.

**Si** un client envoie un `name` d’un mégaoctet, **alors** l’API l’accepte, le stocke, et le renvoie à chaque `GET /models`.

</div>
</div>

<div class="mt-4 p-3 bg-green-500 bg-opacity-10 rounded text-sm">
✅ Vérifié. Même trou sur <code>parameters</code>&nbsp;: le <code>@Max</code> est en commentaire, ligne 40.
</div>

---

# Validation des entrées&nbsp;· La solution

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```ts {3}
@IsString()
@IsNotEmpty()
@MaxLength(100)
name!: string;
```

<div class="text-sm pt-4">

Cent caractères est une règle métier, à discuter. Ce qui compte, c’est qu’il y ait une limite, et qu’elle soit écrite.

</div>
</div>
<div class="col-span-2 text-sm">

<div class="p-4 bg-blue-500 bg-opacity-10 rounded">

**Effort**

<div class="text-2xl font-bold">petit</div>

</div>

<div class="p-4 mt-4 border border-gray-500 border-opacity-30 rounded">

**Le test qui prouve que c’est réglé**

`name: 'A'.repeat(101)`&nbsp;: 400. Et `'A'.repeat(100)`&nbsp;: 201. Une borne se teste des deux côtés.

</div>
</div>
</div>

---

# Validation des entrées&nbsp;· Le backlog et l’IA écartée

<div class="grid grid-cols-2 gap-6">
<div class="text-sm">

| Problème | Impact | Effort |
|---|---|---|
| `parameters` sans maximum | moyen | petit |
| `org` : non vide, pas un slug | faible, la 422 suit | petit&nbsp;: `@IsSlug()` existe dans `src/common/` |
| `license` : texte libre | faible | petit |
| ~~`NaN` et `Infinity` acceptés~~ | refusés par `@IsNumber()`, par défaut | |

<div class="pt-2 text-xs op-75">
Toutes les pistes ne sont pas des bugs&nbsp;: certaines sont des décisions métier à prendre, puis à écrire.
</div>

</div>
<div class="text-sm">

<div class="p-4 bg-blue-500 bg-opacity-10 rounded">

**L’IA a proposé**&nbsp;: une longueur maximale unique, appliquée à toutes les chaînes.

**Écarté, parce que**&nbsp;: `username`, `name`, `country` et `password` n’ont pas les mêmes contraintes. On compose les décorateurs, et on choisit la limite champ par champ&nbsp;:

```ts
const IsShortString = (max: number) =>
  applyDecorators(
    IsString(), IsNotEmpty(), MaxLength(max),
  );
```

</div>

<div class="pt-2 text-xs op-60">
⚠️ La présentation appelait <code>IsString()</code> dans le corps d’une fonction&nbsp;: un décorateur qu’on n’applique pas ne fait rien. <code>applyDecorators</code>, de <code>@nestjs/common</code>, les combine.
</div>

</div>
</div>

---

# Configuration&nbsp;· Le problème, le seed

<div class="font-mono text-sm op-75 -mt-2 mb-4">prisma/seed.ts · lignes 4, 37 et 49</div>

<div class="grid grid-cols-5 gap-6">
<div class="col-span-3">

```ts {1,6,10}
 * Running it twice changes nothing.
// …
await prisma.organisation.upsert({
  where: { slug: organisation.slug },
  create: organisation,
  update: { name: organisation.name, country: organisation.country },
});
// …
await prisma.model.upsert({
  where: { id: model.id }, create: data, update: data,
});
```

</div>
<div class="col-span-2 text-sm">

**Si** quelqu’un corrige un model avec `PATCH /models/:id`, puis qu’un autre relance `npm run db:seed` (un redéploiement, un nouveau développeur qui suit le README), **alors** la correction est remplacée par `data/models.json`.

Aucune erreur, aucun message&nbsp;: la perte est silencieuse.

</div>
</div>

<div class="mt-4 p-3 bg-green-500 bg-opacity-10 rounded text-sm">
✅ Vérifié. Le piège&nbsp;: le commentaire de la ligne 4 promet l’inverse, et le prochain développeur le croit.
</div>

---

# Configuration&nbsp;· La solution, le seed

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```ts
// Crée ce qui manque, ne touche jamais à ce qui existe
await prisma.model.upsert({
  where: { id: model.id },
  create: data,
  update: {},
});
```

<div class="text-sm pt-2">

- Même chose pour les organisations, ligne 37.
- Le commentaire de la ligne 4 dit enfin ce que fait le script.
- Revenir aux données d’origine reste possible, mais explicitement&nbsp;: c’est le rôle de `npm run db:reset`.

</div>
</div>
<div class="col-span-2 text-sm">

<div class="p-4 bg-blue-500 bg-opacity-10 rounded">

**Effort**

<div class="text-2xl font-bold">petit</div>

deux lignes et un commentaire

</div>

<div class="p-4 mt-4 border border-gray-500 border-opacity-30 rounded">

**Le test qui prouve que c’est réglé**

Lancer le seed, modifier les `downloads` d’un model, relancer le seed&nbsp;: la modification est toujours là.

</div>
</div>
</div>

---

# Configuration&nbsp;· Le Dockerfile

<div class="grid grid-cols-2 gap-6 pt-2">
<div>

```dockerfile
FROM node:26-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 8080
CMD ["npm", "run", "start:dev"]
```

<div class="text-sm pt-2">

**Si** je récupère l’image, **alors** un `cat .env` me donne `JWT_SECRET`, le secret qui signe les tokens&nbsp;: je fabrique un token admin.

</div>
</div>
<div class="text-sm">

| Ligne | Le défaut | La correction |
|---|---|---|
| `COPY . .` | embarque `.env` et le `node_modules` de votre machine | un `.dockerignore` |
| `EXPOSE 8080` | l’API écoute sur `PORT`, 3000 par défaut | le même port partout |
| `start:dev` | le mode développement, avec surveillance des fichiers | `node dist/main.js` |
| une seule étape | les outils de build restent dans l’image | un build en plusieurs étapes |

<div class="pt-2 text-xs op-60">
⚠️ L’exemple en plusieurs étapes présenté ne copiait pas <code>node_modules</code> dans l’étape finale&nbsp;: <code>node dist/main.js</code> plante au démarrage. On l’écrit ensemble en séance 12.
</div>

</div>
</div>

---

# Configuration&nbsp;· Le backlog et l’IA écartée

<div class="text-sm">

| Problème | Où | Impact | Effort |
|---|---|---|---|
| Une valeur par défaut silencieuse pour la base | `prisma.config.ts:12`, `seed.ts:13` | moyen&nbsp;: migrate et seed peuvent viser une autre base que l’API | petit |
| `GET /health` écrit, déclaré dans aucun module | `app.module.ts:8` | moyen&nbsp;: un hébergeur croira l’API morte | petit |

</div>

<div class="mt-4 p-4 bg-blue-500 bg-opacity-10 rounded text-sm">

**L’IA a proposé**&nbsp;: <i>« Si <code>JWT_SECRET</code> ou <code>DATABASE_URL</code> manque, l’application démarre quand même et plante plus tard. »</i>

**Écarté, parce que c’est faux**&nbsp;: `auth.module.ts:7` et `prisma.service.ts:19` refusent de démarrer. Et à <i>« la CI est probablement toujours rouge »</i>&nbsp;: non vérifié, donc non présenté. On ne présente pas ce qu’on ne sait pas prouver.

</div>

---

# Qualité et tests&nbsp;· Le problème

<div class="font-mono text-sm op-75 -mt-2 mb-4">test/organisations.e2e-spec.ts · lignes 75 à 82</div>

<div class="grid grid-cols-7 gap-6">
<div class="col-span-5">

```ts {1-2}
// flaky?
it.skip('refuses a country that is not a two-letter code', async () => {
  await request(app.getHttpServer())
    .post('/organisations')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ slug: 'mistralai', name: 'Mistral AI', country: 'FRA' })
    .expect(400);
});
```

</div>
<div class="col-span-2 text-sm">

Un test soupçonné d’être instable, et désactivé plutôt que regardé.

**Si** quelqu’un casse la validation du pays, **alors** aucun test ne le dit&nbsp;: le seul qui la vérifie ne tourne plus.

</div>
</div>

<div class="mt-4 p-3 bg-orange-500 bg-opacity-10 rounded text-sm">
⚠️ La présentation parlait de tests instables sans les situer («&nbsp;tous les fichiers de test&nbsp;»). L’isolation existe déjà&nbsp;: <code>beforeEach</code> vide la base avant chaque test, et <code>fileParallelism: false</code> fait passer les fichiers un par un. Le seul test marqué instable est celui-ci.
</div>

---

# Qualité et tests&nbsp;· La solution

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```ts
// Retirer le .skip et le commentaire : le test passe
it('refuses a country that is not a two-letter code', async () => {
```

```ts
// test/global-setup.ts : chaque exécution repart d’une base vide
rmSync('test.db', { force: true });
execSync('npx prisma migrate deploy', { /* … */ });
```

<div class="text-sm pt-2">

Un test «&nbsp;flaky&nbsp;» se prouve&nbsp;: on le fait tourner, beaucoup, et on regarde. S’il échoue une fois, on cherche la cause, on ne le désactive pas.

</div>
</div>
<div class="col-span-2 text-sm">

<div class="p-4 bg-blue-500 bg-opacity-10 rounded">

**Effort**

<div class="text-2xl font-bold">petit</div>

</div>

<div class="p-4 mt-4 border border-gray-500 border-opacity-30 rounded">

**Le test qui prouve que c’est réglé**

`for i in $(seq 10); do npm test || break; done`&nbsp;: dix fois vert.

</div>

<div class="pt-3 text-xs op-75">
☑️ La base remise à zéro à chaque exécution&nbsp;: fait dans le dépôt depuis la séance. Le <code>.skip</code>, lui, est toujours là.
</div>
</div>
</div>

---

# Qualité et tests&nbsp;· Le backlog et l’IA écartée

<div class="text-sm">

| Problème | Où | Impact | Effort |
|---|---|---|---|
| Le login recopié dans chaque fichier de test | `test/*.e2e-spec.ts` | faible&nbsp;: à changer en trois endroits | petit&nbsp;: une fonction `login()` partagée |

</div>

<div class="mt-4 p-4 bg-blue-500 bg-opacity-10 rounded text-sm">

**L’IA a proposé**&nbsp;: <i>« Ignore la base de données réelle et mocke toutes les réponses Prisma avec <code>jest.spyOn()</code>. »</i>

**Écarté, parce que**&nbsp;: des tests de bout en bout simulés ne vérifient plus l’intégration. Si le schéma Prisma change, le test continue de passer, à tort. Et le projet utilise Vitest, pas Jest&nbsp;: l’IA n’avait pas lu `package.json`.

</div>

---

# Ce que l’audit contenait aussi

<div class="text-xs pt-2">

| Thème | Le constat | Où | Priorité |
|---|---|---|---|
| Configuration | CORS en commentaire&nbsp;: le front de la séance 7 sera bloqué par le navigateur | `src/main.ts:25` | **grave, aujourd’hui** |
| Sécurité | Des mots de passe en clair dans Git, jamais lus | `data/users.json` | grave |
| Sécurité | Le secret de `.env.example` est le même pour tout le monde | `.env.example` | grave |
| Qualité | Une CI que GitHub ne verra jamais&nbsp;: les workflows se lisent à la racine du dépôt | `tp05/.github/workflows/ci.yml` | moyen |
| Qualité | Un test jamais exécuté, le motif est `*.e2e-spec.ts` | `test/models.service.spec.ts` | moyen |
| Validation | `country: "ZZ"` passe&nbsp;: deux lettres, pas un code ISO | `create-organisation.dto.ts:14` | moyen |
| Configuration | Le seed annonce 18 models pour 17 insérés | `prisma/seed.ts:54` | moyen |

</div>

---

# Ce que l’audit nous apprend

<div class="grid grid-cols-2 gap-6 pt-4 text-sm">

<div class="p-4 border border-gray-500 border-opacity-30 rounded">

**1. Vérifier dans le code, puis au `curl`**

Une présentation citait un fichier qui n’existe pas&nbsp;: l’IA décrivait une autre application. L’IA a aussi affirmé que l’API démarre sans secret&nbsp;: un binôme a vérifié, le code le refuse.

</div>

<div class="p-4 border border-gray-500 border-opacity-30 rounded">

**2. Un code qui ment est pire qu’un code absent**

Un commentaire de seed, un `RATE_LIMIT_LOGIN` que personne ne lit, une doc datée, un test désactivé sans preuve.

</div>

<div class="p-4 border border-gray-500 border-opacity-30 rounded">

**3. Toutes les pistes ne sont pas des bugs**

Cent caractères pour un nom, un maximum de paramètres&nbsp;: ce sont des décisions métier. On les prend, et on les écrit.

</div>

<div class="p-4 border border-gray-500 border-opacity-30 rounded">

**4. Un correctif sans test n’est qu’une promesse**

Chaque solution de ce récap a son test. Pas de test, pas de preuve que c’est réglé.

</div>

</div>

---
layout: center
---

# Lundi

## Séance 7&nbsp;: React

<div class="pt-6 op-75">
Trois séances côté serveur. Lundi, l’API que vous venez d’auditer a un visage.
</div>

<div class="pt-10 text-sm op-60">
Slides&nbsp;: gaetanmaisse.github.io/ismin-web-2026-tps
</div>
