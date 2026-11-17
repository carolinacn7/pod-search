import { render, screen } from '@testing-library/react'
import PodcastCard from './PodcastCard'
import type { Podcast } from './types'

const base: Podcast = { id: 'a', title: 'Mi Show', author: 'Una Autora', imageUrl: '/covers/cover-1.svg' }

describe('PodcastCard', () => {
  it('muestra título, autor y portada con texto alternativo', () => {
    render(<PodcastCard podcast={base} />)

    expect(screen.getByRole('heading', { name: 'Mi Show' })).toBeInTheDocument()
    expect(screen.getByText('Una Autora')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Portada de Mi Show' })).toHaveAttribute('src', '/covers/cover-1.svg')
  })

  it('cuenta episodios en singular y plural', () => {
    const { rerender } = render(<PodcastCard podcast={{ ...base, episodeCount: 1 }} />)
    expect(screen.getByText('1 episodio')).toBeInTheDocument()

    rerender(<PodcastCard podcast={{ ...base, episodeCount: 42 }} />)
    expect(screen.getByText('42 episodios')).toBeInTheDocument()
  })

  it('si no se sabe cuántos episodios hay, no inventa un número', () => {
    render(<PodcastCard podcast={base} />)
    expect(screen.queryByText(/episodio/i)).not.toBeInTheDocument()
  })
})
