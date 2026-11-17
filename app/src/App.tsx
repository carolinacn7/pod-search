import { useEffect, useState } from 'react'
import SearchBox from './SearchBox'
import PodcastList from './PodcastList'
import { searchPodcasts } from './searchPodcasts'
import type { Podcast } from './types'

const DEBOUNCE_MS = 400

type Status = 'loading' | 'ready' | 'error'

export default function App() {
  const [query, setQuery] = useState('')
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [status, setStatus] = useState<Status>('loading')

  // Busca al cargar y cada vez que cambia el texto (con una pequeña espera para
  // no lanzar una petición por tecla). Cancela la petición anterior si queda obsoleta.
  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    const timer = setTimeout(() => {
      searchPodcasts(query, controller.signal)
        .then((found) => {
          setPodcasts(found)
          setStatus('ready')
        })
        .catch((error) => {
          if (controller.signal.aborted) return
          console.error(error)
          setStatus('error')
        })
    }, query === '' ? 0 : DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return (
    <main className="page">
      <h1>Pod Search</h1>
      <p className="subtitle">Encuentra podcasts sobre inteligencia artificial</p>

      <SearchBox value={query} onChange={setQuery} />

      <section className="results" aria-label="Resultados" aria-busy={status === 'loading'}>
        {status === 'loading' && <p role="status">Buscando…</p>}
        {status === 'error' && (
          <p role="alert">No se pudo completar la búsqueda. Revisa tu conexión e inténtalo de nuevo.</p>
        )}
        {status === 'ready' && podcasts.length === 0 && <p role="status">No encontramos podcasts.</p>}
        {status === 'ready' && podcasts.length > 0 && <PodcastList podcasts={podcasts} />}
      </section>
    </main>
  )
}
