import { act, fireEvent, render, screen } from '@testing-library/react'
import App from './App'
import { appleResponse } from './test/apple'

const terms = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.map((c) => new URL(c[0] as string).searchParams.get('term'))

const okResponse = (body: unknown) => ({ ok: true, status: 200, json: async () => body })

describe('App: búsqueda mientras se escribe', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('busca una sola vez cuando el usuario deja de teclear', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(appleResponse))
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    await act(() => vi.advanceTimersByTimeAsync(500))
    expect(fetchMock).toHaveBeenCalledTimes(1) // carga inicial

    const input = screen.getByLabelText('Buscar podcasts')
    for (const text of ['r', 'ro', 'rob', 'robo']) {
      fireEvent.change(input, { target: { value: text } })
      await act(() => vi.advanceTimersByTimeAsync(100)) // menos que la espera: se reinicia
    }
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await act(() => vi.advanceTimersByTimeAsync(500))
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(terms(fetchMock)[1]).toBe('robo')
  })

  it('mientras espera filtra localmente la lista que ya está en pantalla', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(appleResponse)))

    render(<App />)
    await act(() => vi.advanceTimersByTimeAsync(500))
    expect(screen.getAllByRole('listitem')).toHaveLength(3)

    fireEvent.change(screen.getByLabelText('Buscar podcasts'), { target: { value: 'luis' } })
    // Aún no pasó la espera: no hay nueva llamada, pero la lista ya está filtrada.
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByText('Luis Herrera')).toBeInTheDocument()
  })

  it('una respuesta vieja que llega tarde no pisa a la nueva', async () => {
    const resolvers: Array<(r: unknown) => void> = []
    const fetchMock = vi.fn().mockImplementation(
      () => new Promise((resolve) => resolvers.push(resolve)),
    )
    vi.stubGlobal('fetch', fetchMock)

    const mk = (id: number, name: string) => ({
      results: [{ collectionId: id, collectionName: name, artistName: 'X' }],
    })

    render(<App />)
    await act(() => vi.advanceTimersByTimeAsync(500)) // petición inicial pendiente

    fireEvent.change(screen.getByLabelText('Buscar podcasts'), { target: { value: 'nuevo' } })
    await act(() => vi.advanceTimersByTimeAsync(500)) // segunda petición pendiente
    expect(fetchMock).toHaveBeenCalledTimes(2)

    // Responde primero la nueva y después, tarde, la vieja.
    await act(async () => resolvers[1](okResponse(mk(2, 'Nuevo nuevo'))))
    await act(async () => resolvers[0](okResponse(mk(1, 'Viejo'))))

    expect(screen.getByText('Nuevo nuevo')).toBeInTheDocument()
    expect(screen.queryByText('Viejo')).not.toBeInTheDocument()
  })
})
