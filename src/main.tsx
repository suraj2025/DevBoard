import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,     // data stays fresh for 1 min — no refetch on every focus
      retry: 1,                  // retry failed requests once
    },
  },
})

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocs/browser')
    return  worker.start({
  onUnhandledRequest(request, print) {
    // only warn for /api/* requests, ignore everything else
    if (request.url.includes('/api/')) {
      print.warning()
    }
  },
})
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
})