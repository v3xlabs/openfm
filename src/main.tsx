import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { DataProvider } from './contexts/DataContext'
import AppWrapper from './components/AppWrapper'

// Create a new router instance
const router = createRouter({ routeTree })

// Create a query client with heavy caching configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours default
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days default
      retry: 3,
    },
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <AppWrapper router={router} />
      </DataProvider>
    </QueryClientProvider>
  </StrictMode>,
)
