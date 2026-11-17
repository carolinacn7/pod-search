import { useEffect, useState } from 'react'
import type { Podcast, SearchPodcasts } from './types'

// Espera tras la última tecla antes de buscar, para no lanzar una búsqueda por cada letra.
const DEBOUNCE_MS = 400

// Término con el que se llena la lista al abrir la app.
export const INITIAL_TERM = 'inteligencia artificial'

// En 'loading', `previous` son los podcasts ya en pantalla (si los hay): se siguen mostrando,
// filtrados localmente, hasta que llegue la respuesta del nuevo término.
export type Load =
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

/** Busca en la fuente cada vez que cambia el término (con debounce) y expone el estado de la carga. */
export function usePodcastSearch(search: SearchPodcasts, query: string): Load {
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

  return load
}
