import type { Podcast } from './types'

// Datos escritos a mano, solo para maquetar. Sin internet ni API.
export const mockPodcasts: Podcast[] = [
  {
    id: 'mock-1',
    title: 'Cuaderno de Aprendizaje Automático',
    author: 'Ana Ruiz',
    imageUrl: '/covers/cover-1.svg',
    episodeCount: 128,
  },
  {
    id: 'mock-2',
    title: 'Conversaciones con Modelos',
    author: 'Luis Herrera',
    imageUrl: '/covers/cover-2.svg',
    episodeCount: 1,
  },
  {
    id: 'mock-3',
    title: 'Ética y Algoritmos',
    author: 'Marta Solís',
    imageUrl: '/covers/cover-3.svg',
    // sin episodeCount a propósito: la fuente no lo informa
  },
]
