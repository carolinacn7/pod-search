import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { searchPodcasts } from './itunes'
import { appleResponse, stubFetchJson } from './test/apple'

const terms = (fetchMock: ReturnType<typeof stubFetchJson>) =>
  fetchMock.mock.calls.map((c) => new URL(c[0]).searchParams.get('term'))

describe('App: busca en Apple mientras se escribe', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  it('espera a que se deje de escribir y hace una sola búsqueda con el texto completo', async () => {
    const fetchMock = stubFetchJson(appleResponse)
    render(<App search={searchPodcasts} />)
    await screen.findAllByRole('listitem')

    await userEvent.type(screen.getByLabelText('Buscar podcasts'), 'ética')
    expect(fetchMock).toHaveBeenCalledTimes(1) // todavía no pasó el debounce

    await act(() => vi.advanceTimersByTimeAsync(500))
    expect(terms(fetchMock)).toHaveLength(2)
    expect(terms(fetchMock)[1]).toBe('ética')
  })

  it('al vaciar la caja vuelve al término inicial', async () => {
    const fetchMock = stubFetchJson(appleResponse)
    render(<App search={searchPodcasts} />)
    await screen.findAllByRole('listitem')
    const input = screen.getByLabelText('Buscar podcasts')

    await userEvent.type(input, 'ética')
    await act(() => vi.advanceTimersByTimeAsync(500))
    await userEvent.clear(input)
    await act(() => vi.advanceTimersByTimeAsync(0))

    expect(terms(fetchMock).at(-1)).toBe(terms(fetchMock)[0])
  })
})

describe('App: mientras llega la búsqueda nueva', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  it('la lista en pantalla se filtra localmente, sin datos del término anterior', async () => {
    const fetchMock = stubFetchJson(appleResponse)
    render(<App search={searchPodcasts} />)
    await screen.findAllByRole('listitem')

    // La siguiente búsqueda queda pendiente: no resuelve nunca.
    fetchMock.mockReturnValue(new Promise(() => {}))
    await userEvent.type(screen.getByLabelText('Buscar podcasts'), 'etica')
    await act(() => vi.advanceTimersByTimeAsync(500))

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const titles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(titles).toEqual(['Ética y Algoritmos'])
  })
})

describe('App: cuando llega la respuesta de Apple', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  it('muestra todo lo que devuelve Apple, sin filtrar localmente', async () => {
    stubFetchJson(appleResponse) // Apple responde 3 podcasts también para "etica"
    render(<App search={searchPodcasts} />)
    await screen.findAllByRole('listitem')

    await userEvent.type(screen.getByLabelText('Buscar podcasts'), 'etica')
    // Antes de que termine el debounce, la lista vieja se filtra localmente.
    expect(screen.getAllByRole('listitem')).toHaveLength(1)

    await act(() => vi.advanceTimersByTimeAsync(500))
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})
