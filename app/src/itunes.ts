import type { Podcast } from './types'

// Único lugar que conoce la forma de la iTunes Search API. El resto de la app solo ve `Podcast`.
// Doc: https://performance-partners.apple.com/search-api

type AppleResult = {
  collectionId?: number
  collectionName?: string
  artistName?: string
  artworkUrl100?: string
  trackCount?: number
}

const SEARCH_URL = 'https://itunes.apple.com/search'

export class PodcastSearchError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'PodcastSearchError'
  }
}

/** Traduce un resultado de Apple a nuestro modelo. Asume que ya pasó `isUsable`. */
export function toPodcast(apple: AppleResult): Podcast {
  return {
    id: String(apple.collectionId),
    title: apple.collectionName ?? '',
    author: apple.artistName ?? '',
    imageUrl: apple.artworkUrl100 ?? '',
    episodeCount: typeof apple.trackCount === 'number' ? apple.trackCount : undefined,
  }
}

// Sin id o sin título no hay tarjeta que valga la pena mostrar.
const isUsable = (r: AppleResult) => r.collectionId !== undefined && !!r.collectionName

export async function searchPodcasts(term: string, signal?: AbortSignal): Promise<Podcast[]> {
  const url = `${SEARCH_URL}?${new URLSearchParams({ term, media: 'podcast', entity: 'podcast', limit: '25' })}`

  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch (cause) {
    // Un abort lo decide quien llama (p. ej. al desmontar): se deja pasar tal cual.
    if (signal?.aborted) throw cause
    throw new PodcastSearchError('No se pudo conectar con iTunes', { cause })
  }

  if (!response.ok) throw new PodcastSearchError(`iTunes respondió ${response.status}`)

  let body: { results?: unknown }
  try {
    body = await response.json()
  } catch (cause) {
    throw new PodcastSearchError('Respuesta de iTunes ilegible', { cause })
  }
  if (!body || !Array.isArray(body.results)) {
    throw new PodcastSearchError('Respuesta de iTunes con forma inesperada')
  }

  return (body.results as AppleResult[]).filter(isUsable).map(toPodcast)
}
