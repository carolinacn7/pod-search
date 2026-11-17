import { searchPodcasts } from './compose'
import { appleResponse, stubFetchJson } from './test/apple'

// El cableado real: la regla de negocio delante del adaptador de iTunes (con fetch simulado).
describe('compose: la lógica conectada a la fuente real', () => {
  it('un término vacío no sale a la red y da lista vacía', async () => {
    const fetchMock = stubFetchJson(appleResponse)

    expect(await searchPodcasts('   ')).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('un término con texto sale a la red sin espacios sobrantes', async () => {
    const fetchMock = stubFetchJson(appleResponse)

    const result = await searchPodcasts('  ética ')

    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get('term')).toBe('ética')
    expect(result).toHaveLength(3)
  })
})
