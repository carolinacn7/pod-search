import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('muestra el título "Pod Search"', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Pod Search' })).toBeInTheDocument()
  })

  it('muestra un subtítulo debajo del título', () => {
    render(<App />)
    const title = screen.getByRole('heading', { level: 1 })
    const subtitle = screen.getByText(/podcasts sobre inteligencia artificial/i)
    expect(subtitle).toBeInTheDocument()
    expect(title.compareDocumentPosition(subtitle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
