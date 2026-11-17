import { itunesRepository } from './itunes'
import { createSearchPodcasts } from './podcastSearch'

// ÚNICO lugar donde la lógica y el mundo exterior se nombran juntos.
// Para cambiar de fuente mañana, se cambia el repositorio de esta línea y nada más.
export const searchPodcasts = createSearchPodcasts(itunesRepository)
