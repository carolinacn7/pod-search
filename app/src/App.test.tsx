import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { searchPodcasts } from './itunes'
import { appleResponse, stubFetchJson } from './test/apple'

describe('App', () => {
  beforeEach(() => {
    stubFetchJson(appleResponse)
  })

  it('muestra el título "Pod Search"', () => {
    render(<App search={searchPodcasts} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Pod Search' })).toBeInTheDocument()
  })

  it('muestra un subtítulo debajo del título', () => {
    render(<App search={searchPodcasts} />)
    const title = screen.getByRole('heading', { level: 1 })
    const subtitle = screen.getByText(/podcasts sobre inteligencia artificial/i)
    expect(subtitle).toBeInTheDocument()
    expect(title.compareDocumentPosition(subtitle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('tiene la caja de búsqueda con su etiqueta, vacía al inicio', () => {
    render(<App search={searchPodcasts} />)
    expect(screen.getByLabelText('Buscar podcasts')).toHaveValue('')
  })

  it('muestra debajo de la caja la lista con los tres podcasts', async () => {
    render(<App search={searchPodcasts} />)
    const results = screen.getByRole('region', { name: 'Resultados' })
    expect(await within(results).findAllByRole('listitem')).toHaveLength(3)
    expect(within(results).getByRole('heading', { name: 'Ética y Algoritmos' })).toBeInTheDocument()
  })

  it('la tarjeta sin episodeCount no muestra "undefined"', async () => {
    render(<App search={searchPodcasts} />)
    await screen.findAllByRole('listitem')
    expect(screen.getByRole('region', { name: 'Resultados' })).not.toHaveTextContent('undefined')
  })

  it('lo que se escribe se ve al instante en la caja', async () => {
    render(<App search={searchPodcasts} />)
    const input = screen.getByLabelText('Buscar podcasts')

    await userEvent.type(input, 'machine learning')

    expect(input).toHaveValue('machine learning')
  })

  it('todavía no tiene botón de búsqueda', () => {
    render(<App search={searchPodcasts} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
