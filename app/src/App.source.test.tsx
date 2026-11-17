import { render, screen } from '@testing-library/react'
import App from './App'
import type { Podcast } from './types'

describe('App: no depende de iTunes', () => {
  it('muestra lo que devuelva la fuente que se le pasa, sin tocar la red', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const otra: Podcast[] = [{ id: 'x1', title: 'Otra Fuente', author: 'Alguien', imageUrl: 'https://img.test/x.jpg' }]
    const search = vi.fn().mockResolvedValue(otra)

    render(<App search={search} />)

    expect(await screen.findByRole('heading', { name: 'Otra Fuente' })).toBeInTheDocument()
    expect(search).toHaveBeenCalledWith(expect.any(String), expect.any(AbortSignal))
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
