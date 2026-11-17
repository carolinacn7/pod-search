import { render, screen } from '@testing-library/react'
import PodcastList from './PodcastList'
import { mockPodcasts } from './mockPodcasts'
import App from './App'

describe('PodcastList', () => {
  it('muestra una tarjeta por podcast', () => {
    render(<PodcastList podcasts={mockPodcasts} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(mockPodcasts.length)
    for (const p of mockPodcasts) {
      expect(screen.getByRole('heading', { name: p.title })).toBeInTheDocument()
    }
  })

  it('con una lista vacía no dibuja ninguna tarjeta', () => {
    render(<PodcastList podcasts={[]} />)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})

describe('App: lista de ejemplo', () => {
  it('muestra los podcasts de ejemplo dentro de la zona de resultados', () => {
    render(<App />)

    const results = screen.getByRole('region', { name: 'Resultados' })
    expect(results).toContainElement(screen.getAllByRole('listitem')[0])
    expect(screen.getAllByRole('listitem')).toHaveLength(mockPodcasts.length)
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(mockPodcasts.length)
  })
})
