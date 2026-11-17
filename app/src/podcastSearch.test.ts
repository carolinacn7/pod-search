import { createSearchPodcasts } from './podcastSearch'
import type { Podcast, PodcastRepository } from './types'

const podcast: Podcast = { id: '1', title: 'Uno', author: 'Ana', imageUrl: 'https://img.test/1.jpg' }

// Repositorio falso: anota con qué se lo llamó y devuelve lo que se le indique. Sin red.
function fakeRepository(result: Podcast[] = [podcast]) {
  const calls: Array<{ term: string; signal?: AbortSignal }> = []
  const repository: PodcastRepository = {
    async search(term, signal) {
      calls.push({ term, signal })
      return result
    },
  }
  return { repository, calls }
}

describe('regla de búsqueda: término vacío', () => {
  it.each([['cadena vacía', ''], ['solo espacios', '   '], ['tabulaciones y saltos', ' \t\n ']])(
    '%s: no pide nada y devuelve lista vacía',
    async (_nombre, term) => {
      const { repository, calls } = fakeRepository()

      const result = await createSearchPodcasts(repository)(term)

      expect(result).toEqual([])
      expect(calls).toHaveLength(0)
    },
  )
})

describe('regla de búsqueda: término con texto', () => {
  it('envía el término sin espacios sobrantes en los extremos', async () => {
    const { repository, calls } = fakeRepository()

    await createSearchPodcasts(repository)('  machine learning \t')

    expect(calls.map((c) => c.term)).toEqual(['machine learning'])
  })

  it('conserva los espacios del interior del término', async () => {
    const { repository, calls } = fakeRepository()

    await createSearchPodcasts(repository)(' redes   neuronales ')

    expect(calls[0].term).toBe('redes   neuronales')
  })

  it('devuelve tal cual lo que responde el repositorio y le pasa la señal de cancelación', async () => {
    const resultado = [podcast]
    const { repository, calls } = fakeRepository(resultado)
    const { signal } = new AbortController()

    const result = await createSearchPodcasts(repository)('ia', signal)

    expect(result).toBe(resultado)
    expect(calls[0].signal).toBe(signal)
  })

  it('si el repositorio falla, el error llega a quien pidió la búsqueda', async () => {
    const repository: PodcastRepository = { search: () => Promise.reject(new Error('caída')) }

    await expect(createSearchPodcasts(repository)('ia')).rejects.toThrow('caída')
  })
})
