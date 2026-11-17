import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

const results = () => screen.getByRole('region', { name: 'Resultados' })
const shownTitles = () => within(results()).queryAllByRole('heading').map((h) => h.textContent)
const box = () => screen.getByLabelText('Buscar podcasts')

describe('App: la caja de búsqueda filtra la lista', () => {
  it('al escribir, la lista se reduce a los podcasts que coinciden', async () => {
    render(<App />)

    await userEvent.type(box(), 'etica')

    expect(shownTitles()).toEqual(['Ética y Algoritmos'])
  })

  it('busca también por autor, sin importar mayúsculas', async () => {
    render(<App />)

    await userEvent.type(box(), 'LUIS')

    expect(shownTitles()).toEqual(['Conversaciones con Modelos'])
  })

  it('al borrar el término vuelven todos los podcasts', async () => {
    render(<App />)

    await userEvent.type(box(), 'etica')
    expect(within(results()).getAllByRole('listitem')).toHaveLength(1)

    await userEvent.clear(box())
    expect(within(results()).getAllByRole('listitem')).toHaveLength(3)
  })

  it('escribir solo espacios no vacía la lista', async () => {
    render(<App />)

    await userEvent.type(box(), '   ')

    expect(within(results()).getAllByRole('listitem')).toHaveLength(3)
  })

  it('si nada coincide no queda ninguna tarjeta', async () => {
    render(<App />)

    await userEvent.type(box(), 'zzzz')

    expect(within(results()).queryAllByRole('listitem')).toHaveLength(0)
  })
})
