import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AnotateApp from './app'

createRoot(document.getElementById('anotate:root')).render(
  <StrictMode>
    <AnotateApp />
  </StrictMode>
)
