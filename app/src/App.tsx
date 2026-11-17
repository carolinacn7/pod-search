import { useState } from 'react'
import SearchBox from './SearchBox'
import PodcastList from './PodcastList'
import { mockPodcasts } from './mockPodcasts'

export default function App() {
  const [query, setQuery] = useState('')

  return (
    <main className="page">
      <h1>Pod Search</h1>
      <p className="subtitle">Encuentra podcasts sobre inteligencia artificial</p>

      <SearchBox value={query} onChange={setQuery} />

      <section className="results" aria-label="Resultados">
        <p className="notice">Escribe algo arriba para empezar a buscar.</p>
        <PodcastList podcasts={mockPodcasts} />
      </section>
    </main>
  )
}
