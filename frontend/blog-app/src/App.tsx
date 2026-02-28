// App.tsx - Updated to use ApiService methods
// @ts-ignore
import './App.css'
import './aria-fix.css'
import './styles/hover-effects.css'
import {PagesRoute} from "./page.tsx";
import {toast, Toaster} from "sonner";
import {useEffect} from "react";
import BackendApi from "./service/BackendApi.ts";
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeModeProvider } from './context/ThemeModeContext';
import CookieConsent from './components/CookieConsent';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  useEffect(() => {
    // Fetch CSRF token on app load
    const fetchToken = async () => {
      await BackendApi.fetchCsrfToken();
      // Add a small delay to allow the cookie to be set
      await new Promise(resolve => setTimeout(resolve, 100));
    };
    fetchToken();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <AuthProvider>
          <PagesRoute/>
          <CookieConsent />
          <Toaster
              richColors
              closeButton
              position="top-right"
              duration={4000}
              expand={true}
              visibleToasts={3}
          />
        </AuthProvider>
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}

export default App;