import type { PodcastRepository, SearchPodcasts } from './types'

// Capa de lógica: aquí vive la regla de negocio de la búsqueda.
// Solo habla contra la interfaz `PodcastRepository`; no sabe qué fuente hay detrás.

/**
 * Regla: un término vacío (o solo espacios) no se pide a nadie y da una lista vacía;
 * en cualquier otro caso se envía el término sin los espacios de los extremos.
 */
export function createSearchPodcasts(repository: PodcastRepository): SearchPodcasts {
  return async (term, signal) => {
    const trimmed = term.trim()
    if (trimmed === '') return []
    return repository.search(trimmed, signal)
  }
}
