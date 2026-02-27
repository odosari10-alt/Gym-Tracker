import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { DatabaseProvider } from './db/hooks/useDatabase'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DatabaseProvider>
        <App />
      </DatabaseProvider>
    </BrowserRouter>
  </StrictMode>,
)
