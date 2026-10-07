# TP10 : ModelZoo dans des conteneurs

*Développement Web, ISMIN 3A, Docker.*

## 🎯 Objectif

Aujourd'hui, ModelZoo demande trois terminaux, Node installé sur la machine et une bonne mémoire des commandes. À la fin du TP, toute l'application démarre d'une seule commande, sur n'importe quelle machine qui a Docker :

```sh
docker compose up --build
```

Les migrations et le seed, l'API, le front servi par nginx, et la base SQLite rangée dans un volume, qui survit aux redémarrages : tout y est. C'est aussi ce que le projet exige.

On part du corrigé du TP9. Vous n'écrivez pas une ligne de TypeScript aujourd'hui, seulement des fichiers Docker.

## 🚀 Démarrer

### Installer Docker, une fois

- **macOS** : [Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/), la version de votre processeur (Apple Silicon ou Intel).
- **Windows** : d'abord WSL 2. Dans un PowerShell **lancé en administrateur** : `wsl --install`, puis redémarrez. Ensuite, [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/), avec l'option « Use WSL 2 » cochée. Si Docker Desktop dit `Virtualization support not detected`, activez la virtualisation dans le BIOS (Intel VT-x ou AMD-V).
- **Linux** : [Docker Engine](https://docs.docker.com/engine/install/), et le plugin `docker compose`.

Plus d'un Go à télécharger : faites-le chez vous, pas sur le Wi-Fi de l'école. Puis vérifiez, Docker Desktop **lancé** :

```sh
docker run hello-world
```

**Sous Windows, dans PowerShell**, toutes les commandes de ce README tiennent sur une ligne : copiez-les telles quelles. Un `\` en fin de ligne, qu'on trouve dans les tutos, ne coupe pas une commande dans PowerShell ; c'est l'accent grave, `` ` ``.

### Récupérer le TP

```sh
git pull --no-edit upstream main
docker --version        # Docker 29 ou plus
docker compose version  # Compose v2 ou plus
cd tp10
```

Arrêtez d'abord l'API et le front du TP9 : ce sont les mêmes ports.

C'est tout, vous pouvez commencer !

## 🗺 Ce qui est fourni

```
tp10/
├── compose.yaml          vide, des commentaires              ← étapes 4, 5 et 6
├── check.mjs             npm run check : vérifie toute la pile, étape 7
├── package.json          le script check, sans dépendance
├── api/                  l'API du TP9, sur SQLite. Rien à écrire en TypeScript
│   ├── .env.example      les variables, sans guillemets
│   ├── data/             les fichiers JSON du seed
│   ├── .dockerignore     vide                                ← étape 2
│   └── Dockerfile        des commentaires                    ← étapes 2 et 3
└── web/                  le front du TP9, complet
    ├── nginx.conf        la configuration de nginx, fournie
    ├── .dockerignore     vide                                ← étape 6
    └── Dockerfile        des commentaires                    ← étape 6
```

Une seule nouveauté dans l'API : `GET /health` répond enfin. Docker peut s'en servir pour savoir si l'API est debout.

## 📐 Les règles

- **Une image se construit, un conteneur tourne.** Le `Dockerfile` décrit l'image ; `docker run` ou `docker compose up` en lancent des conteneurs.
- **Rien de votre machine dans l'image** : ni `.env`, ni `node_modules`, ni votre `dev.db`. L'image construit ce dont elle a besoin.
- **Un conteneur se jette, un volume se garde.** Les données vivent dans un volume, jamais dans le conteneur.
- **Les secrets restent hors de l'image.** Les variables arrivent au démarrage du conteneur.

## 📝 Les étapes

### Partie 1 : l'API dans une image

### Étape 1 : une image toute faite

**À faire.** Avant de construire une image, utilisez-en une. Docker Desktop lancé :

```sh
docker run hello-world
docker run --rm -p 8080:80 nginx:alpine
```

Ouvrez `localhost:8080` : « Welcome to nginx! ». Dans un autre terminal, `docker ps` montre le conteneur. Arrêtez-le avec Ctrl+C, ou `docker stop` suivi de son nom.

**C'est bon quand.** Vous savez dire ce que fait `-p 8080:80` : le port 8080 de votre machine mène au port 80 du conteneur, celui où nginx écoute. Et ce que fait `--rm` : le conteneur est supprimé à l'arrêt.

**Pièges.**

- `port is already allocated` : un autre programme occupe le 8080. Prenez-en un autre, `-p 8081:80`.
- Une image se télécharge une fois : le second `docker run` démarre en une seconde. On retrouvera nginx à l'étape 6, pour servir le front.

### Étape 2 : une image pour l'API

**À faire.** Dans `api/.dockerignore`, ce qui ne doit jamais entrer dans l'image. Dans `api/Dockerfile`, une image en une seule étape, en suivant les commentaires. Puis, depuis `tp10` :

```sh
cp api/.env.example api/.env
docker build -t modelzoo-api ./api
docker run --name modelzoo-api --env-file api/.env -p 3000:3000 modelzoo-api sh -c "npx prisma migrate deploy && npm run db:seed && node dist/main.js"
```

Une seule commande : les migrations, le seed, puis le serveur. Ouvrez `localhost:3000/models`, puis `localhost:3000/docs` : connectez-vous avec alice, et ajoutez un modèle. Ensuite, supprimez le conteneur, et relancez la même commande :

```sh
docker rm -f modelzoo-api
docker run --name modelzoo-api --env-file api/.env -p 3000:3000 modelzoo-api sh -c "npx prisma migrate deploy && npm run db:seed && node dist/main.js"
```

**C'est bon quand.** `localhost:3000/models` renvoie 17 modèles, et le modèle ajouté a disparu après `docker rm -f`. Vous savez dire où il était : dans le fichier SQLite, écrit dans le conteneur lui-même, et supprimé avec lui.

**Pièges.**

- Copiez `package.json`, `package-lock.json`, `prisma.config.ts` et `prisma/schema.prisma` **avant** le reste, et lancez `npm ci` juste après. Tant que les dépendances ne changent pas, Docker garde cette couche en cache, et le build suivant prend quelques secondes. Le schéma vient avec elles : le `postinstall` lance `prisma generate`, qui le lit.
- Pas de `--ignore-scripts` sur ce `npm ci` : `better-sqlite3` est un module natif, et son script d'installation télécharge SQLite compilé pour le Linux du conteneur. Sans lui, l'API plante à la première requête.
- Sans `.dockerignore`, `COPY . .` embarque votre `.env`, donc `JWT_SECRET`, votre `dev.db`, et le `node_modules` de votre machine : son `better-sqlite3` est compilé pour macOS ou Windows, pas pour le Linux du conteneur. C'était le constat de l'audit, en séance 6.
- `--env-file` garde les guillemets : `DATABASE_URL="file:./dev.db"` arriverait guillemets compris. Le `.env.example` n'en a pas, gardez-le ainsi.
- `the container name "/modelzoo-api" is already in use` : l'ancien conteneur existe encore. `docker rm -f modelzoo-api`.

### Étape 3 : le build en deux étapes

**À faire.** Deux étapes dans le même `Dockerfile`. La première, `AS build`, compile, comme à l'étape 2. La seconde repart d'une image Node vide et ne garde que ce qui tourne : les dépendances de production, et le `dist/` de la première, avec `COPY --from=build`. Toutes les deux tournent sous l'utilisateur `node`, et créent le dossier `/app/db`, qui accueillera la base à l'étape 4. Reconstruisez sous un autre nom pour comparer :

```sh
docker build -t modelzoo-api:2 ./api
docker images modelzoo-api
```

**C'est bon quand.** L'image finale est nettement plus légère : de l'ordre de 1,3 Go en une étape, 0,5 Go en deux. Et la commande de l'étape 2 ne marche plus avec elle : plus de CLI Prisma pour les migrations, plus de `tsx` pour le seed. C'est pour ça que l'étape 5 aura son propre service.

**Pièges.**

- `npm ci --omit=dev` installe quand même la CLI Prisma : c'est une dépendance facultative de `@prisma/client`. `--omit=optional` en plus.
- `--ignore-scripts` ici, cette fois : le `postinstall` lance `prisma generate`, qui a besoin de cette CLI. Le client généré est déjà compilé dans `dist/`. Mais alors `better-sqlite3` n'a plus son SQLite : `npm rebuild better-sqlite3` relance son seul script d'installation.
- Le cache de npm reste dans la couche : près de 300 Mo pour rien. `npm cache clean --force`, **dans le même `RUN`** que `npm ci` : une couche ne rétrécit jamais après coup.
- Dans l'image finale, `npx prisma` ne trouve pas Prisma, et le télécharge : la dernière version, pas celle du projet. Elle ne connaît même pas `migrate`. `npx --no-install` échoue franchement.
- Nommez la première étape `build` : le service `migrate` de l'étape 5 s'en sert.

### Partie 2 : tout avec docker compose

### Étape 4 : compose, l'API et son volume

**À faire.** Supprimez le conteneur de l'étape 2, il occupe le port 3000 :

```sh
docker rm -f modelzoo-api
```

Dans `compose.yaml`, le service `api`, en suivant les commentaires, et le volume `data`, monté sur `/app/db`. Puis :

```sh
docker compose up --build
```

**C'est bon quand.** `localhost:3000/health` répond 200. `localhost:3000/models` répond 500, et les logs disent `The table main.Model does not exist` : la base du volume est vide, sans tables. C'est l'étape 5.

**Pièges.**

- `DATABASE_URL` vaut `file:/app/db/modelzoo.db` : un chemin absolu, dans le conteneur, dans le dossier du volume. Pas `/app/data` : ce dossier contient déjà les fichiers JSON du seed.
- Le volume se déclare deux fois : sous le service, `data:/app/db`, et tout en bas du fichier, `volumes: data:`.
- Les variables sont dans `environment`, pas dans un `.env` copié : l'image n'en contient pas, et c'est voulu.

### Étape 5 : les migrations et le seed

**À faire.** Un service `migrate`, qui applique les migrations, remplit la base, puis s'arrête. Il part de l'étape `build` de `api/Dockerfile`, qui a la CLI Prisma et `tsx`, avec le même volume et le même `DATABASE_URL` que `api`. `api` attend qu'il ait fini. Puis `docker compose up --build`.

Ensuite, sur `localhost:3000/docs`, connectez-vous avec alice et ajoutez un modèle. Puis :

```sh
docker compose down    # arrête et supprime les conteneurs
docker compose up      # les recrée : le modèle est toujours là
docker compose down -v # supprime aussi le volume : la base repart de zéro
```

**C'est bon quand.** `localhost:3000/models` renvoie 17 modèles, `docker compose ps -a` montre `migrate` terminé, `Exited (0)`, et le modèle ajouté survit à `down` puis `up`, pas à `down -v`.

**Pièges.**

- `command: npx prisma migrate deploy && npm run db:seed` ne marche pas : sans shell, `&&` et ce qui suit sont passés à Prisma comme des arguments, qu'il ignore. Les migrations passent, le seed ne tourne jamais, et le catalogue reste vide. `sh -c "…"`.
- `build: { context: ./api, target: build }` : compose construit l'image jusqu'à l'étape nommée.
- `condition: service_completed_successfully` : l'API ne démarre que si `migrate` s'est terminé avec le code 0.
- `attempt to write a readonly database` : le fichier, ou son dossier, appartient à root, et l'API tourne sous `node`. SQLite écrit un journal à côté du fichier : c'est le dossier entier qui doit appartenir à `node`, dans les deux étapes du `Dockerfile`. Puis `docker compose down -v` : un volume garde le propriétaire de sa première création.
- Relancer est sans danger : `migrate deploy` n'applique que les migrations manquantes, et le seed ne crée pas de doublons.

### Partie 3 : le front

### Étape 6 : le front, servi par nginx

**À faire.** `web/.dockerignore`, et `web/Dockerfile` en deux étapes : Node construit l'application, nginx sert les fichiers. Dans `compose.yaml`, le service `web`, avec l'argument de build `VITE_API_URL`, et le port 8080. Et dans le service `api`, `WEB_ORIGIN` devient l'adresse du front.

**C'est bon quand.** `localhost:8080` affiche le catalogue. Ouvrez un modèle, puis rechargez la page : elle s'affiche toujours.

**Pièges.**

- `VITE_API_URL` est lue **au build**, et écrite dans le JavaScript : un `environment:` sur le service `web` ne fait rien. C'est un argument de build : `ARG` dans le Dockerfile, `build.args` dans compose. Changer sa valeur demande un `--build`.
- Elle vaut `http://localhost:3000`, pas `http://api:3000` : c'est votre navigateur qui appelle l'API, depuis votre machine, pas le conteneur `web`.
- Sans le `try_files` de `nginx.conf`, recharger `/models/…` donne une 404 : nginx cherche un fichier qui n'existe pas. React Router n'a jamais la main.
- Le front tourne maintenant sur le port 8080 : une erreur CORS dans la console, tant que `WEB_ORIGIN` vaut `http://localhost:5173`.

### Étape 7 : tout vérifier

**À faire.** Depuis `tp10` :

```sh
npm run check
```

Puis, dans le navigateur, sur `localhost:8080` : connectez-vous avec alice, et ajoutez un modèle.

**C'est bon quand.** `npm run check` affiche 7 vérifications sur 7, et le modèle ajouté depuis le front apparaît dans le catalogue.

**Pièges.**

- Une vérification échoue : son message dit quelle étape revoir, et `docker compose logs <service>` dit pourquoi.
- `npm run check -- --down` arrête la pile après les vérifications.

## 🛰 Pour aller plus loin

- **Un healthcheck pour l'API**, sur `GET /health`, et `web` qui attend `api` avec `condition: service_healthy`. Attention : l'image `node:26-alpine` a `wget`, pas `curl`.
- **Passer à PostgreSQL** : un service `db` avec l'image `postgres`, l'adaptateur `@prisma/adapter-pg` à la place de `better-sqlite3`, et des migrations refaites, puisque le SQL d'une migration dépend de la base.
- **`JWT_SECRET` hors de `compose.yaml`** : un fichier `.env` à côté de `compose.yaml`, que compose lit tout seul, et `${JWT_SECRET}` dans le service. Ou `env_file:`. Et ce fichier, dans le `.gitignore`.
- **`restart: unless-stopped`** : l'API redémarre si elle plante.
- **`docker compose watch`** : reconstruire ou synchroniser à chaque enregistrement, pour développer dans les conteneurs.
- **Le concours de la plus petite image** : `docker images`, puis `docker history modelzoo-api` pour voir le poids de chaque couche. Qui descend le plus bas ?

## 🤖 IA

Demandez à votre assistant un `Dockerfile` pour l'API. Passez-le à la grille de l'audit de la séance 6 : copie-t-il `.env` ? Lance-t-il `start:dev` ? Une seule étape ? En root ? Avec le cache de npm ? Le `node_modules` de votre machine ? Et `better-sqlite3`, fonctionne-t-il dans l'image finale ?

Puis demandez-lui où vivent les données d'un conteneur, et pourquoi le modèle de l'étape 2 a disparu. Comparez avec ce que vous avez vu.

> ⚠️ **Règle d'or** : tout fichier que vous ne savez pas expliquer, je le supprime.

## 🔧 Dépannage

| Message | Remède |
|---|---|
| `Cannot connect to the Docker daemon` | Docker Desktop n'est pas lancé. Sous Windows, il lui faut WSL 2 |
| `Virtualization support not detected`, ou WSL 2 refuse de démarrer (Windows) | La virtualisation est coupée dans le BIOS : activez Intel VT-x ou AMD-V. Puis, dans PowerShell, `wsl --update` |
| `Ports are not available` … `An attempt was made to access a socket in a way forbidden by its access permissions` (Windows) | Windows réserve parfois des plages de ports, 3000 ou 8080 compris. Dans un PowerShell administrateur : `net stop winnat`, puis `net start winnat`. Sinon, changez le port de votre machine dans `compose.yaml` : `"13000:3000"` |
| Dans PowerShell, `-e` ou `-p` « n'est pas reconnu » | Une commande coupée par un `\` : tapez-la sur une seule ligne |
| `port is already allocated` | Un autre conteneur, ou un autre programme, occupe ce port : le conteneur de l'étape 2 (`docker rm -f modelzoo-api`), l'API ou le front du TP9 |
| `the container name "/modelzoo-api" is already in use` | L'ancien conteneur existe encore : `docker rm -f modelzoo-api` |
| `Could not locate the bindings file`, ou une erreur `better_sqlite3.node` | `better-sqlite3` n'a pas son SQLite pour le Linux du conteneur : `node_modules` copié depuis votre machine (le `.dockerignore`), ou `--ignore-scripts` sans `npm rebuild better-sqlite3` |
| `npm ci` échoue sur `prisma generate` | Le schéma n'est pas encore copié : `prisma.config.ts` et `prisma/schema.prisma` avec `package.json`, avant `npm ci` |
| `npx` télécharge `prisma@8…`, puis `No command registered for migrate` | La commande de l'étape 2 lancée dans l'image finale, qui n'a plus la CLI : c'est le rôle du service `migrate` |
| `sh: tsx: not found` | Même cause : le seed tourne dans l'étape `build`, pas dans l'image finale |
| `The table main.Model does not exist` | La base du volume est vide : le service `migrate`, étape 5. Ou il écrit dans un autre fichier : même `DATABASE_URL`, même volume |
| `attempt to write a readonly database` | Le dossier `/app/db` appartient à root : `chown node:node` dans les deux étapes du `Dockerfile`, puis `docker compose down -v` |
| `migrate` termine en `Exited (0)`, mais le catalogue est vide | Le seed n'a pas tourné : la commande doit passer par un shell, `sh -c "…"` |
| Une erreur CORS dans la console, depuis `localhost:8080` | `WEB_ORIGIN` du service `api` doit valoir `http://localhost:8080` |
| Recharger `/models/…` donne une 404 nginx | `nginx.conf` n'est pas copié dans `/etc/nginx/conf.d/default.conf` |
| Le front appelle la mauvaise adresse | `VITE_API_URL` se lit au build : `build.args`, puis `docker compose up --build` |
| Un changement de code ne se voit pas | L'image n'est pas reconstruite : `docker compose up --build` |
| L'image pèse plus d'un Go | Une seule étape, la CLI Prisma restée (`--omit=optional`), ou le cache de npm : étape 3 |

## ✅ Pour finir

```sh
git add . && git commit -m "feat(tp10): ModelZoo in containers" && git push
```
