import { useState } from 'react'
import SearchBox from './SearchBox'
import PodcastList from './PodcastList'
import { usePodcastSearch } from './usePodcastSearch'
import type { SearchPodcasts } from './types'

type AppProps = {
  /** La fuente de datos. Quien arma la app decide cuál; App solo conoce este contrato. */
  search: SearchPodcasts
}

export default function App({ search }: AppProps) {
  const [query, setQuery] = useState('')
  const view = usePodcastSearch(search, query)

  return (
    <main className="page">
      <h1>Pod Search</h1>
      <p className="subtitle">Encuentra podcasts sobre inteligencia artificial</p>

      <SearchBox value={query} onChange={setQuery} />

      <section className="results" aria-label="Resultados">
        {view.kind === 'loading' && <p role="status">Cargando podcasts…</p>}
        {view.kind === 'error' && (
          <p role="alert">
            No pudimos cargar los podcasts. Revisa tu conexión a internet e inténtalo de nuevo más tarde.
          </p>
        )}
        {view.kind === 'empty' && <p>No hay podcasts para mostrar.</p>}
        {view.kind === 'list' && <PodcastList podcasts={view.podcasts} />}
      </section>
    </main>
  )
}
