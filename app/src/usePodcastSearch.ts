import { useEffect, useState } from 'react'
import { filterPodcasts } from './filterPodcasts'
import type { Podcast, SearchPodcasts } from './types'

// Espera tras la última tecla antes de buscar, para no lanzar una búsqueda por cada letra.
const DEBOUNCE_MS = 400

// Término con el que se llena la lista al abrir la app.
export const INITIAL_TERM = 'inteligencia artificial'

// En 'loading', `previous` son los podcasts ya en pantalla (si los hay): se siguen mostrando,
// filtrados localmente, hasta que llegue la respuesta del nuevo término.
type Load =
  | { status: 'loading'; previous: Podcast[] | null }
  | { status: 'error' }
  | { status: 'ready'; podcasts: Podcast[]; term: string }

/** Pasado el debounce, el texto escrito pasa a ser el término de búsqueda (vacío = término inicial). */
function useDebouncedTerm(query: string): string {
  const [term, setTerm] = useState(INITIAL_TERM)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setTerm(INITIAL_TERM)
      return
    }
    const timer = setTimeout(() => setTerm(trimmed), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  return term
}

/**
 * Lo que la pantalla muestra. Se deriva siempre de un único `Load`, así que no hay estados contradictorios.
 * `refreshing`: la lista visible es provisional (filtrada en local) mientras llega la búsqueda nueva.
 */
export type View =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'empty'; term: string }
  | { kind: 'list'; podcasts: Podcast[]; refreshing: boolean }

function toView(load: Load, query: string): View {
  // El filtro local solo vale mientras la lista en pantalla no corresponde a lo escrito:
  // con la respuesta de la fuente para ese texto se muestra todo lo que devolvió.
  const currentTerm = query.trim() || INITIAL_TERM
  switch (load.status) {
    case 'error':
      return { kind: 'error' }
    case 'loading': {
      // Sin nada que enseñar todavía (o el filtro local no deja nada) seguimos "cargando":
      // aún no sabemos si de verdad no hay resultados.
      const shown = load.previous ? filterPodcasts(load.previous, query) : []
      return shown.length > 0 ? { kind: 'list', podcasts: shown, refreshing: true } : { kind: 'loading' }
    }
    case 'ready': {
      if (load.podcasts.length === 0) return { kind: 'empty', term: load.term }
      if (load.term === currentTerm) return { kind: 'list', podcasts: load.podcasts, refreshing: false }
      // La búsqueda del texto nuevo está por empezar (debounce): mientras, se filtra lo que ya hay.
      const shown = filterPodcasts(load.podcasts, query)
      return shown.length > 0 ? { kind: 'list', podcasts: shown, refreshing: true } : { kind: 'loading' }
    }
  }
}

/** Busca en la fuente cada vez que cambia el término (con debounce) y devuelve lo que hay que mostrar. */
export function usePodcastSearch(search: SearchPodcasts, query: string): View {
  const term = useDebouncedTerm(query)
  const [load, setLoad] = useState<Load>({ status: 'loading', previous: null })

  useEffect(() => {
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
  }, [term, search])

  return toView(load, query)
}
