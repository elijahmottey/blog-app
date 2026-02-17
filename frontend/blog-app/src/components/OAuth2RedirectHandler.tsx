import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackendApi from '../service/BackendApi';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Fetch user profile to get role
        const response = await BackendApi.getUserProfile();
        const userRole = response.data.role;
        
        // Store role in localStorage
        localStorage.setItem('roles1', JSON.stringify(userRole));
        
        // Always redirect to /dashboard for all users
        navigate('/dashboard/posts', { replace: true });
      } catch (error) {
        console.error('OAuth2 redirect error:', error);
        navigate('/auth/login?error=oauth2_failed', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleRedirect();
  }, [navigate]);

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