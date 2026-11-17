// Configuración de la app. Hay una única instancia, creada una vez al cargar el módulo,
// y congelada (también el objeto anidado): quien la pida recibe siempre ese mismo objeto
// y nadie puede cambiarle un valor.

export type AppConfig = {
  readonly itunes: {
    readonly searchUrl: string
  }
}

const config: AppConfig = Object.freeze({
  itunes: Object.freeze({
    searchUrl: 'https://itunes.apple.com/search',
  }),
})

export function getConfig(): AppConfig {
  return config
}
