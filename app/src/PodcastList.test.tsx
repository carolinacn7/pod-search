import { render, screen, within } from '@testing-library/react'
import PodcastList from './PodcastList'
import { mockPodcasts } from './mockPodcasts'

describe('mockPodcasts', () => {
  it('son tres, con ids distintos y los campos obligatorios completos', () => {
    expect(mockPodcasts).toHaveLength(3)
    expect(new Set(mockPodcasts.map((p) => p.id)).size).toBe(3)
    for (const p of mockPodcasts) {
      expect(p.title).toBeTruthy()
      expect(p.author).toBeTruthy()
      expect(p.imageUrl).toBeTruthy()
    }
  })

  it('al menos uno no trae episodeCount, para cubrir el caso opcional', () => {
    expect(mockPodcasts.some((p) => p.episodeCount === undefined)).toBe(true)
  })
})

describe('PodcastList', () => {
  it('pinta una tarjeta por podcast, cada una con portada, título y autor', () => {
    render(<PodcastList podcasts={mockPodcasts} />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    items.forEach((item, i) => {
      const p = mockPodcasts[i]
      expect(within(item).getByRole('img', { name: `Portada de ${p.title}` })).toBeInTheDocument()
      expect(within(item).getByRole('heading', { name: p.title })).toBeInTheDocument()
      expect(within(item).getByText(p.author)).toBeInTheDocument()
    })
  })

  it('solo muestra la línea de episodios en los que la tienen', () => {
    render(<PodcastList podcasts={mockPodcasts} />)
    const withCount = mockPodcasts.filter((p) => p.episodeCount !== undefined).length
    expect(screen.getAllByText(/episodios?$/)).toHaveLength(withCount)
  })
})
