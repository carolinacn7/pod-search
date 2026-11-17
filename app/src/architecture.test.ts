// Guardia de fronteras: la pantalla y la lógica no pueden nombrar la fuente ni usar fetch.
// Lee el texto de los archivos (sin ejecutarlos) y busca esas palabras.
const sources = import.meta.glob('./*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const pantallaYLogica = [
  'App.tsx', 'SearchBox.tsx', 'PodcastList.tsx', 'PodcastCard.tsx',
  'filterPodcasts.ts', 'podcastSearch.ts', 'types.ts',
]
const sinComentarios = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

describe('fronteras de la arquitectura', () => {
  it.each(pantallaYLogica)('%s no nombra iTunes ni usa fetch', (file) => {
    const code = sources[`./${file}`]
    expect(code, `no se encontró ${file}`).toBeDefined()
    expect(sinComentarios(code)).not.toMatch(/itunes|apple|\bfetch\b/i)
  })

  it('solo compose.ts (y main.tsx a través de él) conecta la lógica con la fuente real', () => {
    const importan = (re: RegExp) =>
      Object.entries(sources)
        .filter(([file]) => !file.includes('.test.') && !file.includes('setupTests'))
        .filter(([, code]) => re.test(code))
        .map(([file]) => file)
        .sort()

    expect(importan(/from '\.\/itunes'/)).toEqual(['./compose.ts'])
    expect(importan(/from '\.\/podcastSearch'/)).toEqual(['./compose.ts'])
  })
})
