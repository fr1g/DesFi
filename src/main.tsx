import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Router from './Router'
import { registerFontServiceWorker } from './registerFontServiceWorker'

registerFontServiceWorker()

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Router />
    </StrictMode>,
)
