import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // The backend has set the cookies. Now, update the frontend's auth state.
        await refreshUser();
        
        toast.success('Successfully logged in!');
        
        // Redirect to the dashboard or the intended page
        navigate('/dashboard/posts', { replace: true });
      } catch (error) {
        console.error('OAuth2 redirect error:', error);
        toast.error('Login failed. Please try again.');
        navigate('/auth/login?error=oauth2_failed', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleRedirect();
  }, [navigate, refreshUser]);

  if (!loading) return null;

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