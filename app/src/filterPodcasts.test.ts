import { filterPodcasts } from './filterPodcasts'
import type { Podcast } from './types'

const p = (id: string, title: string, author: string): Podcast => ({ id, title, author, imageUrl: '/x.svg' })
const lista = [
  p('1', 'Cuaderno de Aprendizaje Automático', 'Ana Ruiz'),
  p('2', 'Conversaciones con Modelos', 'Luis Herrera'),
  p('3', 'Ética y Algoritmos', 'Marta Solís'),
]
const ids = (ps: Podcast[]) => ps.map((x) => x.id)

describe('filterPodcasts', () => {
  it('con el término vacío o solo espacios devuelve todo', () => {
    expect(filterPodcasts(lista, '')).toEqual(lista)
    expect(filterPodcasts(lista, '   ')).toEqual(lista)
  })

  it('filtra por título', () => {
    expect(ids(filterPodcasts(lista, 'modelos'))).toEqual(['2'])
  })

  it('filtra por autor', () => {
    expect(ids(filterPodcasts(lista, 'marta'))).toEqual(['3'])
  })

  it('no distingue mayúsculas', () => {
    expect(ids(filterPodcasts(lista, 'LUIS'))).toEqual(['2'])
  })

  it('no distingue tildes, ni al escribir ni en los datos', () => {
    expect(ids(filterPodcasts(lista, 'etica'))).toEqual(['3'])
    expect(ids(filterPodcasts(lista, 'automático'))).toEqual(['1'])
    expect(ids(filterPodcasts(lista, 'solis'))).toEqual(['3'])
  })

  it('ignora los espacios de los extremos', () => {
    expect(ids(filterPodcasts(lista, '  ana  '))).toEqual(['1'])
  })

  it('si nada coincide devuelve una lista vacía', () => {
    expect(filterPodcasts(lista, 'zzzz')).toEqual([])
  })

  it('conserva el orden original y no modifica la lista de entrada', () => {
    const copia = [...lista]
    expect(ids(filterPodcasts(lista, 'a'))).toEqual(['1', '2', '3'])
    expect(lista).toEqual(copia)
  })
})
