import { render, screen, within } from '@testing-library/react'
import App from './App'
import { searchPodcasts } from './itunes'
import { appleResponse, stubFetchJson, stubFetchNetworkError } from './test/apple'

describe('App: la lista viene de la iTunes Search API', () => {
  it('al abrir busca un término en Apple una sola vez', async () => {
    const fetchMock = stubFetchJson(appleResponse)

    render(<App search={searchPodcasts} />)
    await screen.findAllByRole('listitem')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.hostname).toBe('itunes.apple.com')
    expect(url.searchParams.get('term')).toBeTruthy()
  })

  it('mientras llega la respuesta avisa que está cargando', async () => {
    stubFetchJson(appleResponse)

    render(<App search={searchPodcasts} />)

    expect(screen.getByRole('status')).toHaveTextContent('Cargando podcasts')
    await screen.findAllByRole('listitem')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('llena las tarjetas con los datos traducidos', async () => {
    stubFetchJson(appleResponse)

    render(<App search={searchPodcasts} />)

    const results = screen.getByRole('region', { name: 'Resultados' })
    expect(await within(results).findAllByRole('listitem')).toHaveLength(3)
    expect(within(results).getByRole('heading', { name: 'Conversaciones con Modelos' })).toBeInTheDocument()
    expect(within(results).getByText('Luis Herrera')).toBeInTheDocument()
    expect(within(results).getByText('128 episodios')).toBeInTheDocument()
    expect(within(results).getByAltText('Portada de Ética y Algoritmos')).toHaveAttribute(
      'src',
      'https://img.test/marta-100.jpg',
    )
  })

  it('si la red falla muestra un mensaje en español y no una página en blanco', async () => {
    stubFetchNetworkError()

    render(<App search={searchPodcasts} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos cargar los podcasts/i)
    expect(screen.getByRole('heading', { level: 1, name: 'Pod Search' })).toBeInTheDocument()
    expect(screen.getByLabelText('Buscar podcasts')).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('si Apple responde con error muestra el mismo mensaje', async () => {
    stubFetchJson({}, { ok: false, status: 500 })

    render(<App search={searchPodcasts} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos cargar los podcasts/i)
  })

  it('si Apple no devuelve resultados lo dice, sin mostrar error', async () => {
    stubFetchJson({ resultCount: 0, results: [] })

    render(<App search={searchPodcasts} />)

    expect(await screen.findByText(/no hay podcasts/i)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
