---
theme: seriph
favicon: ./favicon-mse.png
layout: center
title: "Séance 10 : routage et connexion"
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

<CourseCover :sprint="4" :seance="10" />

# Routage et connexion

## Plusieurs pages, et une page réservée aux connectés

<div class="pt-4 op-75">Séance 10&nbsp;: Sprint 4, l’application complète</div>

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

Après la pause&nbsp;: **la connexion**, et une page réservée aux connectés.

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

La partie 3 vous a résisté&nbsp;? Rien de perdu&nbsp;: c’est exactement votre `useEffect`, en plus court.

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
| `/login` | la connexion, après la pause |
| `/models/new` | l’ajout, réservé aux connectés, après la pause |
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

# L’essentiel du routage

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

# Démarrer le TP8, trois terminaux

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

# L’arbre de l’application, TP8

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
C’est bon quand&nbsp;: on clique sur un modèle, sa page s’ouvre, le bouton retour ramène au catalogue sans le recharger. Fini&nbsp;? Les bonus du README&nbsp;: <code>NavLink</code>, le filtre dans l’adresse avec <code>useSearchParams</code>. 🖐 Bloqué&nbsp;? Levez la main.<br/>À la pause, le corrigé du TP8 et le sujet du TP9 sont publiés&nbsp;: <code>git pull</code>.
</div>

---
layout: section
---

# 3. La correction du TP8

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

# Les erreurs les plus vues du TP8

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

# La suite&nbsp;: une page réservée aux connectés

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

<BrowserFrame flush url="localhost:5173/models/new">
<img src="/medias/s09-new.png" alt="Le formulaire d’ajout, avec l’erreur 409 de l’API" class="block w-full" />
</BrowserFrame>

</div>
<div class="col-span-2 text-sm">

**Ajouter un modèle**, réservé aux utilisateurs connectés.

<div class="pt-4">

Pour y arriver&nbsp;:

- la **connexion**, et un token à garder&nbsp;;
- le token **partagé** avec toute l’application&nbsp;;
- une **page protégée**, qui renvoie vers la connexion&nbsp;;
- un **formulaire** que React contrôle&nbsp;;
- les **erreurs de l’API**, lisibles par un humain.

</div>
</div>
</div>

---
layout: section
---

# 4. La connexion

---

# Se connecter&nbsp;: `POST /auth/login`

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```ts
export async function login(
  username: string, password: string,
): Promise<string> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  await throwIfNotOk(res);          // 401 → ApiError
  const body = (await res.json()) as { access_token: string };
  return body.access_token;
}
```

</div>
<div class="col-span-2 text-sm">

Par défaut, `fetch` fait un `GET`. Pour un `POST`, trois choses&nbsp;:

<v-clicks>

- **`method`**&nbsp;: `'POST'`.
- **`Content-Type`**&nbsp;: sans lui, Nest ne lit pas le corps, et répond `400`.
- **`body`**&nbsp;: une chaîne. `JSON.stringify` transforme l’objet en texte JSON.

</v-clicks>

<div class="pt-4 op-75">
Les comptes de la base&nbsp;: <code>alice</code>, administratrice, et <code>bob</code>, simple utilisateur. Mot de passe <code>secret</code> pour les deux.
</div>
</div>
</div>

---

# Où ranger le token&nbsp;?

<div class="text-sm pt-2">

| Où | Au rechargement de la page | Le risque |
|---|---|---|
| **En mémoire**, un `useState` | perdu&nbsp;: il faut se reconnecter | le plus sûr, le moins pratique |
| **`localStorage`**, ou `sessionStorage` | gardé. `sessionStorage`&nbsp;: perdu à la fermeture de l’onglet | tout script de la page peut le lire. Une faille XSS, et le token part avec |
| **Un cookie `httpOnly`** | gardé, et envoyé tout seul par le navigateur | illisible par JavaScript. Mais il faut modifier l’API, et se protéger du CSRF |

</div>

<div class="mt-4 p-4 bg-blue-500 bg-opacity-10 rounded text-sm">

**Dans le TP&nbsp;: `localStorage`. C’est un choix, et on l’assume.** Le token ne vit qu’une heure. Et React échappe tout ce qu’il affiche entre accolades&nbsp;: un nom de modèle qui contient `<script>` s’affiche comme du texte, il ne s’exécute pas.

</div>

<div class="pt-3 text-sm op-75">
XSS, <i>cross-site scripting</i>&nbsp;: un script étranger qui s’exécute dans votre page. CSRF&nbsp;: un autre site qui envoie une requête à votre API avec vos cookies.
</div>

---

# Le payload n’est pas secret

<div class="grid grid-cols-2 gap-8 pt-2">
<div>

```text
eyJhbGciOi… . eyJzdWIiOiJ1MSIsInVz… . 3Kx9…
   en-tête           payload          signature
```

```ts
// auth/jwt.ts, fourni
decodePayload(token);
// → { sub: 'u1', username: 'alice',
//     role: 'admin', exp: 1790000000 }
```

<div class="pt-2 text-sm op-75">
Du base64url, le base64 des adresses (<code>-</code> et <code>_</code> à la place de <code>+</code> et <code>/</code>), décodé par <code>atob</code>, puis <code>JSON.parse</code>. Pas de clé, pas de secret.
</div>

</div>
<div class="text-sm">

Rappel de la séance 4&nbsp;: **le payload est encodé, pas chiffré.** Tout le monde peut le lire.

<v-clicks>

- Le front le lit pour afficher «&nbsp;alice&nbsp;» dans l’en-tête.
- Le front **ne le vérifie pas**&nbsp;: il n’a pas le secret. N’importe qui peut fabriquer un faux token, et le mettre dans son `localStorage`.
- **Le front cache des boutons, l’API interdit.** Chaque requête protégée est vérifiée par le guard, côté serveur.

</v-clicks>

</div>
</div>

---

# Un contexte&nbsp;: l’utilisateur, partout

<div class="grid grid-cols-2 gap-8 pt-2">
<div>

`Header`, `LoginPage`, `RequireAuth`, `NewModelPage`&nbsp;: quatre composants ont besoin du token. Le passer de props en props depuis `App`, c’est le traverser partout.

```tsx
// main.tsx : un provider, tout en haut
<AuthProvider>
  <App />
</AuthProvider>
```

```tsx
// n’importe où en dessous : un hook
const { user, logout } = useAuth();
```

<div class="text-sm">

`user` se calcule à chaque rendu, à partir du token&nbsp;: `decodePayload(token)`, ou `null`.

</div>

</div>
<div class="text-sm">

Un **contexte** met une valeur à disposition de tous les composants en dessous de son provider.

```text
BrowserRouter             l’adresse
└── QueryClientProvider   le cache des requêtes
    └── AuthProvider      { token, user, login, logout }
        └── App
```

<div class="pt-2">

C’est ce que font déjà `QueryClientProvider` et `BrowserRouter`&nbsp;: un provider en haut, un hook en bas.

</div>

<div class="pt-4 op-75">
<code>AuthProvider.tsx</code> est fourni en squelette&nbsp;: vous écrivez <code>login</code>, <code>logout</code> et <code>user</code>, étape 2. Il utilise la syntaxe de React 19, <code>&lt;AuthContext value={…}&gt;</code>&nbsp;; les tutos écrivent encore <code>&lt;AuthContext.Provider&gt;</code>.
</div>
</div>
</div>

---

# Deux fonctions `login`

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```ts
// api.ts : parle à l’API
export async function login(username: string, password: string) {
  // … POST /auth/login
  return body.access_token;           // renvoie le token
}
```

```tsx
// AuthProvider.tsx : garde l’utilisateur connecté
import * as api from '../api';

const login = async (username: string, password: string) => {
  const token = await api.login(username, password);
  // … puis le range, étape 2
};
```

</div>
<div class="col-span-2 text-sm">

- **`api.login`** demande le token à l’API, et le **renvoie**. Il ne garde rien.
- **Le `login` du contexte** appelle `api.login`, puis **range** le token. C’est lui que les pages appellent, avec `useAuth()`.

<div class="mt-4 p-3 bg-red-500 bg-opacity-10 rounded">

**Le piège.** Sans le préfixe `api.`, le `login` du contexte s’appelle lui-même, à l’infini&nbsp;: *Maximum call stack size exceeded*.

</div>
</div>
</div>

---

# Le token, entre l’état et `localStorage`

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```ts
// le navigateur range des chaînes, par clé
localStorage.setItem(TOKEN_KEY, token);   // ranger
localStorage.getItem(TOKEN_KEY);          // lire : string | null
localStorage.removeItem(TOKEN_KEY);       // oublier
```

```tsx
// AuthProvider : l’état part de localStorage
const [token, setToken] = useState(
  () => localStorage.getItem(TOKEN_KEY),
);
```

<div class="pt-2 text-sm op-75">
<code>TOKEN_KEY</code>, fourni dans <code>AuthProvider.tsx</code>, vaut <code>'token'</code>&nbsp;: le nom de la case. Pour la voir&nbsp;: F12, Application, Local Storage, <code>http://localhost:5173</code>. Une origine, un stockage.
</div>

</div>
<div class="col-span-2 text-sm">

<v-clicks>

- **Deux endroits, deux rôles.** L’état&nbsp;: React redessine quand il change. `localStorage`&nbsp;: le token survit au rechargement.
- `login` le range **dans les deux**, `logout` l’efface **des deux**. Changer seulement `localStorage` ne redessine rien.
- `useState(() => …)`&nbsp;: une fonction, appelée une seule fois, au montage. Sans elle, la lecture se referait à chaque rendu.
- Le squelette écrit `const [token] = useState(…)`&nbsp;: à vous d’ajouter `setToken`.

</v-clicks>

</div>
</div>

---

# Les requêtes protégées

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```ts
export async function createModel(
  model: NewModel, token: string,
): Promise<Model> {
  const res = await fetch(`${API_URL}/models`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(model),
  });
  // …
}
```

</div>
<div class="col-span-2 text-sm">

Le même en-tête que dans Swagger ou Bruno, en séance 4&nbsp;: **`Authorization: Bearer <token>`**.

<v-clicks>

- Le token arrive **en paramètre**. `api.ts` ne peut pas appeler `useAuth()`&nbsp;: un hook ne s’appelle que dans un composant.
- Le composant lit le token avec `useAuth()`, et le passe à `createModel`.
- Pas de token, un token faux ou expiré&nbsp;: l’API répond `401`.

</v-clicks>

</div>
</div>

---

# Naviguer depuis le code

<div class="grid grid-cols-2 gap-8 pt-2">
<div>

**Après une action**&nbsp;: `useNavigate`

```tsx
const navigate = useNavigate();

// après l’ajout d’un modèle
navigate(`/models/${created.id}`);

// après la connexion, sans garder
// /login dans l’historique
navigate('/', { replace: true });
```

</div>
<div>

**Pendant le rendu**&nbsp;: `<Navigate />`

```tsx
if (!token) {
  return <Navigate to="/login" replace />;
}
```

<div class="pt-4 text-sm">

Un `Link` attend un clic. `navigate()` s’appelle dans un gestionnaire d’événement. `<Navigate />` s’affiche, et redirige aussitôt.

</div>

<div class="pt-4 text-sm op-75">
<code>replace</code>&nbsp;: la nouvelle adresse remplace l’ancienne dans l’historique. Le bouton retour ne ramène pas sur la page de connexion.
</div>
</div>
</div>

---

# La page protégée

<div class="grid grid-cols-2 gap-8 pt-2">
<div>

```text
/models/new, sans token
   RequireAuth : <Navigate to="/login"
     state={{ from: '/models/new' }} />

/login
   connexion réussie
   navigate(from)

/models/new, avec le token
   le formulaire
```

<div class="pt-3 text-sm">

**`children`**&nbsp;: ce qu’on écrit entre `<RequireAuth>` et `</RequireAuth>`, ici `<NewModelPage />`. `RequireAuth` décide s’il l’affiche.

</div>

</div>
<div class="text-sm">

**`RequireAuth`** enveloppe la page à protéger&nbsp;:

```tsx
<Route path="/models/new" element={
  <RequireAuth><NewModelPage /></RequireAuth>
} />
```

<v-clicks>

- Pas de token&nbsp;: `<Navigate />` vers `/login`, avec la page demandée dans `state`. `useLocation()` donne l’adresse actuelle.
- Après la connexion, `LoginPage` lit `location.state?.from` et y retourne. `?.`&nbsp;: lire `from` seulement si `state` existe.

</v-clicks>

<v-click>

<div class="mt-4 p-3 bg-red-500 bg-opacity-10 rounded">

**`RequireAuth` protège l’affichage, pas les données.** Sans le guard côté API, n’importe qui appelle `POST /models` avec curl.

</div>

</v-click>
</div>
</div>

---
layout: section
---

# 5. Les formulaires

---

# Le formulaire contrôlé

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```tsx
const [username, setUsername] = useState('');

<input
  id="username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>
```

<BrowserFrame url="localhost:5173/login">
<label for="demo-username" style="display: block; font-size: 14px;">Identifiant</label>
<input id="demo-username" value="alice" readonly style="margin-top: 4px; padding: 2px 6px; border: 1px solid #767676; border-radius: 3px; background: #fff; color: #000;" />
</BrowserFrame>

</div>
<div class="col-span-2 text-sm">

<v-clicks>

- **La valeur du champ vient de l’état**, pas du navigateur. L’état React est la seule source de vérité.
- Chaque touche&nbsp;: `onChange`, puis `setUsername`, puis un rendu, et le champ affiche la nouvelle valeur.
- `value` sans `onChange`&nbsp;: le champ est figé, on ne peut plus rien taper. React le signale dans la console.
- Un `<input type="number">` donne **une chaîne**&nbsp;: `Number(parameters)` avant de l’envoyer.

</v-clicks>

</div>
</div>

---

# Envoyer le formulaire

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```tsx
import { type SubmitEvent } from 'react';

const { login } = useAuth();    // celui du contexte
const navigate = useNavigate();

const handleSubmit = async (
  event: SubmitEvent<HTMLFormElement>,
) => {
  event.preventDefault();       // pas de rechargement
  try {
    await login(username, password);
    navigate('/', { replace: true });
  } catch (err) {
    setError(…);   // le 401 : « Les erreurs de l’API »
  }
};

<form onSubmit={handleSubmit}>
  {/* les champs */}
  <button type="submit">Se connecter</button>
</form>
```

</div>
<div class="col-span-2 text-sm">

<v-clicks>

- **`onSubmit` sur le `<form>`**, pas `onClick` sur le bouton&nbsp;: la touche Entrée dans un champ envoie aussi le formulaire.
- **`preventDefault()`**&nbsp;: sans lui, le navigateur fait ce qu’un formulaire HTML fait depuis 1995. Il met les champs dans l’adresse, mot de passe compris, et **recharge la page**.
- `async`&nbsp;: on attend la réponse de l’API avant de changer de page.
- `SubmitEvent`, importé de `react`. Les tutos écrivent encore `FormEvent`, marqué obsolète dans les types de React 19.

</v-clicks>

</div>
</div>

---

# Un formulaire à plusieurs champs

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```tsx
interface Draft {
  name: string;
  task: Task;
  parameters: string;   // un input donne une chaîne
  // …
}
const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

<input
  value={draft.name}
  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
/>
<select
  value={draft.task}
  onChange={(e) =>
    setDraft({ ...draft, task: e.target.value as Task })}
>
```

</div>
<div class="col-span-2 text-sm">

<v-clicks>

- **Un objet, un seul état**, plutôt qu’un `useState` par champ.
- `{ ...draft, name: … }`&nbsp;: une copie, avec un champ changé. Écrire `draft.name = …` modifie l’objet, mais React ne voit rien&nbsp;: même objet, pas de nouveau rendu.
- Un `<select>` se contrôle comme un `<input>`. `e.target.value` est une `string`&nbsp;: `as Task` la promet au compilateur.
- Pendant l’envoi&nbsp;: un état `submitting`, `disabled={submitting}` sur le bouton, remis à `false` dans le `finally`, que l’envoi réussisse ou non.

</v-clicks>

</div>
</div>

---

# Les erreurs de l’API, dans le formulaire

<div class="text-sm pt-2">

| Code | Quand | Ce que lit l’utilisateur |
|---|---|---|
| `400` | un champ refusé par la validation&nbsp;: un identifiant avec des majuscules | la liste des messages de l’API |
| `401` | pas de token, ou un token expiré | on le déconnecte, et il revient à la connexion (étape 7) |
| `409` | l’identifiant existe déjà | «&nbsp;Un modèle avec cet identifiant existe déjà.&nbsp;» |
| `422` | l’organisation n’existe pas | «&nbsp;Organisation inconnue&nbsp;: créez-la d’abord.&nbsp;» |

</div>

<div class="grid grid-cols-2 gap-6 pt-4 text-sm">
<div>

```tsx
catch (err) {
  if (err instanceof ApiError
      && err.status === 409) { … }
}
```

</div>
<div>

`ApiError`, fournie, porte le `status` et les `details` de l’API.

<div class="pt-2 op-75">
Pendant l’envoi, le bouton est désactivé. Un double clic, sinon, c’est deux <code>POST</code>, et un 409 sur le second.
</div>
</div>
</div>

---

# L’essentiel de la connexion

<div class="grid grid-cols-3 gap-4 pt-2 text-sm">
<div class="p-4 border border-gray-500 border-opacity-30 rounded">

**La connexion**

- `api.login` demande le token, le `login` du contexte le range
- le token dans l’état **et** dans `localStorage`
- le payload se lit, il ne prouve rien
- `useAuth()` partout, grâce au contexte
- `Authorization: Bearer`, et un `401` déconnecte
- le front cache, l’API interdit

</div>
<div class="p-4 border border-gray-500 border-opacity-30 rounded">

**Naviguer**

- `Link` pour un lien
- `navigate()` après une action
- `<Navigate />` pendant le rendu
- `replace`&nbsp;: pas de trace dans l’historique
- `state`&nbsp;: la page demandée, pour y revenir

</div>
<div class="p-4 border border-gray-500 border-opacity-30 rounded">

**Les formulaires**

- `value` et `onChange`&nbsp;: l’état décide
- `onSubmit` sur le `<form>`, et `preventDefault()`
- plusieurs champs&nbsp;: un objet, copié avec `{ ...draft }`
- `method`, `Content-Type`, `JSON.stringify`
- les erreurs de l’API, dans un `role="alert"`

</div>
</div>

<div class="pt-4 text-sm op-75">
Gardez cette slide ouverte pendant le TP&nbsp;: les slides sont sur <b>gaetanmaisse.github.io/ismin-web-2026-tps</b>
</div>

---
layout: section
---

# 6. Le TP9

<div class="op-75 pt-2"><code>tp09/README.md</code>, étapes 1 à 7</div>

---

# Démarrer le TP9, trois terminaux

<div class="grid grid-cols-3 gap-4 pt-2 text-sm">
<div>

**1 · L’API**

```sh
git pull --no-edit upstream main
cd tp09/api
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
cd tp09/web
cp .env.example .env
npm install
npm run dev
```

</div>
<div>

**3 · Les tests**

```sh
cd tp09/web
npm run test:watch
```

</div>
</div>

<div class="pt-4 text-sm op-75">
Le TP9 part du corrigé du TP8&nbsp;: les routes et la page d’un modèle sont faites. Au départ, 30 tests verts, dont ceux du TP8, et 28 rouges. L’API ne change pas&nbsp;: rien à y écrire. Arrêtez d’abord l’API et le front du TP8&nbsp;: ce sont les mêmes ports.
</div>

---

# L’arbre de l’application, TP9

<div class="grid grid-cols-2 gap-8 pt-4">
<div class="text-sm">

**Fourni**, du TP8&nbsp;: les routes, le catalogue, la page d’un modèle, la page 404.

**Fourni**, nouveau&nbsp;: la maquette de la connexion et du formulaire d’ajout, le squelette d’`AuthProvider`, et `decodePayload`.

**À écrire**&nbsp;: la connexion, la page protégée, l’ajout.

</div>
<div>

```text
AuthProvider               ← étape 2
└── App
    ├── Header             ← étape 4
    └── Routes
        ├── /             CatalogPage   fourni
        ├── /models/:id   ModelPage     fourni
        ├── /login        LoginPage     ← étape 3
        ├── /models/new   RequireAuth   ← étape 5
        │                 └ NewModelPage  ← étape 6
        └── *             NotFoundPage  fourni
```

</div>
</div>

---

# Le TP9, en sept étapes

<div class="pt-2 text-sm">

1. **Démarrer**&nbsp;: l’API, le front, les tests. Dans `/docs`, un token pour alice, «&nbsp;Authorize&nbsp;», puis un `POST /models`.
2. **Se connecter, côté code**&nbsp;: `login()` dans `api.ts`, puis `user`, `login` et `logout` dans `AuthProvider`.
3. **La page de connexion**&nbsp;: la route `/login`, et un formulaire contrôlé. Un `401` affiche «&nbsp;Identifiant ou mot de passe incorrect.&nbsp;»
4. **L’en-tête**&nbsp;: le nom de l’utilisateur, et un bouton «&nbsp;Se déconnecter&nbsp;».
5. **La page protégée**&nbsp;: la route `/models/new`, dans un `RequireAuth`, et le retour à la page demandée après la connexion.
6. **Ajouter un modèle**&nbsp;: `createModel()` dans `api.ts`, le formulaire de `NewModelPage`, puis la page du nouveau modèle. Les erreurs `400`, `409` et `422` dans le formulaire.
7. **Le token expiré**&nbsp;: un `401` déconnecte, la connexion ramène au formulaire.

</div>

<div class="pt-4 text-sm op-75">
Pour tester l’étape 7 sans attendre une heure&nbsp;: F12, Application, Local Storage, et changez le dernier caractère du token, dans la signature. Fini&nbsp;? Les bonus du README&nbsp;: la suppression, réservée à alice. 🖐 Bloqué&nbsp;? Levez la main.<br/>Pas fini ce soir&nbsp;? Le TP9 se termine chez vous&nbsp;: demain, Docker part de son corrigé.
</div>

---
layout: section
---

# 7. La correction du TP9

<div class="op-75 pt-2">La page protégée, le formulaire, et ce qui a coincé</div>

---

# La page protégée, en entier

<div class="grid grid-cols-2 gap-6 pt-2">
<div>

```tsx
// auth/RequireAuth.tsx
export const RequireAuth = (
  { children }: RequireAuthProps,
) => {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace
      state={{ from: location.pathname }} />;
  }
  return children;
};
```

</div>
<div>

```tsx
// pages/LoginPage.tsx
interface FromState {
  from?: string;
}

// dans handleSubmit
await login(username, password);
const from =
  (location.state as FromState | null)?.from ?? '/';
navigate(from, { replace: true });
```

<div class="pt-4 text-sm">

`location.state` n’a pas de type&nbsp;: rien ne garantit qui a navigué jusqu’ici, ni avec quoi. On le décrit, et on prévoit le cas où il manque.

</div>
</div>
</div>

---

# Le formulaire d’ajout, l’envoi

<div class="grid grid-cols-5 gap-6 pt-2">
<div class="col-span-3">

```tsx
event.preventDefault();
if (!token) return;
setSubmitting(true);
setError(null);
try {
  const created = await createModel({
    id: draft.id, name: draft.name,
    org: draft.org, task: draft.task,
    parameters: Number(draft.parameters),
    license: draft.license || undefined,
  }, token);
  navigate(`/models/${created.id}`);
} catch (err) {
  if (err instanceof ApiError && err.status === 401) {
    logout();                 // RequireAuth prend le relais
    return;
  }
  setError(err);
} finally {
  setSubmitting(false);
}
```

</div>
<div class="col-span-2 text-sm">

<v-clicks>

- `if (!token) return;`&nbsp;: `RequireAuth` garantit le token, TypeScript ne le sait pas.
- `Number(…)`&nbsp;: le champ donne une chaîne, l’API attend un nombre.
- `|| undefined`&nbsp;: une licence vide n’est pas envoyée.
- **Le 401**&nbsp;: `logout()` efface le token. Au rendu suivant, `RequireAuth` redirige vers la connexion, qui ramènera ici.
- `setError(err)`&nbsp;: l’erreur est gardée telle quelle. Au rendu, `describeError` choisit la phrase du tableau des erreurs, et un `400` ajoute la liste des `details`.

</v-clicks>

</div>
</div>

---

# Les erreurs les plus vues du TP9

<div class="grid grid-cols-3 gap-4 pt-2 text-sm">
<div class="p-3 border border-gray-500 border-opacity-30 rounded">

**`preventDefault()` oublié**

La page se recharge, avec `?username=alice&password=secret` dans l’adresse.

</div>
<div class="p-3 border border-gray-500 border-opacity-30 rounded">

**Un champ figé**

Un `value` sans `onChange`.

</div>
<div class="p-3 border border-gray-500 border-opacity-30 rounded">

**`username should not be empty`**

Le `400` de l’API&nbsp;: le `Content-Type` oublié, Nest n’a pas lu le corps.

</div>
<div class="p-3 border border-gray-500 border-opacity-30 rounded">

**`parameters must be a number`**

Le `400` de l’API&nbsp;: le `Number()` oublié.

</div>
<div class="p-3 border border-gray-500 border-opacity-30 rounded">

**Un `401` sur `POST /models`**

Le token manque, ou l’en-tête est mal écrit&nbsp;: `Bearer`, un espace, le token.

</div>
<div class="p-3 border border-gray-500 border-opacity-30 rounded">

**`Maximum call stack size exceeded`**

Dans `AuthProvider`, `login` s’appelle lui-même. Celui de l’API&nbsp;: `api.login(…)`.

</div>
</div>
