// Ayudas de test: respuestas con la forma real de la iTunes Search API y un fetch simulado.
// Nada de esto sale a internet.

export const appleResponse = {
  resultCount: 3,
  results: [
    {
      wrapperType: 'track',
      kind: 'podcast',
      collectionId: 101,
      collectionName: 'Cuaderno de Aprendizaje Automático',
      artistName: 'Ana Ruiz',
      artworkUrl100: 'https://img.test/ana-100.jpg',
      artworkUrl600: 'https://img.test/ana-600.jpg',
      trackCount: 128,
    },
    {
      wrapperType: 'track',
      kind: 'podcast',
      collectionId: 102,
      collectionName: 'Conversaciones con Modelos',
      artistName: 'Luis Herrera',
      artworkUrl100: 'https://img.test/luis-100.jpg',
      trackCount: 1,
    },
    {
      wrapperType: 'track',
      kind: 'podcast',
      collectionId: 103,
      collectionName: 'Ética y Algoritmos',
      artistName: 'Marta Solís',
      artworkUrl100: 'https://img.test/marta-100.jpg',
      // sin trackCount a propósito: Apple no siempre lo informa
    },
  ],
}

/** Reemplaza fetch por uno que responde `body` con JSON. Devuelve el espía para inspeccionar llamadas. */
export function stubFetchJson(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Reemplaza fetch por uno que falla como una caída de red. */
export function stubFetchNetworkError() {
  const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
