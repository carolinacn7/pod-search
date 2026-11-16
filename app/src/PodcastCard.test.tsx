import { render, screen } from '@testing-library/react'
import PodcastCard from './PodcastCard'
import type { Podcast } from './types'

const base: Podcast = {
  id: 'x',
  title: 'Mi Show',
  author: 'Una Autora',
  imageUrl: '/covers/x.svg',
}

describe('PodcastCard', () => {
  it('muestra portada, título, autor y cantidad de episodios', () => {
    render(<PodcastCard podcast={{ ...base, episodeCount: 42 }} />)

    expect(screen.getByRole('img', { name: 'Portada de Mi Show' })).toHaveAttribute('src', '/covers/x.svg')
    expect(screen.getByRole('heading', { name: 'Mi Show' })).toBeInTheDocument()
    expect(screen.getByText('Una Autora')).toBeInTheDocument()
    expect(screen.getByText('42 episodios')).toBeInTheDocument()
  })

  it('usa el singular con 1 episodio', () => {
    render(<PodcastCard podcast={{ ...base, episodeCount: 1 }} />)
    expect(screen.getByText('1 episodio')).toBeInTheDocument()
  })

  it('si no viene la cantidad de episodios, no muestra esa línea ni "undefined"', () => {
    const { container } = render(<PodcastCard podcast={base} />)

    expect(screen.queryByText(/episodio/i)).not.toBeInTheDocument()
    expect(container).not.toHaveTextContent('undefined')
    expect(container).not.toHaveTextContent('NaN')
  })

  it('con 0 episodios (dato presente) sí muestra la línea', () => {
    render(<PodcastCard podcast={{ ...base, episodeCount: 0 }} />)
    expect(screen.getByText('0 episodios')).toBeInTheDocument()
  })
})
