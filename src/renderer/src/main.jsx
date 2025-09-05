import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'jotai'
import App from './app'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
  </StrictMode>
)
