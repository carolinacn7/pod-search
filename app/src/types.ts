// Única definición de la forma de un podcast en la app.
// Los datos reales (que llegarán después) se adaptan a ESTA forma, no al revés.
export type Podcast = {
  id: string
  title: string
  author: string
  imageUrl: string
  /** Opcional: no todas las fuentes saben cuántos episodios tiene un show. */
  episodeCount?: number
}

/** Contrato de cualquier fuente de podcasts: la app solo conoce esto, no de dónde vienen los datos. */
export type SearchPodcasts = (term: string, signal?: AbortSignal) => Promise<Podcast[]>

/**
 * Puerto de salida de la lógica: lo que necesita del mundo exterior, sin saber de dónde viene.
 * Cada fuente real (una API, una base de datos, un archivo) implementa esto en su propio adaptador.
 */
export interface PodcastRepository {
  search(term: string, signal?: AbortSignal): Promise<Podcast[]>
}
