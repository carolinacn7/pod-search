// Pantallas de apoyo de la zona de resultados: cargando, sin resultados y error.
// Solo presentación; no saben de dónde vienen los datos.

const SKELETON_CARDS = 3

export function LoadingState() {
  return (
    <div className="state-loading">
      <p role="status" className="state-note">
        <span className="spinner" aria-hidden="true" />
        Cargando podcasts…
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

export function EmptyState({ term }: { term: string }) {
  return (
    <div className="state-box">
      <span className="state-icon" aria-hidden="true">🎧</span>
      <p className="state-title">No hay podcasts para mostrar.</p>
      <p className="state-hint">
        {term ? <>Sin resultados para «{term}». </> : null}
        Prueba con otra palabra o revisa la ortografía.
      </p>
    </div>
  )
}

export function ErrorState() {
  return (
    <div className="state-box state-error" role="alert">
      <span className="state-icon" aria-hidden="true">⚠️</span>
      <p className="state-title">No pudimos cargar los podcasts.</p>
      <p className="state-hint">
        Revisa tu conexión a internet e inténtalo de nuevo más tarde.
      </p>
    </div>
  )
}
