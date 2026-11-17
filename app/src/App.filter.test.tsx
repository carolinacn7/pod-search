import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { searchPodcasts } from './itunes'
import { appleResponse, stubFetchJson } from './test/apple'

const results = () => screen.getByRole('region', { name: 'Resultados' })
const shownTitles = () => within(results()).queryAllByRole('heading').map((h) => h.textContent)

// Renderiza y espera a que lleguen los podcasts (simulados) antes de buscar en ellos.
async function renderLoaded() {
  render(<App search={searchPodcasts} />)
  await screen.findAllByRole('listitem')
}

describe('App: la caja de búsqueda filtra la lista', () => {
  beforeEach(() => {
    stubFetchJson(appleResponse)
  })

  it('al escribir, la lista se reduce a los podcasts que coinciden', async () => {
    await renderLoaded()

    await userEvent.type(screen.getByLabelText('Buscar podcasts'), 'etica')

    expect(shownTitles()).toEqual(['Ética y Algoritmos'])
  })

  it('busca también por autor, sin importar mayúsculas', async () => {
    await renderLoaded()

    await userEvent.type(screen.getByLabelText('Buscar podcasts'), 'LUIS')

    expect(shownTitles()).toEqual(['Conversaciones con Modelos'])
  })

  it('al borrar el término la lista se esconde y aparece el aviso de caja vacía', async () => {
    await renderLoaded()
    const input = screen.getByLabelText('Buscar podcasts')

    await userEvent.type(input, 'etica')
    expect(within(results()).getAllByRole('listitem')).toHaveLength(1)

    await userEvent.clear(input)
    expect(within(results()).queryAllByRole('listitem')).toHaveLength(0)
    expect(within(results()).getByText(/escribe algo para buscar/i)).toBeInTheDocument()
  })

  it('escribir solo espacios no vacía la lista', async () => {
    await renderLoaded()

    await userEvent.type(screen.getByLabelText('Buscar podcasts'), '   ')

    expect(within(results()).getAllByRole('listitem')).toHaveLength(3)
  })

  it('si nada coincide no queda ninguna tarjeta', async () => {
    await renderLoaded()

    await userEvent.type(screen.getByLabelText('Buscar podcasts'), 'zzzz')

    expect(within(results()).queryAllByRole('listitem')).toHaveLength(0)
  })
})
