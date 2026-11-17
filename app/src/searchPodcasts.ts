import type { Podcast } from './types'

// API pública de búsqueda de iTunes: sin clave y con CORS abierto.
const ENDPOINT = 'https://itunes.apple.com/search'
const TOPIC = 'inteligencia artificial'

type ItunesResult = {
  collectionId: number
  collectionName: string
  artistName: string
  artworkUrl600?: string
  artworkUrl100?: string
  trackCount?: number
}

/** Adapta un resultado de iTunes a la forma `Podcast` de la app. */
function toPodcast(r: ItunesResult): Podcast {
  return {
    id: String(r.collectionId),
    title: r.collectionName,
    author: r.artistName,
    imageUrl: r.artworkUrl600 ?? r.artworkUrl100 ?? '',
    episodeCount: r.trackCount,
  }
}

/**
 * Busca podcasts de IA en internet. El término del usuario se combina con el
 * tema; si está vacío se muestran los podcasts de IA en general.
 */
export async function searchPodcasts(term: string, signal?: AbortSignal): Promise<Podcast[]> {
  const params = new URLSearchParams({
    media: 'podcast',
    entity: 'podcast',
    limit: '20',
    term: `${term.trim()} ${TOPIC}`.trim(),
  })
  const response = await fetch(`${ENDPOINT}?${params}`, { signal })
  if (!response.ok) throw new Error(`La búsqueda falló (HTTP ${response.status})`)
  const data: { results: ItunesResult[] } = await response.json()
  return data.results.map(toPodcast)
}
