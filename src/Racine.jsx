// Arbre de l'appli, partagé entre le navigateur (main.jsx) et le prérendu (scripts/prerender.mjs).
// Seul le routeur change : BrowserRouter côté navigateur, StaticRouter au prérendu.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { MotionConfig } from 'framer-motion'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'
import { LangueProvider, ParLangue } from './components/LangueContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function Racine({ Routeur, routeurProps }) {
  return (
    // reducedMotion="user" : respecte prefers-reduced-motion du visiteur pour
    // TOUTE animation Framer Motion du site, sans y repenser page par page.
    <MotionConfig reducedMotion="user">
      <Routeur {...routeurProps}>
        <LangueProvider>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <ParLangue><App /></ParLangue>
                <Toaster position="top-center" />
              </AuthProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </LangueProvider>
      </Routeur>
    </MotionConfig>
  )
}
