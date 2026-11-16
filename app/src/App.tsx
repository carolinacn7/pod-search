import { useEffect, useState } from 'react'
import SearchBox from './SearchBox'
import PodcastList from './PodcastList'
import { filterPodcasts } from './filterPodcasts'
import { searchPodcasts } from './itunes'
import type { Podcast } from './types'

// Término con el que se llena la lista al abrir la app.
const INITIAL_TERM = 'inteligencia artificial'

type Load =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; podcasts: Podcast[] }

export default function App() {
  const [query, setQuery] = useState('')
  const [load, setLoad] = useState<Load>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    searchPodcasts(INITIAL_TERM, controller.signal).then(
      (podcasts) => setLoad({ status: 'ready', podcasts }),
      () => {
        if (!controller.signal.aborted) setLoad({ status: 'error' })
      },
    )
    return () => controller.abort()
  }, [])

  return (
    <main className="page">
      <h1>Pod Search</h1>
      <p className="subtitle">Encuentra podcasts sobre inteligencia artificial</p>

      <SearchBox value={query} onChange={setQuery} />

      <section className="results" aria-label="Resultados">
        {load.status === 'loading' && <p role="status">Cargando podcasts…</p>}
        {load.status === 'error' && (
          <p role="alert">
            No pudimos cargar los podcasts. Revisa tu conexión a internet e inténtalo de nuevo más tarde.
          </p>
        )}
        {load.status === 'ready' && load.podcasts.length === 0 && <p>No hay podcasts para mostrar.</p>}
        {load.status === 'ready' && load.podcasts.length > 0 && (
          <PodcastList podcasts={filterPodcasts(load.podcasts, query)} />
        )}
      </section>
    </main>
  )
}
