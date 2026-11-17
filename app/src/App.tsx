import { useEffect, useState } from 'react'
import SearchBox from './SearchBox'
import PodcastList from './PodcastList'
import { filterPodcasts } from './filterPodcasts'
import { searchPodcasts } from './itunes'
import type { Podcast } from './types'

// Término con el que se llena la lista al abrir la app.
const INITIAL_TERM = 'inteligencia artificial'

// Tiempo de silencio tras la última tecla antes de buscar en la API.
const DEBOUNCE_MS = 400

type Load =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; podcasts: Podcast[] }

export default function App() {
  const [query, setQuery] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [load, setLoad] = useState<Load>({ status: 'loading' })

  // Cada tecla reinicia la espera; solo se actualiza el término cuando el usuario se detiene.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(query.trim()), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    // Con el cuadro vacío se vuelve al término inicial.
    searchPodcasts(debouncedTerm || INITIAL_TERM, controller.signal).then(
      (podcasts) => {
        // Una respuesta vieja (término ya cambiado) no debe pisar a la nueva.
        if (!controller.signal.aborted) setLoad({ status: 'ready', podcasts })
      },
      () => {
        if (!controller.signal.aborted) setLoad({ status: 'error' })
      },
    )
    // Al cambiar el término (o desmontar) se cancela la petición anterior. La lista
    // actual se conserva mientras tanto y se filtra localmente con `query`.
    return () => controller.abort()
  }, [debouncedTerm])

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
