import React, { createContext, useContext, useEffect, useState } from 'react';
import BackendApi, { type UserDto } from '../service/BackendApi';

interface AuthContextType {
  user: UserDto | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  login: (credentials: {email: string, password: string}) => Promise<any>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (BackendApi.isAuthenticated()) {
        try {
          const userProfile = await BackendApi.getUserProfile();
          // Cast to UserDto and add roles
          const userWithRoles: UserDto = {
            ...userProfile,
            roles: BackendApi.getRoles(),
            createdAt: '',
            updatedAt: '',
          };
          setUser(userWithRoles);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          BackendApi.clearTokens();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: {email: string, password: string}) => {
    const response = await BackendApi.loginUser(credentials);
    const userProfile = await BackendApi.getUserProfile();
    const userWithRoles: UserDto = {
      ...userProfile,
      roles: BackendApi.getRoles(),
      createdAt: '',
      updatedAt: '',
    };
    setUser(userWithRoles);
    return response;
  };

  const register = async (data: { email: string; password: string; name: string }) => {
    await BackendApi.registerUser(data);
    const userProfile = await BackendApi.getUserProfile();
    const userWithRoles: UserDto = {
      ...userProfile,
      roles: BackendApi.getRoles(),
      createdAt: '',
      updatedAt: '',
    };
    setUser(userWithRoles);
  };

  const logout = () => {
    BackendApi.logoutUser();
    setUser(null);
  };

  const isAdmin = BackendApi.isAdmin();
  const isUser = BackendApi.isUser();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isUser,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};