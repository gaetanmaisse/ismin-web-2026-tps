<script setup lang="ts">
import { computed } from 'vue'

/**
 * Fond de couverture : une constellation de nœuds reliés, ModelZoo en abstrait.
 *
 * La teinte dominante identifie le SPRINT, le dessin identifie la SÉANCE :
 * les étudiants voient d'un coup d'œil où ils en sont dans le semestre.
 *
 *   <CourseCover :sprint="1" :seance="1" />
 *
 * On ne passe pas par le front-matter `background:` : la mise en page `cover`
 * de Slidev superposerait un linear-gradient(#0005, #0008) et forcerait le
 * texte en blanc, ce qui ruine un fond clair.
 */
const props = withDefaults(defineProps<{ sprint?: number, seance?: number }>(), {
  sprint: 1,
  seance: 1,
})

const W = 1920
const H = 1080

/** Une couleur par sprint, reprise des schémas Mermaid du cours.
 *  L'ambre est assombri (#d97706) : le #f59e0b des schémas disparaît sur fond clair. */
const TEINTES: Record<number, string> = {
  1: '#2563eb', // Fondations & serveur
  2: '#7c3aed', // Sécurité & UI
  3: '#0d9488', // Fusion & QA
  4: '#d97706', // DevOps & production
}

const SECONDAIRES = ['#2563eb', '#7c3aed', '#0d9488', '#d97706']

/** mulberry32 : générateur déterministe, pour que la couverture ne bouge jamais. */
function alea(graine: number) {
  let a = graine
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const dessin = computed(() => {
  const dominante = TEINTES[props.sprint] ?? TEINTES[1]
  const rand = alea(1409 + props.seance * 977)

  type Noeud = { x: number, y: number, r: number, c: string, d: number }
  const noeuds: Noeud[] = []

  for (let essais = 0; essais < 6000 && noeuds.length < 90; essais++) {
    const x = rand() * (W + 80) - 40
    const y = rand() * (H + 80) - 40
    const d = Math.min(1, Math.hypot((x - W / 2) / (W / 2), (y - H / 2) / (H / 2)))

    // On évide le centre : le titre doit respirer.
    if (d < 0.55 && rand() > d / 0.55)
      continue
    if (noeuds.some(n => Math.hypot(x - n.x, y - n.y) < 95))
      continue

    // Deux nœuds sur trois portent la couleur du sprint.
    const c = rand() < 0.66
      ? dominante
      : SECONDAIRES[Math.floor(rand() * SECONDAIRES.length)]

    noeuds.push({ x, y, r: [3, 3, 4, 5, 7][Math.floor(rand() * 5)], c, d })
  }

  const aretes: [Noeud, Noeud][] = []
  const vus = new Set<string>()
  noeuds.forEach((n, i) => {
    noeuds
      .map((m, j) => ({ m, j, dist: Math.hypot(n.x - m.x, n.y - m.y) }))
      .filter(v => v.j !== i)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 2)
      .forEach(({ m, j, dist }) => {
        const cle = i < j ? `${i}-${j}` : `${j}-${i}`
        if (dist < 260 && !vus.has(cle)) {
          vus.add(cle)
          aretes.push([n, m])
        }
      })
  })

  return { noeuds, aretes }
})
</script>

<template>
  <svg
    class="absolute inset-0 w-full h-full -z-1"
    :viewBox="`0 0 ${W} ${H}`"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="`fond-${seance}`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="55%" stop-color="#f5f8fc" />
        <stop offset="100%" stop-color="#eef3f7" />
      </linearGradient>
      <radialGradient :id="`halo-${seance}`" cx="50%" cy="44%" r="58%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.92" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect :width="W" :height="H" :fill="`url(#fond-${seance})`" />

    <line
      v-for="([a, b], i) in dessin.aretes"
      :key="`a${i}`"
      :x1="a.x" :y1="a.y" :x2="b.x" :y2="b.y"
      stroke="#64748b" stroke-width="1.2"
      :stroke-opacity="0.10 + 0.16 * Math.min(a.d, b.d)"
    />

    <template v-for="(n, i) in dessin.noeuds" :key="`n${i}`">
      <circle :cx="n.x" :cy="n.y" :r="n.r * 3.2" :fill="n.c" :opacity="0.05 + 0.09 * n.d" />
      <circle :cx="n.x" :cy="n.y" :r="n.r" :fill="n.c" :opacity="0.35 + 0.5 * n.d" />
    </template>

    <!-- Le halo passe en dernier : il éclaircit le centre et détache le titre. -->
    <rect :width="W" :height="H" :fill="`url(#halo-${seance})`" />
  </svg>
</template>
