import { INITIAL_TERM } from './usePodcastSearch'

// Pantallas de apoyo de la zona de resultados: caja vacía, cargando, sin resultados y error.
// Solo presentación; no saben de dónde vienen los datos.

const SKELETON_CARDS = 3

export function IdleState() {
  return (
    <div className="state-box">
      <span className="state-icon" aria-hidden="true">🔎</span>
      <p className="state-title">Escribe algo para buscar podcasts.</p>
      <p className="state-hint">Los resultados anteriores se ocultan mientras la caja está vacía.</p>
    </div>
  )
}

export function LoadingState({ term }: { term: string }) {
  return (
    <div className="state-loading">
      <p role="status" className="state-note">
        <span className="spinner" aria-hidden="true" />
        {term === INITIAL_TERM ? 'Cargando podcasts…' : `Buscando «${term}»…`}
      </p>
      <div className="skeleton-list" aria-hidden="true">
        {Array.from({ length: SKELETON_CARDS }, (_, i) => (
          <div className="card skeleton" key={i}>
            <div className="sk-cover" />
            <div className="sk-lines">
              <div className="sk-line sk-title" />
              <div className="sk-line sk-author" />
              <div className="sk-line sk-meta" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

type EmptyStateProps = {
  term: string
  /** Salida: volver a la lista inicial. */
  onSeeAll: () => void
}

export function EmptyState({ term, onSeeAll }: EmptyStateProps) {
  return (
    <div className="state-box">
      <span className="state-icon" aria-hidden="true">🎧</span>
      <p className="state-title">No hay podcasts para mostrar.</p>
      <p className="state-hint">
        Sin resultados para «{term}». Prueba con otra palabra o revisa la ortografía.
      </p>
      {term !== INITIAL_TERM && (
        <button type="button" className="state-action" onClick={onSeeAll}>
          Ver podcasts de inteligencia artificial
        </button>
      )}
    </div>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="state-box state-error" role="alert">
      <span className="state-icon" aria-hidden="true">⚠️</span>
      <p className="state-title">No pudimos cargar los podcasts.</p>
      <p className="state-hint">Revisa tu conexión a internet e inténtalo de nuevo.</p>
      <button type="button" className="state-action" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  )
}
