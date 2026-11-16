import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('tiene la caja de búsqueda con su etiqueta, vacía al inicio', () => {
    render(<App />)
    expect(screen.getByLabelText('Buscar podcasts')).toHaveValue('')
  })

  it('muestra el aviso inicial en el espacio de resultados', () => {
    render(<App />)
    const results = screen.getByRole('region', { name: 'Resultados' })
    expect(results).toHaveTextContent('Escribe algo arriba para empezar a buscar.')
  })

  it('lo que se escribe se ve al instante en la caja', async () => {
    render(<App />)
    const input = screen.getByLabelText('Buscar podcasts')

    await userEvent.type(input, 'machine learning')

    expect(input).toHaveValue('machine learning')
  })

  it('todavía no tiene botón ni lista de resultados', () => {
    render(<App />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
