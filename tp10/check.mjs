/**
 * Given. Checks the whole TP: starts the stack with docker compose, then asks
 * the API and the front what a user would see.
 *
 *   npm run check            the stack stays up afterwards
 *   npm run check -- --down  the stack is stopped afterwards
 *
 * No dependency: Node 26 and its fetch.
 */
import { spawnSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const API = process.env.CHECK_API_URL ?? 'http://localhost:3000';
const WEB = process.env.CHECK_WEB_URL ?? 'http://localhost:8080';
const DOWN = process.argv.includes('--down');

const results = [];

function compose(...args) {
  return spawnSync('docker', ['compose', ...args], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

/** Retries `fn` until it stops throwing, or until `seconds` have passed. */
async function retry(fn, seconds) {
  const deadline = Date.now() + seconds * 1000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw lastError;
}

async function check(label, hint, fn, seconds = 5) {
  try {
    const detail = await retry(fn, seconds);
    results.push(true);
    console.log(`✅ ${label}${detail ? ` : ${detail}` : ''}`);
  } catch (error) {
    results.push(false);
    console.log(`❌ ${label}\n   ${error instanceof Error ? error.message : String(error)}\n   → ${hint}`);
  }
}

async function get(url, init) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(3000) });
  return res;
}

const config = compose('config', '--services');
if (config.status !== 0) {
  console.log(`❌ compose.yaml ne se lit pas :\n${config.stderr}`);
  console.log('   → Une erreur de syntaxe YAML : l\'indentation, des espaces, jamais de tabulations.');
  process.exit(1);
}
// A service not written yet: its checks fail at once, instead of waiting.
const services = config.stdout.split('\n').filter(Boolean);
const wait = (service, seconds) => (services.includes(service) ? seconds : 1);

if (services.length === 0) {
  console.log('compose.yaml ne déclare encore aucun service : rien à démarrer.\n');
} else {
  console.log('🐳 docker compose up -d --build …\n');
  const up = spawnSync('docker', ['compose', 'up', '-d', '--build'], { cwd: ROOT, stdio: 'inherit' });
  if (up.status !== 0) {
    console.log('\n❌ La pile ne démarre pas : lisez le message de Docker ci-dessus.');
    console.log('   → Docker Desktop est-il lancé ? Un port est-il déjà pris ? Un Dockerfile se construit-il ?');
    process.exit(1);
  }
  console.log('');
}

await check(
  "L'API répond sur /health",
  "Étape 4 : le service `api`, ses ports \"3000:3000\". Démarre-t-il ? `docker compose logs api`.",
  async () => {
    const res = await get(`${API}/health`);
    if (res.status !== 200) throw new Error(`GET ${API}/health a répondu ${res.status}`);
  },
  wait('api', 90),
);

await check(
  "Le service migrate s'est terminé sans erreur",
  "Étape 5 : `docker compose logs migrate`. Le service existe-t-il, part-il de l'étape `build`, avec le même volume que `api` ?",
  async () => {
    const ps = compose('ps', '--all', '--format', 'json', 'migrate');
    const lines = ps.stdout.trim().split('\n').filter(Boolean);
    if (lines.length === 0) throw new Error("Aucun service `migrate` dans compose.yaml");
    const service = JSON.parse(lines[0]);
    if (service.State !== 'exited') throw new Error(`migrate est « ${service.State} », pas terminé`);
    if (service.ExitCode !== 0) throw new Error(`migrate s'est terminé avec le code ${service.ExitCode}`);
  },
  wait('migrate', 30),
);

await check(
  'Le catalogue contient les modèles du seed',
  "Étape 5 : le seed a-t-il tourné, dans le même fichier que celui de l'API ? `docker compose logs migrate`. Même DATABASE_URL, même volume, et `sh -c \"… && …\"`.",
  async () => {
    const res = await get(`${API}/models`);
    if (!res.ok) throw new Error(`GET ${API}/models a répondu ${res.status}`);
    const models = await res.json();
    if (!Array.isArray(models) || models.length < 17) {
      throw new Error(`${Array.isArray(models) ? models.length : 0} modèles, il en faut au moins 17`);
    }
    return `${models.length} modèles`;
  },
  wait('api', 15),
);

await check(
  'alice se connecte',
  "Étape 4 : JWT_SECRET est-il dans l'environnement du service `api` ?",
  async () => {
    const res = await get(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'alice', password: 'secret' }),
    });
    const body = await res.json().catch(() => ({}));
    if (!body.access_token) throw new Error(`POST /auth/login a répondu ${res.status}, sans token`);
  },
  wait('api', 5),
);

await check(
  'Le front répond sur le port 8080',
  'Étape 6 : le service `web`, ses ports "8080:80", et les fichiers de dist/ dans /usr/share/nginx/html.',
  async () => {
    const res = await get(`${WEB}/`);
    const html = await res.text();
    if (res.status !== 200 || !html.includes('id="root"')) throw new Error(`GET ${WEB}/ a répondu ${res.status}, sans <div id="root">`);
  },
  wait('web', 30),
);

await check(
  "Recharger l'adresse d'un modèle ne donne pas de 404",
  'Étape 6 : nginx.conf, et son try_files, copié dans /etc/nginx/conf.d/default.conf.',
  async () => {
    const res = await get(`${WEB}/models/mistral-7b-instruct-v0-3`);
    const html = await res.text();
    if (res.status !== 200 || !html.includes('id="root"')) throw new Error(`GET ${WEB}/models/… a répondu ${res.status}`);
  },
  wait('web', 5),
);

await check(
  "L'API accepte les appels du front (CORS)",
  "Étape 6 : WEB_ORIGIN du service `api` doit valoir http://localhost:8080, l'adresse du front.",
  async () => {
    const res = await get(`${API}/models`, { headers: { Origin: WEB } });
    const allowed = res.headers.get('access-control-allow-origin');
    if (allowed !== WEB) throw new Error(`Access-Control-Allow-Origin vaut « ${allowed ?? 'rien'} », pas ${WEB}`);
  },
  wait('api', 5),
);

const passed = results.filter(Boolean).length;
console.log(`\n${passed} / ${results.length} vérifications passent.`);

if (DOWN && services.length > 0) {
  console.log('\n🐳 docker compose down …');
  spawnSync('docker', ['compose', 'down'], { cwd: ROOT, stdio: 'inherit' });
} else if (services.length > 0) {
  console.log('La pile tourne toujours : http://localhost:8080. Pour l’arrêter : docker compose down');
}

process.exit(passed === results.length ? 0 : 1);
