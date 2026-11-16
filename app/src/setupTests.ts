import '@testing-library/jest-dom/vitest'

// Red cerrada en todos los tests: si alguno llama a fetch sin simularlo, falla en voz alta
// en vez de salir a internet.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('Test sin fetch simulado: no se permite salir a internet'))),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})
