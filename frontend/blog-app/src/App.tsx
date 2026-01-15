// App.tsx - Updated to use ApiService methods
// @ts-ignore
import './App.css'
import {PagesRoute} from "./page.tsx";
import {toast, Toaster} from "sonner";
import {useEffect} from "react";
import BackendApi from "./service/BackendApi.ts";
;

function App() {
  useEffect(() => {
    const checkTokenExpiration = () => {
      const expiration = BackendApi.getAccessTokenExpiration();
      if (!expiration) return;

      const now = new Date();
      if (now >= expiration) {
        handleTokenExpiration();
        return null;
      }

      const remaining = expiration.getTime() - now.getTime();
      return setTimeout(handleTokenExpiration, remaining);
    };

    const handleTokenExpiration = () => {
      toast.error('Your session has expired. Please login again.');
      BackendApi.clearTokens();
      window.location.href = '/login';
    };

    const timer = checkTokenExpiration();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
      <>
        <PagesRoute/>
        <Toaster
            richColors
            closeButton
            position="top-right"
            duration={4000}
            expand={true}
            visibleToasts={3}
        />
      </>
  );
}

export default App;