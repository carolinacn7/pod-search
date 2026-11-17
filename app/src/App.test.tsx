import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'

const item = (id: number, name: string, artist: string, trackCount?: number) => ({
  collectionId: id,
  collectionName: name,
  artistName: artist,
  artworkUrl600: `https://img.test/${id}.jpg`,
  trackCount,
})

function mockFetch(results: unknown[], ok = true) {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => ({ results }),
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

const results = () => screen.getByRole('region', { name: 'Resultados' })

afterEach(() => vi.unstubAllGlobals())

describe('App', () => {
  it('muestra título, subtítulo y caja de búsqueda vacía', async () => {
    mockFetch([])
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Pod Search' })).toBeInTheDocument()
    expect(screen.getByText(/podcasts sobre inteligencia artificial/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Buscar podcasts')).toHaveValue('')
    await screen.findByText('No encontramos podcasts.')
  })

  it('al cargar busca podcasts de IA en internet y los muestra', async () => {
    const fetchMock = mockFetch([item(1, 'IA Hoy', 'Ana', 12), item(2, 'Redes Neuronales', 'Luis')])
    render(<App />)

    expect(screen.getByText('Buscando…')).toBeInTheDocument()
    expect(await within(results()).findByRole('heading', { name: 'IA Hoy' })).toBeInTheDocument()
    expect(within(results()).getAllByRole('listitem')).toHaveLength(2)
    expect(results()).not.toHaveTextContent('undefined')

    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.origin + url.pathname).toBe('https://itunes.apple.com/search')
    expect(url.searchParams.get('term')).toBe('inteligencia artificial')
  })

  it('al escribir combina el término con el tema de IA', async () => {
    const fetchMock = mockFetch([item(1, 'IA Hoy', 'Ana')])
    render(<App />)
    await screen.findByText('IA Hoy')

    await userEvent.type(screen.getByLabelText('Buscar podcasts'), 'ética')

    await vi.waitFor(() => {
      const last = new URL(fetchMock.mock.calls.at(-1)![0])
      expect(last.searchParams.get('term')).toBe('ética inteligencia artificial')
    })
  })

  it('muestra un mensaje si la búsqueda falla', async () => {
    mockFetch([], false)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo completar/i)
  })
})
