import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { Toaster } from '@/components/ui/sonner'
import './index.css'
import './i18n'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
)

// PWA service worker registration
import { registerSW } from 'virtual:pwa-register'

registerSW({
  onNeedRefresh() {
    // Auto-update silently
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})
