import { useState } from 'react'
import SearchBox from './SearchBox'
import PodcastList from './PodcastList'
import { LoadingState, EmptyState, ErrorState } from './ResultStates'
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

      <section className="results" aria-label="Resultados" aria-busy={view.kind === 'loading' || (view.kind === 'list' && view.refreshing)}>
        {view.kind === 'loading' && <LoadingState />}
        {view.kind === 'error' && <ErrorState />}
        {view.kind === 'empty' && <EmptyState term={view.term} />}
        {view.kind === 'list' && (
          <>
            {view.refreshing && <p className="refreshing" role="status">Actualizando resultados…</p>}
            <div className={view.refreshing ? 'list-wrap is-refreshing' : 'list-wrap'}>
              <PodcastList podcasts={view.podcasts} />
            </div>
          </>
        )}
      </section>
    </main>
  )
}
