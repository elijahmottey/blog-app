import React, { createContext, useContext, useEffect, useState } from 'react';
import BackendApi, { type UserDto, type UserProfile } from '../service/BackendApi';
import { Roles } from "../enums/Roles.ts";

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

  useEffect(() => {
    const initializeAuth = async () => {
      if (BackendApi.isAuthenticated()) {
        try {
          const profileResp = await BackendApi.getUserProfile();
          const profile = profileResp.data;
          setUserProfile(profile);
          const userWithRoles: UserDto = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            roles: BackendApi.getRoles(),
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
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

  const login = async (credentials: { email: string, password: string }) => {
    await BackendApi.loginUser(credentials);
    const profileResp = await BackendApi.getUserProfile();
    const profile = profileResp.data;
    setUserProfile(profile);
    const userWithRoles: UserDto = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      roles: BackendApi.getRoles(),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
    setUser(userWithRoles);
    return userWithRoles; // Return the user object
  };

  const register = async (data: { email: string; password: string; name: string }) => {
    await BackendApi.registerUser(data);
    const profileResp = await BackendApi.getUserProfile();
    const profile = profileResp.data;
    setUserProfile(profile);
    const userWithRoles: UserDto = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      roles: BackendApi.getRoles(),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
    setUser(userWithRoles);
  };

  const logout = () => {
    BackendApi.logoutUser();
    setUser(null);
    setUserProfile(null);
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            userProfile,
            isAuthenticated: !!user,
            isAdmin: user?.roles.includes('ADMIN' as Roles) ?? false,
            isUser: user?.roles.includes('USER' as Roles) ?? false,
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