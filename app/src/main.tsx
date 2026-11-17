import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { searchPodcasts } from './itunes'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App search={searchPodcasts} />
  </StrictMode>,
)
