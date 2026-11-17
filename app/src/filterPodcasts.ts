import type { Podcast } from './types'

// Minúsculas y sin tildes: "Ética" -> "etica". NFD separa la letra de su marca
// diacrítica y \p{M} la elimina.
const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

/** Podcasts cuyo título o autor contienen `term`, sin importar mayúsculas ni tildes. */
export function filterPodcasts(podcasts: Podcast[], term: string): Podcast[] {
  const needle = normalize(term.trim())
  if (needle === '') return podcasts
  return podcasts.filter(
    (p) => normalize(p.title).includes(needle) || normalize(p.author).includes(needle),
  )
}
