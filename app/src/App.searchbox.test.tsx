import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App: caja de búsqueda', () => {
  it('muestra la caja de búsqueda en la pantalla principal', () => {
    render(<App />)
    expect(screen.getByLabelText('Buscar podcasts')).toBeInTheDocument()
  })

  it('la caja queda debajo del subtítulo', () => {
    render(<App />)
    const subtitle = screen.getByText(/podcasts sobre inteligencia artificial/i)
    const input = screen.getByLabelText('Buscar podcasts')
    expect(subtitle.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('empieza vacía y refleja lo que se escribe', async () => {
    render(<App />)
    const input = screen.getByLabelText('Buscar podcasts')
    expect(input).toHaveValue('')

    await userEvent.type(input, 'machine learning')

    expect(input).toHaveValue('machine learning')
  })

  it('todavía no tiene botón de búsqueda', () => {
    render(<App />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
