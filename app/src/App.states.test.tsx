import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { searchPodcasts } from './itunes'
import { appleResponse, stubFetchJson } from './test/apple'
import { INITIAL_TERM } from './usePodcastSearch'
import type { Podcast } from './types'

const podcast = (id: string, title: string): Podcast => ({
  id,
  title,
  author: 'Alguien',
  imageUrl: 'https://img.test/x.jpg',
})
const LISTA = [podcast('1', 'Uno'), podcast('2', 'Dos')]

const results = () => screen.getByRole('region', { name: 'Resultados' })
const box = () => screen.getByLabelText('Buscar podcasts')

// Los cinco momentos posibles de la zona de resultados. Debe verse exactamente uno.
function momentos() {
  const r = within(results())
  return {
    cajaVacia: !!r.queryByText(/escribe algo para buscar/i),
    buscando: !!r.queryByText(/^(Cargando podcasts|Buscando «)/),
    lista: r.queryAllByRole('listitem').length > 0,
    sinResultados: !!r.queryByText(/no hay podcasts para mostrar/i),
    error: !!r.queryByRole('alert'),
  }
}
const visibles = () => Object.entries(momentos()).filter(([, v]) => v).map(([k]) => k)

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
afterEach(() => vi.useRealTimers())

// Escribe algo, espera la espera de letras y a que lleguen los resultados.
async function buscar(text: string) {
  await userEvent.type(box(), text)
  await act(() => vi.advanceTimersByTimeAsync(500))
}

describe('momento 1: caja vacía', () => {
  it('muestra el aviso, esconde los resultados anteriores y no llama a la red', async () => {
    const fetchMock = stubFetchJson(appleResponse)
    render(<App search={searchPodcasts} />)
    await screen.findAllByRole('listitem')
    await buscar('etica')
    const llamadas = fetchMock.mock.calls.length

    await userEvent.clear(box())
    await act(() => vi.advanceTimersByTimeAsync(1000))

    expect(visibles()).toEqual(['cajaVacia'])
    expect(fetchMock).toHaveBeenCalledTimes(llamadas)
  })

  it('al volver a escribir no reaparecen los resultados anteriores', async () => {
    const search = vi.fn().mockResolvedValueOnce(LISTA).mockReturnValue(new Promise(() => {}))
    render(<App search={search} />)
    await screen.findAllByRole('listitem')
    await userEvent.type(box(), 'uno')
    await userEvent.clear(box())

    await userEvent.type(box(), 'u')

    expect(within(results()).queryAllByRole('listitem')).toHaveLength(0)
    expect(visibles()).toEqual(['buscando'])
  })

  it('al abrir la app sigue cargando la lista inicial (la caja nunca se tocó)', async () => {
    const search = vi.fn().mockResolvedValue(LISTA)
    render(<App search={search} />)

    expect(await screen.findAllByRole('listitem')).toHaveLength(2)
    expect(search).toHaveBeenCalledWith(INITIAL_TERM, expect.any(AbortSignal))
  })
})

describe('momento 2: buscando', () => {
  it('muestra un texto visible con lo que se busca', async () => {
    const search = vi.fn().mockResolvedValueOnce(LISTA).mockReturnValue(new Promise(() => {}))
    render(<App search={search} />)
    await screen.findAllByRole('listitem')

    await userEvent.type(box(), 'zzz{Enter}')

    expect(screen.getByRole('status')).toHaveTextContent('Buscando «zzz»…')
    expect(screen.getByRole('status')).toBeVisible()
    expect(visibles()).toEqual(['buscando'])
  })
})

describe('Enter busca al toque', () => {
  it('lanza la búsqueda sin esperar la espera de letras y no la repite después', async () => {
    const search = vi.fn().mockResolvedValue(LISTA)
    render(<App search={search} />)
    await screen.findAllByRole('listitem')
    expect(search).toHaveBeenCalledTimes(1)

    await userEvent.type(box(), 'ética{Enter}')

    expect(search).toHaveBeenCalledTimes(2)
    expect(search).toHaveBeenLastCalledWith('ética', expect.any(AbortSignal))

    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(search).toHaveBeenCalledTimes(2)
  })

  it('con la caja vaciada, Enter no busca nada', async () => {
    const search = vi.fn().mockResolvedValue(LISTA)
    render(<App search={search} />)
    await screen.findAllByRole('listitem')
    await userEvent.type(box(), 'a')
    await userEvent.clear(box())
    const llamadas = search.mock.calls.length

    await userEvent.type(box(), '{Enter}')

    expect(search).toHaveBeenCalledTimes(llamadas)
    expect(visibles()).toEqual(['cajaVacia'])
  })
})

describe('momento 3: sin resultados', () => {
  it('avisa con el término buscado y ofrece una salida que de verdad vuelve a la lista', async () => {
    const search = vi.fn(async (term: string) => (term === 'zzz' ? [] : LISTA))
    render(<App search={search} />)
    await screen.findAllByRole('listitem')

    await userEvent.type(box(), 'zzz{Enter}')

    expect(await screen.findByText(/no hay podcasts para mostrar/i)).toBeInTheDocument()
    expect(within(results()).getByText(/«zzz»/)).toBeInTheDocument()
    expect(visibles()).toEqual(['sinResultados'])
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /ver podcasts de inteligencia artificial/i }))

    expect(box()).toHaveValue(INITIAL_TERM)
    expect(await screen.findAllByRole('listitem')).toHaveLength(2)
    expect(search).toHaveBeenLastCalledWith(INITIAL_TERM, expect.any(AbortSignal))
    expect(visibles()).toEqual(['lista'])
  })
})

describe('momento 4: error con Reintentar', () => {
  it('muestra un mensaje legible y Reintentar vuelve a pedir lo mismo, de verdad', async () => {
    const search = vi
      .fn()
      .mockRejectedValueOnce(new Error('caída'))
      .mockResolvedValueOnce(LISTA)
    render(<App search={search} />)

    const alerta = await screen.findByRole('alert')
    expect(alerta).toHaveTextContent(/no pudimos cargar los podcasts/i)
    expect(visibles()).toEqual(['error'])
    expect(search).toHaveBeenCalledTimes(1)

    await userEvent.click(within(alerta).getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findAllByRole('listitem')).toHaveLength(2)
    expect(search).toHaveBeenCalledTimes(2)
    expect(search.mock.calls[1][0]).toBe(search.mock.calls[0][0])
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('si el reintento también falla, sigue el error (y se puede volver a intentar)', async () => {
    const search = vi.fn().mockRejectedValueOnce(new Error('a')).mockRejectedValueOnce(new Error('b')).mockResolvedValue(LISTA)
    render(<App search={search} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    expect(await screen.findAllByRole('listitem')).toHaveLength(2)
    expect(search).toHaveBeenCalledTimes(3)
  })

  it('Enter también reintenta cuando hay error con el mismo texto', async () => {
    const search = vi.fn().mockRejectedValueOnce(new Error('a')).mockResolvedValue(LISTA)
    render(<App search={search} />)
    await screen.findByRole('alert')

    await userEvent.type(box(), '{Enter}')

    expect(await screen.findAllByRole('listitem')).toHaveLength(2)
    expect(search).toHaveBeenCalledTimes(2)
  })
})

describe('los momentos no pueden contradecirse', () => {
  it('a lo largo de un recorrido completo siempre se ve exactamente uno', async () => {
    const search = vi.fn(async (term: string) => (term === 'zzz' ? [] : LISTA))
    render(<App search={search} />)
    const vistos: string[][] = [visibles()]

    await screen.findAllByRole('listitem')
    vistos.push(visibles())
    await userEvent.type(box(), 'zzz')
    vistos.push(visibles())
    await act(() => vi.advanceTimersByTimeAsync(500))
    vistos.push(visibles())
    await userEvent.clear(box())
    vistos.push(visibles())
    await userEvent.type(box(), 'uno{Enter}')
    vistos.push(visibles())
    await screen.findAllByRole('listitem')
    vistos.push(visibles())

    for (const v of vistos) expect(v).toHaveLength(1)
  })
})
