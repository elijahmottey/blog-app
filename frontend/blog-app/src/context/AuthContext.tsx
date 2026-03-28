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
  login: (credentials: {email: string, password: string}) => Promise<UserDto>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<UserDto | null>;
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

  const refreshUser = async (): Promise<UserDto | null> => {
      try {
        const profileResp = await BackendApi.getUserProfile();
        const profile = profileResp.data;
        setUserProfile(profile);

        let roles = BackendApi.getRoles();
        if (roles.length === 0 && profile.role) {
            localStorage.setItem("roles1", JSON.stringify(profile.role));
            roles = BackendApi.getRoles();
        }

        const userWithRoles: UserDto = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          description: profile.description,
          roles: roles,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        };
        setUser(userWithRoles);
        return userWithRoles;
      } catch (error) {
        console.error('Failed to fetch user profile during refresh:', error);
        BackendApi.clearTokens();
        setUser(null);
        setUserProfile(null);
        return null;
      }
  };

  useEffect(() => {
    const initializeAuth = async () => {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to fetch user profile during initialization:', error);
        }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { email: string, password: string }) => {
    await BackendApi.loginUser(credentials);
    const refreshedUser = await refreshUser();
    if (!refreshedUser) {
        throw new Error("Login failed: Could not retrieve user profile.");
    }
    return refreshedUser;
  };

  const register = async (data: { email: string; password: string; name: string }) => {
    await BackendApi.registerUser(data);
    await refreshUser();
  };

  const logout = async () => {
    setUser(null);
    setUserProfile(null);
    BackendApi.clearTokens();

    try {
      await BackendApi.logoutUser();
      toast.success('Logged out successfully.');
    } catch (error) {
      console.error('Server-side logout error:', error);
      toast.info('Logged out locally. Server session may have already expired.');
    }
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            userProfile,
            isAuthenticated: !!user,
            isAdmin: user?.roles?.includes(Roles.ADMIN) ?? false,
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