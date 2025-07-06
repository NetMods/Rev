import './assets/anotatemain.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AnotateApp from './anotateApp'

createRoot(document.getElementById('anotate:root')).render(
  <StrictMode>
    <AnotateApp />
  </StrictMode>
)
