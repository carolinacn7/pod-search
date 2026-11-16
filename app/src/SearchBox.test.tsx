import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBox from './SearchBox'

describe('SearchBox', () => {
  it('existe y se reconoce por su etiqueta visible', () => {
    render(<SearchBox value="" onChange={() => {}} />)

    const input = screen.getByLabelText('Buscar podcasts')
    expect(input).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Buscar podcasts' })).toBe(input)
    expect(screen.getByText('Buscar podcasts')).toBeVisible()
  })

  it('muestra el valor que le pasa el padre', () => {
    render(<SearchBox value="llm" onChange={() => {}} />)
    expect(screen.getByRole('searchbox')).toHaveValue('llm')
  })

  it('avisa al padre de lo que se escribe', async () => {
    const onChange = vi.fn()
    render(<SearchBox value="" onChange={onChange} />)

    await userEvent.type(screen.getByRole('searchbox'), 'ia')

    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenNthCalledWith(1, 'i')
    expect(onChange).toHaveBeenNthCalledWith(2, 'a')
  })

  it('no guarda el texto por su cuenta: si el padre no cambia el valor, no cambia', async () => {
    render(<SearchBox value="fijo" onChange={() => {}} />)

    await userEvent.type(screen.getByRole('searchbox'), 'xyz')

    expect(screen.getByRole('searchbox')).toHaveValue('fijo')
  })
})
