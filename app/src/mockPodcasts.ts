import type { Podcast } from './types'

// Datos de ejemplo mientras no hay una fuente real.
export const mockPodcasts: Podcast[] = [
  {
    id: '1',
    title: 'Cuaderno de Aprendizaje Automático',
    author: 'Ana Ruiz',
    imageUrl: '/covers/cover-1.svg',
    episodeCount: 128,
  },
  {
    id: '2',
    title: 'Conversaciones con Modelos',
    author: 'Luis Herrera',
    imageUrl: '/covers/cover-2.svg',
    episodeCount: 1,
  },
  {
    id: '3',
    title: 'Ética y Algoritmos',
    author: 'Marta Solís',
    imageUrl: '/covers/cover-3.svg',
    // sin episodeCount a propósito: la tarjeta no debe inventar un número
  },
]
