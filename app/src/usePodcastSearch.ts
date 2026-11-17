import { useEffect, useState } from 'react'
import { filterPodcasts } from './filterPodcasts'
import type { Podcast, SearchPodcasts } from './types'

// Espera tras la última tecla antes de buscar, para no lanzar una búsqueda por cada letra.
const DEBOUNCE_MS = 400

// Término con el que se llena la lista al abrir la app.
export const INITIAL_TERM = 'inteligencia artificial'

// En 'loading', `previous` son los podcasts ya en pantalla (si los hay): se siguen mostrando,
// filtrados localmente, hasta que llegue la respuesta del nuevo término.
// 'idle': la caja quedó vacía a propósito; no se busca nada.
type Load =
  | { status: 'idle' }
  | { status: 'loading'; previous: Podcast[] | null }
  | { status: 'error' }
  | { status: 'ready'; podcasts: Podcast[]; term: string }

/**
 * Lo que la pantalla muestra: exactamente uno de estos momentos. Se deriva siempre de un único
 * `Load` (más el texto de la caja), así que no hay estados contradictorios.
 * `refreshing`: la lista visible es provisional (filtrada en local) mientras llega la búsqueda nueva.
 */
export type View =
  | { kind: 'idle' }
  | { kind: 'loading'; term: string }
  | { kind: 'error' }
  | { kind: 'empty'; term: string }
  | { kind: 'list'; podcasts: Podcast[]; refreshing: boolean }

function toView(load: Load, query: string, emptied: boolean): View {
  // Caja vacía: manda sobre todo lo demás, también en el instante antes de que el efecto lo registre.
  if (emptied) return { kind: 'idle' }

  // El filtro local solo vale mientras la lista en pantalla no corresponde a lo escrito:
  // con la respuesta de la fuente para ese texto se muestra todo lo que devolvió.
  const currentTerm = query.trim() || INITIAL_TERM
  switch (load.status) {
    case 'idle':
      // Se volvió a escribir pero la búsqueda aún no arranca (espera de letras).
      return { kind: 'loading', term: currentTerm }
    case 'error':
      return { kind: 'error' }
    case 'loading': {
      // Sin nada que enseñar todavía (o el filtro local no deja nada) seguimos "cargando":
      // aún no sabemos si de verdad no hay resultados.
      const shown = load.previous ? filterPodcasts(load.previous, query) : []
      return shown.length > 0
        ? { kind: 'list', podcasts: shown, refreshing: true }
        : { kind: 'loading', term: currentTerm }
    }
    case 'ready': {
      if (load.podcasts.length === 0) return { kind: 'empty', term: load.term }
      if (load.term === currentTerm) return { kind: 'list', podcasts: load.podcasts, refreshing: false }
      // La búsqueda del texto nuevo está por empezar (espera de letras): mientras, se filtra lo que ya hay.
      const shown = filterPodcasts(load.podcasts, query)
      return shown.length > 0
        ? { kind: 'list', podcasts: shown, refreshing: true }
        : { kind: 'loading', term: currentTerm }
    }
  }
}

export type PodcastSearch = {
  view: View
  /** Busca ya, sin esperar el debounce (Enter, o un texto concreto como «ver todos»). */
  searchNow: (text?: string) => void
  /** Repite la última búsqueda; pensado para el estado de error. */
  retry: () => void
}

/** Busca en la fuente cada vez que cambia el término y devuelve lo que hay que mostrar. */
export function usePodcastSearch(search: SearchPodcasts, query: string): PodcastSearch {
  // "Caja vacía" solo cuenta una vez que se escribió algo: al abrir, la lista inicial se carga igual.
  const [hasTyped, setHasTyped] = useState(false)
  if (query !== '' && !hasTyped) setHasTyped(true)
  const emptied = hasTyped && query === ''

  // '' = no buscar nada (caja vaciada).
  const [term, setTerm] = useState(INITIAL_TERM)
  const [attempt, setAttempt] = useState(0)
  const [load, setLoad] = useState<Load>({ status: 'loading', previous: null })

  // Pasado el debounce, el texto escrito pasa a ser el término de búsqueda.
  useEffect(() => {
    if (emptied) {
      setTerm('')
      return
    }
    const trimmed = query.trim()
    if (!trimmed) {
      setTerm(INITIAL_TERM)
      return
    }
    const timer = setTimeout(() => setTerm(trimmed), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query, emptied])

  useEffect(() => {
    // Caja vacía: sin red. Los resultados anteriores se descartan para no reaparecer al volver a escribir.
    if (term === '') {
      setLoad({ status: 'idle' })
      return
    }
    // Abortar al cambiar el término evita que una respuesta vieja pise a la nueva.
    const controller = new AbortController()
    setLoad((prev) => ({
      status: 'loading',
      previous: prev.status === 'ready' ? prev.podcasts : prev.status === 'loading' ? prev.previous : null,
    }))
    search(term, controller.signal).then(
      (podcasts) => setLoad({ status: 'ready', podcasts, term }),
      () => {
        if (!controller.signal.aborted) setLoad({ status: 'error' })
      },
    )
    return () => controller.abort()
  }, [term, search, attempt])

  const retry = () => setAttempt((n) => n + 1)

  const searchNow = (text = query) => {
    const trimmed = text.trim()
    const next = trimmed || (emptied ? '' : INITIAL_TERM)
    if (next !== term) setTerm(next)
    else if (load.status === 'error') retry()
  }

  return { view: toView(load, query, emptied), searchNow, retry }
}
