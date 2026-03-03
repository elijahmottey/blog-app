import React, { createContext, useContext, useEffect, useState } from 'react';
import BackendApi, { type UserDto, type UserProfile } from '../service/BackendApi';
import { Roles } from "../enums/Roles.ts";
import { toast } from 'sonner'; // Assuming toast is available for notifications

interface AuthContextType {
  user: UserDto | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  login: (credentials: {email: string, password: string}) => Promise<any>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (BackendApi.isAuthenticated()) {
      try {
        const profileResp = await BackendApi.getUserProfile();
        const profile = profileResp.data;
        setUserProfile(profile);
        const userWithRoles: UserDto = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          description: profile.description,
          roles: BackendApi.getRoles(),
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        };
        setUser(userWithRoles);
      } catch (error) {
        console.error('Failed to fetch user profile during refresh:', error);
        BackendApi.clearTokens();
        setUser(null);
        setUserProfile(null);
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (BackendApi.isAuthenticated()) {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to fetch user profile during initialization:', error);
          BackendApi.clearTokens();
          setUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { email: string, password: string }) => {
    await BackendApi.loginUser(credentials);
    await refreshUser();
    return user;
  };

  const register = async (data: { email: string; password: string; name: string }) => {
    await BackendApi.registerUser(data);
    await refreshUser();
  };

  const logout = async () => {
    // Clear client-side state immediately
    setUser(null);
    setUserProfile(null);
    BackendApi.clearTokens(); // Clear local storage tokens

    try {
      // Attempt to invalidate token on the server, but don't block client-side logout if it fails
      await BackendApi.logoutUser();
      toast.success('Logged out successfully.');
    } catch (error) {
      console.error('Server-side logout error (may be due to expired token or network issue):', error);
      toast.info('Logged out locally. Server session may have already expired or could not be invalidated.');
    }
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            userProfile,
            isAuthenticated: !!user,
            isAdmin: (() => {
              return user?.roles?.includes(Roles.ADMIN) ?? false;
            })(),
            isUser: user?.roles?.includes(Roles.USER) ?? false,
            login,
            register,
            logout,
            loading,
            refreshUser,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};