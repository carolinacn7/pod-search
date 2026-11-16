import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

const results = () => screen.getByRole('region', { name: 'Resultados' })
const shownTitles = () => within(results()).queryAllByRole('heading').map((h) => h.textContent)

describe('App: la caja de búsqueda filtra la lista', () => {
  it('al escribir, la lista se reduce a los podcasts que coinciden', async () => {
    render(<App />)

    await userEvent.type(screen.getByLabelText('Buscar podcasts'), 'etica')

    expect(shownTitles()).toEqual(['Ética y Algoritmos'])
  })

  it('busca también por autor, sin importar mayúsculas', async () => {
    render(<App />)

    await userEvent.type(screen.getByLabelText('Buscar podcasts'), 'LUIS')

    expect(shownTitles()).toEqual(['Conversaciones con Modelos'])
  })

  it('al borrar el término vuelven todos los podcasts', async () => {
    render(<App />)
    const input = screen.getByLabelText('Buscar podcasts')

    await userEvent.type(input, 'etica')
    expect(within(results()).getAllByRole('listitem')).toHaveLength(1)

    await userEvent.clear(input)
    expect(within(results()).getAllByRole('listitem')).toHaveLength(3)
  })

  it('escribir solo espacios no vacía la lista', async () => {
    render(<App />)

    await userEvent.type(screen.getByLabelText('Buscar podcasts'), '   ')

    expect(within(results()).getAllByRole('listitem')).toHaveLength(3)
  })

  it('si nada coincide no queda ninguna tarjeta', async () => {
    render(<App />)

    await userEvent.type(screen.getByLabelText('Buscar podcasts'), 'zzzz')

    expect(within(results()).queryAllByRole('listitem')).toHaveLength(0)
  })
})
