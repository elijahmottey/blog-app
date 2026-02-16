import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh');

    if (token && refreshToken) {
      // Store tokens with correct keys matching BackendApi
      localStorage.setItem('accessToken1', token);
      localStorage.setItem('refreshToken1', refreshToken);
      
      // Set far future expiration dates since we don't have them from OAuth2
      const accessExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      const refreshExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      localStorage.setItem('accessTokenExpiration1', accessExpiration.toISOString());
      localStorage.setItem('refreshTokenExpiration1', refreshExpiration.toISOString());
      
      // Force full page reload to dashboard to reinitialize auth state
      window.location.replace('/dashboard');
    } else {
      // No tokens, redirect to login
      window.location.replace('/auth/login?error=oauth2_failed');
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;