import { useEffect, useState } from 'react'
import SearchBox from './SearchBox'
import PodcastList from './PodcastList'
import { filterPodcasts } from './filterPodcasts'
import type { Podcast, SearchPodcasts } from './types'

// Espera tras la última tecla antes de buscar, para no consultar a Apple por cada letra.
const DEBOUNCE_MS = 400

// Término con el que se llena la lista al abrir la app.
const INITIAL_TERM = 'inteligencia artificial'

// En 'loading', `previous` son los podcasts ya en pantalla (si los hay): se siguen mostrando,
// filtrados localmente, hasta que llegue la respuesta del nuevo término.
type Load =
  | { status: 'loading'; previous: Podcast[] | null }
  | { status: 'error' }
  | { status: 'ready'; podcasts: Podcast[]; term: string }

type AppProps = {
  /** La fuente de datos. Quien arma la app decide cuál; App no sabe de iTunes. */
  search: SearchPodcasts
}

export default function App({ search }: AppProps) {
  const [query, setQuery] = useState('')
  const [load, setLoad] = useState<Load>({ status: 'loading', previous: null })

  const [term, setTerm] = useState(INITIAL_TERM)

  // Pasado el debounce, el texto escrito pasa a ser el término de búsqueda (vacío = término inicial).
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setTerm(INITIAL_TERM)
      return
    }
    const timer = setTimeout(() => setTerm(trimmed), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

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

  // El filtro local solo vale mientras la lista en pantalla no corresponde a lo escrito:
  // con la respuesta de Apple para ese texto se muestra todo lo que devolvió.
  const currentTerm = query.trim() || INITIAL_TERM
  const visible = (podcasts: Podcast[], fetchedFor?: string) =>
    fetchedFor === currentTerm ? podcasts : filterPodcasts(podcasts, query)

  return (
    <main className="page">
      <h1>Pod Search</h1>
      <p className="subtitle">Encuentra podcasts sobre inteligencia artificial</p>

      <SearchBox value={query} onChange={setQuery} />

      <section className="results" aria-label="Resultados">
        {load.status === 'loading' && !load.previous && <p role="status">Cargando podcasts…</p>}
        {load.status === 'loading' && load.previous && (
          <PodcastList podcasts={visible(load.previous)} />
        )}
        {load.status === 'error' && (
          <p role="alert">
            No pudimos cargar los podcasts. Revisa tu conexión a internet e inténtalo de nuevo más tarde.
          </p>
        )}
        {load.status === 'ready' && load.podcasts.length === 0 && <p>No hay podcasts para mostrar.</p>}
        {load.status === 'ready' && load.podcasts.length > 0 && (
          <PodcastList podcasts={visible(load.podcasts, load.term)} />
        )}
      </section>
    </main>
  )
}
