import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import BackgroundApp from './app'

createRoot(document.getElementById('background')).render(
  <StrictMode>
    <BackgroundApp />
  </StrictMode>
)
