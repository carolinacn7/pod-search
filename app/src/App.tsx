import { useState } from 'react'
import SearchBox from './SearchBox'
import PodcastList from './PodcastList'
import { filterPodcasts } from './filterPodcasts'
import { INITIAL_TERM, usePodcastSearch } from './usePodcastSearch'
import type { Podcast, SearchPodcasts } from './types'

type AppProps = {
  /** La fuente de datos. Quien arma la app decide cuál; App solo conoce este contrato. */
  search: SearchPodcasts
}

export default function App({ search }: AppProps) {
  const [query, setQuery] = useState('')
  const load = usePodcastSearch(search, query)

  // El filtro local solo vale mientras la lista en pantalla no corresponde a lo escrito:
  // con la respuesta de la fuente para ese texto se muestra todo lo que devolvió.
  const currentTerm = query.trim() || INITIAL_TERM
  const visible = (podcasts: Podcast[], loadedFor?: string) =>
    loadedFor === currentTerm ? podcasts : filterPodcasts(podcasts, query)

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
