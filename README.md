# Pod Search

Buscador de podcasts sobre inteligencia artificial. Consulta la [iTunes Search API](https://performance-partners.apple.com/search-api) directamente desde el navegador: **no tiene backend ni necesita clave**.

Al abrir la app se llena la lista con la búsqueda «inteligencia artificial». Al escribir en la caja de búsqueda se consulta la fuente (con una pequeña espera tras la última tecla), y mientras llega la respuesta se filtra en local lo que ya estaba en pantalla. Hay estados de carga, de «sin resultados» y de error.

## Dos versiones en este repositorio

- **`index.html` (raíz):** la primera versión, de un solo archivo, hecha a partir de un pedido de una frase. Se abre directamente en el navegador. Además de buscar, ofrece sugerencias de búsqueda y permite ver los episodios de cada podcast.
- **`app/`:** la versión con React, Vite y TypeScript, con la lógica separada de la pantalla y cubierta por tests. Es la que describe el resto de este documento.

## Cómo arrancar la app

Requiere [Node.js](https://nodejs.org/). Desde la carpeta `app/`:

```bash
cd app
npm install
npm run dev     # arranca el servidor de desarrollo (Vite)
npm test        # ejecuta los tests una vez
```

Otros scripts disponibles: `npm run build` (compila y genera la versión de producción), `npm run preview` (sirve esa versión) y `npm run test:watch` (tests en modo vigilancia).

## Arquitectura

La app se divide en capas que dependen de contratos, no de la fuente concreta:

- **Pantalla** (`App.tsx`, `SearchBox.tsx`, `PodcastList.tsx`, `PodcastCard.tsx`, `ResultStates.tsx`): solo presentación. `App` recibe la función de búsqueda como propiedad y no sabe de dónde vienen los datos.
- **Lógica** (`usePodcastSearch.ts`, `podcastSearch.ts`, `filterPodcasts.ts`): el hook gestiona la búsqueda con espera, cancelación y estado de carga; `podcastSearch.ts` aplica la regla de negocio (un término vacío no se pide a nadie); `filterPodcasts.ts` filtra por título o autor sin distinguir mayúsculas ni tildes. Hablan contra el contrato `PodcastRepository` definido en `types.ts`.
- **Adaptador de iTunes** (`itunes.ts`, con la URL en `config.ts`): el único lugar que conoce la forma de la respuesta de Apple y la traduce al modelo `Podcast` de la app.
- **Punto de conexión** (`compose.ts`): el único sitio donde la lógica y el adaptador de iTunes se nombran juntos. `main.tsx` toma la función de búsqueda de ahí. Para cambiar de fuente solo se cambia el repositorio en ese archivo.

### Tests que vigilan las fronteras

`src/architecture.test.ts` lee el texto de los archivos y comprueba que:

- la pantalla y la lógica listadas en el test no mencionan iTunes ni Apple y no usan `fetch`;
- solo `compose.ts` importa `itunes.ts` y `podcastSearch.ts`.

El resto de los tests (junto a cada archivo, `*.test.ts(x)`) cubren la pantalla, el filtro, la búsqueda, el adaptador y la configuración.

## Sobre este proyecto

Este proyecto sigue el curso [ai-pilot-learning](https://github.com/gedu/ai-pilot-learning) de Eduardo Graciano, y está hecho en 10 pasos con ayuda de IA. El historial de commits (`step 01` … `step 10`) refleja ese recorrido.
