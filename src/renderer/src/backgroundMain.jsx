import './assets/backgroundmain.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import BackgroundApp from './backgroundApp'

createRoot(document.getElementById('background')).render(
  <StrictMode>
    <BackgroundApp />
  </StrictMode>
)
