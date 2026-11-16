import { PodcastSearchError, searchPodcasts, toPodcast } from './itunes'
import { appleResponse, stubFetchJson, stubFetchNetworkError } from './test/apple'

describe('toPodcast (Apple -> nuestro modelo)', () => {
  it('traduce los campos de Apple a los de Podcast', () => {
    expect(toPodcast(appleResponse.results[0])).toEqual({
      id: '101',
      title: 'Cuaderno de Aprendizaje Automático',
      author: 'Ana Ruiz',
      imageUrl: 'https://img.test/ana-100.jpg',
      episodeCount: 128,
    })
  })

  it('sin trackCount deja episodeCount sin definir', () => {
    expect(toPodcast(appleResponse.results[2]).episodeCount).toBeUndefined()
  })
})

describe('searchPodcasts', () => {
  it('pide a la iTunes Search API solo podcasts, con el término codificado', async () => {
    const fetchMock = stubFetchJson(appleResponse)

    await searchPodcasts('inteligencia artificial')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.origin + url.pathname).toBe('https://itunes.apple.com/search')
    expect(url.searchParams.get('term')).toBe('inteligencia artificial')
    expect(url.searchParams.get('media')).toBe('podcast')
    expect(url.searchParams.get('entity')).toBe('podcast')
  })

  it('devuelve los resultados ya traducidos a Podcast, en orden', async () => {
    stubFetchJson(appleResponse)

    const podcasts = await searchPodcasts('ia')

    expect(podcasts.map((p) => p.title)).toEqual([
      'Cuaderno de Aprendizaje Automático',
      'Conversaciones con Modelos',
      'Ética y Algoritmos',
    ])
    expect(podcasts[1]).toEqual({
      id: '102',
      title: 'Conversaciones con Modelos',
      author: 'Luis Herrera',
      imageUrl: 'https://img.test/luis-100.jpg',
      episodeCount: 1,
    })
  })

  it('ignora resultados sin id o sin título en vez de romper', async () => {
    stubFetchJson({
      resultCount: 3,
      results: [
        { artistName: 'Sin id', collectionName: 'Sin id', artworkUrl100: 'x' },
        { collectionId: 5, artistName: 'Sin título', artworkUrl100: 'x' },
        appleResponse.results[0],
      ],
    })

    const podcasts = await searchPodcasts('ia')

    expect(podcasts.map((p) => p.id)).toEqual(['101'])
  })

  it('si la red falla lanza PodcastSearchError', async () => {
    stubFetchNetworkError()
    await expect(searchPodcasts('ia')).rejects.toBeInstanceOf(PodcastSearchError)
  })

  it('si Apple responde con error HTTP lanza PodcastSearchError', async () => {
    stubFetchJson({}, { ok: false, status: 503 })
    await expect(searchPodcasts('ia')).rejects.toBeInstanceOf(PodcastSearchError)
  })

  it('si la respuesta no tiene la forma esperada lanza PodcastSearchError', async () => {
    stubFetchJson({ algo: 'raro' })
    await expect(searchPodcasts('ia')).rejects.toBeInstanceOf(PodcastSearchError)
  })
})
