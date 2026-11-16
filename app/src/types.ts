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
