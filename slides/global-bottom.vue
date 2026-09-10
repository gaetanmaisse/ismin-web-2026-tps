<!--
  Instrumentation du minutage — invisible pendant la présentation.

  Enregistre dans le localStorage l'heure d'entrée sur chaque slide, ce qui
  permet de savoir a posteriori où le temps est réellement passé.

  Raccourcis :
    Ctrl+Shift+T  → télécharge le relevé en CSV (slide, entrée, durée)
    Ctrl+Shift+R  → remet le relevé à zéro (à faire avant de commencer)
-->
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const STORAGE_KEY = "ismin-timing-log";
const POLL_MS = 1000;

type Entry = { page: string; at: string };

let pollId: ReturnType<typeof setInterval> | undefined;
let lastPage = "";

function read(): Entry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Entry[];
  } catch {
    return [];
  }
}

function record(page: string): void {
  const entries = read();
  entries.push({ page, at: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function toCsv(entries: Entry[]): string {
  const rows = ["slide,entree,duree_s"];
  entries.forEach((entry, index) => {
    const next = entries[index + 1];
    const duration = next
      ? Math.round(
          (new Date(next.at).getTime() - new Date(entry.at).getTime()) / 1000,
        )
      : "";
    rows.push(`${entry.page},${entry.at},${duration}`);
  });
  return rows.join("\n");
}

function download(): void {
  const entries = read();
  if (entries.length === 0) return;

  const blob = new Blob([toCsv(entries)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `minutage-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function onKeydown(event: KeyboardEvent): void {
  if (!event.ctrlKey || !event.shiftKey) return;

  if (event.key.toLowerCase() === "t") {
    event.preventDefault();
    download();
  } else if (event.key.toLowerCase() === "r") {
    event.preventDefault();
    localStorage.removeItem(STORAGE_KEY);
    lastPage = "";
  }
}

function checkPage(): void {
  const page = window.location.pathname;
  if (page === lastPage) return;
  lastPage = page;
  record(page);
}

onMounted(() => {
  checkPage();
  pollId = setInterval(checkPage, POLL_MS);
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  if (pollId !== undefined) clearInterval(pollId);
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <!-- Rien à afficher : l'instrumentation doit rester invisible au vidéoprojecteur. -->
</template>
