---
theme: seriph
favicon: ./favicon-mse.png
layout: center
title: "Séance 8 : le routage"
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

<CourseCover :sprint="3" :seance="8" />

# Le routage

## Une application à plusieurs pages

<div class="pt-4 op-75">Séance 8&nbsp;: Sprint 3, Fusion & QA</div>

<div class="pt-10 text-sm op-75">
📱 <b>gaetanmaisse.github.io/ismin-web-2026-tps</b>
</div>

---

# Le but de la journée

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

<BrowserFrame flush url="localhost:5173/models/mistral-7b-instruct-v0-3">
<img src="/medias/s08-detail.png" alt="La page d’un modèle" class="block w-full" />
</BrowserFrame>

</div>
<div class="col-span-2 text-sm">

**ModelZoo, à plusieurs pages.** Chaque modèle a la sienne, avec son adresse. On peut la partager, la recharger, revenir en arrière.

<div class="pt-4">

À la fin, vous aurez écrit&nbsp;:

- les **routes**&nbsp;: le catalogue, la page d’un modèle, la page 404&nbsp;;
- des **liens** qui changent de page sans recharger l’application&nbsp;;
- la **page d’un modèle**, qui lit son identifiant dans l’adresse et le demande à l’API.

</div>

<div class="pt-4 op-75">
Toujours pas une ligne de CSS&nbsp;: il est fourni.
</div>
</div>
</div>

---

# Le point de départ&nbsp;: TanStack Query

<div class="grid grid-cols-2 gap-8 pt-2">
<div>

Le TP8 part du **corrigé du TP7, étapes 10 et 11**&nbsp;: le catalogue avec `useQuery`, déjà écrit, dans `pages/CatalogPage.tsx`.

```tsx
const { data, error, isPending, isError } =
  useQuery({
    queryKey: ['models', task],
    queryFn: () => fetchModels(task),
  });
```

<div class="pt-2 text-sm op-75">
<code>tp08/</code> est un nouveau dossier, qui part du corrigé&nbsp;: votre <code>tp07/</code> ne bouge pas, et vous n’avez rien à recopier.
</div>

</div>
<div class="text-sm">

Vous vous êtes arrêtés à l’étape 9&nbsp;? Rien de perdu&nbsp;: c’est exactement votre `useEffect`, en plus court.

| Votre version | Avec `useQuery` |
|---|---|
| `status === 'loading'` | `isPending` |
| `status === 'error'` | `isError`, et `error` |
| l’état `models` | `data` |
| le tableau de dépendances | la clé, `queryKey` |

<div class="pt-4 op-75">
Aujourd’hui, chaque nouvelle page qui lit l’API le fait avec <code>useQuery</code>.
</div>
</div>
</div>

---
layout: section
---

# 1. Le routage côté client

---

# Une seule page, et pourtant des adresses

<div class="grid grid-cols-2 gap-8 pt-2">
<div>

Une SPA n’a qu’un `index.html`. Mais l’utilisateur, lui, attend que&nbsp;:

- le lien d’un modèle se **partage**&nbsp;;
- le bouton **retour** revienne à la page d’avant&nbsp;;
- **recharger** garde la page ouverte.

<div class="mt-6 p-4 bg-blue-500 bg-opacity-10 rounded">

**L’URL fait partie de l’état de l’application.** Le routeur lit l’adresse, et affiche la page qui lui correspond.

</div>
</div>
<div class="text-sm">

| L’adresse | La page |
|---|---|
| `/` | le catalogue |
| `/models/mistral-7b-instruct-v0-3` | un modèle |
| `/login` | la connexion, en séance 9 |
| `/models/new` | l’ajout, réservé aux connectés, en séance 9 |
| `/n-importe-quoi` | «&nbsp;Page introuvable&nbsp;» |

<div class="pt-4 op-75">
Recharger <code>/models/…</code>, c’est demander cette adresse au serveur, qui n’a aucun fichier à ce nom. En développement, Vite renvoie <code>index.html</code>, puis React Router lit l’adresse et affiche la bonne page. Avec Docker, le serveur devra faire pareil&nbsp;: séance 12.
</div>
</div>
</div>

---

# React Router

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```tsx
// main.tsx : une fois, autour de toute l’application
import { BrowserRouter } from 'react-router';

<BrowserRouter>
  <App />
</BrowserRouter>
```

```tsx
// App.tsx : une Route par adresse
import { Route, Routes } from 'react-router';

<Routes>
  <Route path="/" element={<CatalogPage />} />
  <Route path="/models/:id" element={<ModelPage />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

</div>
<div class="col-span-2 text-sm">

<v-clicks>

- `BrowserRouter` lit l’adresse dans la barre du navigateur, et la surveille.
- `Routes` choisit **la** `Route` qui correspond à l’adresse, et affiche son `element`. Les autres ne sont pas rendues.
- `path="*"`&nbsp;: toutes les autres adresses. C’est la page 404.

</v-clicks>

<v-click>

<div class="mt-4 p-3 bg-red-500 bg-opacity-10 rounded">

**Version 8&nbsp;: tout s’importe de `react-router`.** Le paquet `react-router-dom` n’existe plus. Les tutos, et votre assistant, le proposent encore.

</div>

</v-click>
</div>
</div>

---

# Les paramètres d’URL&nbsp;: `useParams`

<div class="grid grid-cols-2 gap-8 pt-2">
<div>

```tsx
<Route path="/models/:id" element={<ModelPage />} />
```

```tsx
const ModelPage = () => {
  const { id } = useParams();
  // /models/whisper-large-v3
  //   → id vaut 'whisper-large-v3'
  // …
};
```

</div>
<div class="text-sm">

`:id` est un **paramètre**&nbsp;: n’importe quel morceau d’adresse à cet endroit. `useParams` le rend au composant, sous le même nom.

<div class="pt-4">

Et `/models/new`&nbsp;? Les deux routes correspondent. **React Router préfère la plus précise**&nbsp;: un morceau écrit en toutes lettres passe avant un paramètre. L’ordre des `Route` ne compte pas.

</div>

<div class="pt-4 op-75">
Pour TypeScript, <code>id</code> est un <code>string | undefined</code>&nbsp;: rien ne garantit que le composant soit sous une route qui a un <code>:id</code>. Comment le lui dire&nbsp;: sur la slide «&nbsp;La page d’un modèle&nbsp;».
</div>
</div>
</div>

---

# `Link`, pas `<a>`

<div class="grid grid-cols-2 gap-6 pt-2">
<div>

```tsx
// ❌ le navigateur recharge tout
<a href="/models/whisper-large-v3">Whisper</a>
```

<div class="text-sm pt-2">

Le navigateur demande une nouvelle page au serveur. Tout le JavaScript repart de zéro&nbsp;: l’état, et le cache de TanStack Query.

</div>

</div>
<div>

```tsx
// ✅ React Router change l’adresse, et redessine
<Link to="/models/whisper-large-v3">Whisper</Link>
```

<div class="text-sm pt-2">

`Link` affiche un vrai `<a>`&nbsp;: clic droit, «&nbsp;ouvrir dans un nouvel onglet&nbsp;» fonctionne. Mais au clic, pas de rechargement&nbsp;: seule la page change.

</div>
</div>
</div>

<div class="grid grid-cols-2 gap-6 pt-4">
<div>

```tsx
// ✅ une adresse calculée : accolades et backquotes
<Link to={`/models/${model.id}`}>{model.name}</Link>

// ❌ entre guillemets, les accolades restent du texte
<Link to="/models/{model.id}">{model.name}</Link>
```

</div>
<div class="text-sm">

**Sans recharger, comment l’adresse change-t-elle&nbsp;?** React Router utilise l’API History du navigateur, `history.pushState`&nbsp;: l’adresse change, aucune requête ne part. Le bouton retour déclenche un événement, que React Router écoute.

<div class="pt-2 op-75">
Pour le voir&nbsp;: F12, l’onglet Réseau. Avec un <code>&lt;a&gt;</code>, chaque clic retélécharge toute l’application.
</div>
</div>
</div>

---

# La page d’un modèle, avec `useQuery`

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```tsx
const ModelPage = () => {
  const { id } = useParams() as { id: string };
  const { data: model, error, isPending, isError } = useQuery({
    queryKey: ['model', id],
    queryFn: () => fetchModel(id),
  });

  return (
    <section className="page">
      <Link className="back" to="/">← Retour au catalogue</Link>
      {isPending && <p role="status">Chargement…</p>}
      {isError && <p role="alert">
        {error instanceof ApiError && error.status === 404
          ? 'Modèle introuvable.'
          : `Impossible de charger le modèle : ${error.message}`}
      </p>}
      {model && <article className="detail">…</article>}
    </section>
  );
};
```

</div>
<div class="col-span-2 text-sm">

<v-clicks>

- **La clé contient l’`id`**&nbsp;: une entrée du cache par modèle.
- `as { id: string }`&nbsp;: une promesse faite au compilateur, comme `as Model[]` au TP7. La route garantit l’`id`, TypeScript ne le sait pas.
- **`fetchModel`** s’écrit comme `fetchModels`&nbsp;: `fetch`, `await throwIfNotOk(res)`, `res.json()`. C’est `throwIfNotOk`, fourni, qui lève l’`ApiError`, avec le code HTTP.
- Un 404 n’est pas une panne&nbsp;: l’utilisateur doit lire «&nbsp;Modèle introuvable.&nbsp;» Le lien retour reste là, dans les trois états.

</v-clicks>

</div>
</div>

---

# L’essentiel, sur une slide

<div class="grid grid-cols-3 gap-4 pt-2 text-sm">
<div class="p-4 border border-gray-500 border-opacity-30 rounded">

**Les routes**

- `BrowserRouter`, une fois, dans `main.tsx`
- `Routes`, une `Route` par adresse
- `path="*"`&nbsp;: la page 404
- tout s’importe de `react-router`

</div>
<div class="p-4 border border-gray-500 border-opacity-30 rounded">

**Les liens**

- `Link to`, jamais `<a href>`
- un `Link` affiche un vrai `<a>`, sans recharger
- l’URL fait partie de l’état&nbsp;: elle se partage, se recharge, revient en arrière

</div>
<div class="p-4 border border-gray-500 border-opacity-30 rounded">

**Une page qui lit l’API**

- `:id` dans le chemin, `useParams()` dans la page
- `useQuery`, l’`id` dans la clé
- un `404` est une réponse&nbsp;: «&nbsp;Modèle introuvable.&nbsp;»

</div>
</div>

<div class="pt-4 text-sm op-75">
Gardez cette slide ouverte pendant le TP&nbsp;: les slides sont sur <b>gaetanmaisse.github.io/ismin-web-2026-tps</b>
</div>

---
layout: section
---

# 2. Le TP8

<div class="op-75 pt-2"><code>tp08/README.md</code>, étapes 1 à 4</div>

---

# Démarrer, trois terminaux

<div class="grid grid-cols-3 gap-4 pt-2 text-sm">
<div>

**1 · L’API**

```sh
git pull --no-edit upstream main
cd tp08/api
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run start:dev
```

</div>
<div>

**2 · Le front**

```sh
cd tp08/web
cp .env.example .env
npm install
npm run dev
```

</div>
<div>

**3 · Les tests**

```sh
cd tp08/web
npm run test:watch
```

</div>
</div>

<div class="pt-4 text-sm op-75">
L’API du TP8, c’est celle du TP7, CORS compris&nbsp;: rien à y écrire. <code>react-router</code> est déjà dans le <code>package.json</code>&nbsp;: <code>npm install</code> suffit. Au départ, 14 tests verts et 14 rouges. Arrêtez d’abord l’API et le front du TP7&nbsp;: ce sont les mêmes ports.
</div>

---

# L’arbre de l’application

<div class="grid grid-cols-2 gap-8 pt-4">
<div class="text-sm">

**Fourni**, du TP7&nbsp;: le catalogue, ses composants, `fetchModels`.

**Fourni**, nouveau&nbsp;: l’en-tête, la maquette de la page d’un modèle et de la page 404, en JSX statique.

**À écrire**&nbsp;: tout ce qui relie les pages entre elles, et à l’API.

<div class="pt-4 op-75">
Une page est un composant comme les autres. On les range dans <code>pages/</code> pour les reconnaître.
</div>
</div>
<div>

```text
App                        ← étape 2
├── Header                 ← étape 3
└── Routes
    ├── /             CatalogPage   fourni
    ├── /models/:id   ModelPage     ← étape 4
    └── *             NotFoundPage  ← étape 2
```

</div>
</div>

---

# Le TP8, en quatre étapes

<div class="pt-4 text-sm">

1. **Démarrer**&nbsp;: l’API, le front, les tests. Le catalogue du TP7 s’affiche sur `localhost:5173`.
2. **Les routes**&nbsp;: `BrowserRouter` dans `main.tsx`, les `Routes` dans `App.tsx`, et `*` vers `NotFoundPage`.
3. **Des liens, pas des `<a>`**&nbsp;: dans `Header`, `NotFoundPage` et `ModelPage`, et sur le titre de chaque `ModelCard`, vers `/models/:id`.
4. **La page d’un modèle**&nbsp;: `fetchModel(id)` dans `api.ts`, puis `ModelPage` avec `useParams` et `useQuery`. Un 404 affiche «&nbsp;Modèle introuvable.&nbsp;»

</div>

<div class="pt-6 text-sm op-75">
C’est bon quand&nbsp;: on clique sur un modèle, sa page s’ouvre, le bouton retour ramène au catalogue sans le recharger. Fini&nbsp;? Les bonus du README&nbsp;: <code>NavLink</code>, le filtre dans l’adresse avec <code>useSearchParams</code>. 🖐 Bloqué&nbsp;? Levez la main.
</div>

---
layout: section
---

# 3. La correction

<div class="op-75 pt-2">Les routes, la page d’un modèle, et ce qui a coincé</div>

---

# Les routes, en entier

<div class="grid grid-cols-2 gap-6 pt-2">
<div>

```tsx
// main.tsx : le routeur, tout autour
<BrowserRouter>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
</BrowserRouter>
```

```tsx
// ModelCard.tsx : le nom devient un lien
<h2 className="card-title">
  <Link to={`/models/${model.id}`}>{model.name}</Link>
</h2>
```

</div>
<div>

```tsx
// App.tsx : l’en-tête, puis la page de l’URL
const App = () => {
  return (
    <main className="app">
      <Header />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/models/:id"
               element={<ModelPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  );
};
```

<div class="pt-2 text-sm">

Le routeur est dans `main.tsx`, pas dans `App`&nbsp;: les tests mettent `App` dans leur propre routeur, et un routeur dans un routeur plante.

</div>
</div>
</div>

---

# Les erreurs les plus vues

<div class="grid grid-cols-3 gap-4 pt-2 text-sm">
<div class="p-3 border border-gray-500 border-opacity-30 rounded">

**`react-router-dom`**

Proposé par les tutos et l’IA. En version 8, tout vient de `react-router`.

</div>
<div class="p-3 border border-gray-500 border-opacity-30 rounded">

**`useRoutes() may be used only in the context of a <Router> component`**

`BrowserRouter` oublié dans `main.tsx`.

</div>
<div class="p-3 border border-gray-500 border-opacity-30 rounded">

**`You cannot render a <Router> inside another <Router>`**

Un `BrowserRouter` dans `App.tsx`&nbsp;: les tests ont déjà le leur.

</div>
<div class="p-3 border border-gray-500 border-opacity-30 rounded">

**Un `<a href>` au lieu d’un `Link`**

Tout se recharge, et le catalogue repart de «&nbsp;Chargement…&nbsp;».

</div>
<div class="p-3 border border-gray-500 border-opacity-30 rounded">

**`queryKey: ['model']`, sans l’`id`**

Toutes les pages partagent la même case du cache&nbsp;: la page de Llama affiche Mistral.

</div>
<div class="p-3 border border-gray-500 border-opacity-30 rounded">

**`to="/models/{model.id}"`**

Entre guillemets, les accolades restent du texte. Des accolades, puis des backquotes&nbsp;: `` to={`/models/${model.id}`} ``.

</div>
</div>

---
layout: center
---

# Demain

## Séance 9&nbsp;: formulaires et connexion

<div class="pt-6 op-75">
Votre catalogue a plusieurs pages, et tout le monde peut tout lire.<br/>
Demain, on se connecte, et une page réservée aux connectés ajoute un modèle.
</div>

<div class="pt-10 text-sm op-60">
Le projet&nbsp;: le cadrage est à rendre le vendredi 9 octobre, dans le fil de votre sujet.
</div>
