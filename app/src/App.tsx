import { useState } from 'react'
import SearchBox from './SearchBox'

export default function App() {
  const [query, setQuery] = useState('')

  return (
    <main className="page">
      <h1>Pod Search</h1>
      <p className="subtitle">Encuentra podcasts sobre inteligencia artificial</p>

      <SearchBox value={query} onChange={setQuery} />
    </main>
  )
}
