import { filterPodcasts } from './filterPodcasts'
import { mockPodcasts } from './mockPodcasts'

const titles = (list: { title: string }[]) => list.map((p) => p.title)

describe('filterPodcasts', () => {
  it('con el término vacío devuelve todos los podcasts', () => {
    expect(filterPodcasts(mockPodcasts, '')).toEqual(mockPodcasts)
  })

  it('un término con solo espacios cuenta como vacío y devuelve todos', () => {
    expect(filterPodcasts(mockPodcasts, '   ')).toEqual(mockPodcasts)
  })

  it('coincide con una parte del título', () => {
    expect(titles(filterPodcasts(mockPodcasts, 'conversa'))).toEqual(['Conversaciones con Modelos'])
  })

  it('coincide con una parte del autor', () => {
    expect(titles(filterPodcasts(mockPodcasts, 'herrera'))).toEqual(['Conversaciones con Modelos'])
  })

  it('devuelve todos los que coinciden, en su orden original', () => {
    // "mo" está en "Modelos" y en "Algoritmos", pero no en el primero
    expect(titles(filterPodcasts(mockPodcasts, 'mo'))).toEqual([
      'Conversaciones con Modelos',
      'Ética y Algoritmos',
    ])
  })

  it('no distingue mayúsculas de minúsculas', () => {
    expect(titles(filterPodcasts(mockPodcasts, 'ÉTICA'))).toEqual(['Ética y Algoritmos'])
    expect(titles(filterPodcasts(mockPodcasts, 'luis HERRERA'))).toEqual(['Conversaciones con Modelos'])
  })

  it('no distingue tildes: sin tilde encuentra con tilde', () => {
    expect(titles(filterPodcasts(mockPodcasts, 'etica'))).toEqual(['Ética y Algoritmos'])
    expect(titles(filterPodcasts(mockPodcasts, 'automatico'))).toEqual(['Cuaderno de Aprendizaje Automático'])
    expect(titles(filterPodcasts(mockPodcasts, 'solis'))).toEqual(['Ética y Algoritmos'])
  })

  it('no distingue tildes: con tilde encuentra sin tilde', () => {
    // "Ruiz" y "Herrera" no llevan tilde en los datos; el término sí
    expect(titles(filterPodcasts(mockPodcasts, 'rüiz'))).toEqual(['Cuaderno de Aprendizaje Automático'])
    expect(titles(filterPodcasts(mockPodcasts, 'hérrera'))).toEqual(['Conversaciones con Modelos'])
  })

  it('si nada coincide devuelve una lista vacía', () => {
    expect(filterPodcasts(mockPodcasts, 'zzzz')).toEqual([])
  })

  it('no modifica la lista original', () => {
    const copia = [...mockPodcasts]
    filterPodcasts(mockPodcasts, 'etica')
    expect(mockPodcasts).toEqual(copia)
  })
})
