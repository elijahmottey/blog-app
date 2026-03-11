// App.tsx - Updated to use ApiService methods
// @ts-ignore
import './App.css'
import './aria-fix.css'
import './styles/hover-effects.css'
import {PagesRoute} from "./page.tsx";
import {toast, Toaster} from "sonner";
import {useEffect, useState} from "react";
import BackendApi from "./service/BackendApi.ts";
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeModeProvider } from './context/ThemeModeContext';
import CookieConsent from './components/CookieConsent';
import { NotificationProvider } from './context/NotificationContext';
import { Dialog, DialogContent, DialogTitle, DialogActions, Button, Typography, Box } from '@mui/material';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function SessionExpiredDialog() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    // Setup the listener
    BackendApi.setSessionExpiredHandler(() => {
        // Try to get username from local storage or context if possible, 
        // but since we're expired, we might just have stale data.
        // We'll rely on what was last known or just show a generic message if empty.
        const storedRoles = localStorage.getItem("roles1");
        // We could store username in localStorage on login if needed to display it here
        // For now let's just show the dialog
        setOpen(true);
    });
  }, []);

  const handleLoginRedirect = () => {
    setOpen(false);
    window.location.href = "/auth/login";
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => {}} // Force user to interact with buttons
      aria-labelledby="session-expired-dialog-title"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="session-expired-dialog-title" sx={{ textAlign: 'center', pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <LockClockOutlinedIcon sx={{ fontSize: 40, color: 'warning.main' }} />
            <Typography variant="h6" component="span">Session Expired</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
        <Typography variant="body1" color="text.secondary">
            Your session has expired. To continue accessing your account and features, please log in again.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        <Button 
            onClick={handleLoginRedirect} 
            variant="contained" 
            color="primary"
            fullWidth
            size="large"
        >
          Login Again
        </Button>
      </DialogActions>
    </Dialog>
  );
}

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
          <NotificationProvider>
            <PagesRoute/>
            <SessionExpiredDialog />
            <CookieConsent />
            <Toaster
                richColors
                closeButton
                position="top-right"
                duration={4000}
                expand={true}
                visibleToasts={3}
            />
          </NotificationProvider>
        </AuthProvider>
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}

export default App;