import { useId } from 'react'

type SearchBoxProps = {
  value: string
  onChange: (value: string) => void
}

// Componente controlado: no guarda el texto; lo recibe y avisa al padre de cada cambio.
export default function SearchBox({ value, onChange }: SearchBoxProps) {
  const id = useId()
  return (
    <div className="search-box">
      <label htmlFor={id}>Buscar podcasts</label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej: machine learning"
        autoComplete="off"
      />
    </div>
  )
}
