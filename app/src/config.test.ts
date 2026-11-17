import { getConfig } from './config'

describe('getConfig', () => {
  it('cada llamada devuelve la misma instancia, no una copia', () => {
    expect(getConfig()).toBe(getConfig())
    expect(getConfig().itunes).toBe(getConfig().itunes)
  })

  it('dos lugares que piden la config a la vez reciben exactamente la misma cosa', async () => {
    const [a, b] = await Promise.all([
      Promise.resolve().then(() => getConfig()),
      Promise.resolve().then(() => getConfig()),
    ])
    expect(a).toBe(b)
  })

  it('importar el módulo de nuevo no crea otra instancia', async () => {
    const again = await import('./config')
    expect(again.getConfig()).toBe(getConfig())
  })

  it('está congelada, incluido el objeto anidado', () => {
    expect(Object.isFrozen(getConfig())).toBe(true)
    expect(Object.isFrozen(getConfig().itunes)).toBe(true)
  })

  it('desde afuera no se puede cambiar, agregar ni borrar un valor', () => {
    const config = getConfig() as any
    const original = config.itunes.searchUrl

    expect(() => { config.itunes.searchUrl = 'https://otro.test' }).toThrow(TypeError)
    expect(() => { config.itunes = {} }).toThrow(TypeError)
    expect(() => { config.nuevo = 1 }).toThrow(TypeError)
    expect(() => { delete config.itunes }).toThrow(TypeError)

    expect(getConfig().itunes.searchUrl).toBe(original)
  })

  it('tiene la URL de búsqueda de iTunes', () => {
    expect(getConfig().itunes.searchUrl).toBe('https://itunes.apple.com/search')
  })
})
