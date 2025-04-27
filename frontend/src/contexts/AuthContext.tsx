'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get storage based on remember me preference
const getStorage = (rememberMe: boolean) => rememberMe ? localStorage : sessionStorage;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize authentication state and check token expiration
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
      const tokenExpiry = localStorage.getItem('token_expiry') || sessionStorage.getItem('token_expiry');

      if (!accessToken) {
        setIsAuthenticated(false);
        return;
      }

      // Check if token is expired
      if (tokenExpiry && new Date().getTime() > parseInt(tokenExpiry)) {
        if (refreshToken) {
          try {
            await refreshToken();
          } catch (error) {
            console.error('Token refresh failed:', error);
            clearTokens();
            setIsAuthenticated(false);
          }
        } else {
          clearTokens();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, []);

  const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('token_expiry');
  };

  const storeTokens = (tokenData: TokenData, rememberMe: boolean) => {
    const storage = getStorage(rememberMe);
    const expiryTime = new Date().getTime() + (tokenData.expires_in * 1000);

    storage.setItem('access_token', tokenData.access_token);
    storage.setItem('token_expiry', expiryTime.toString());
    
    if (tokenData.refresh_token) {
      storage.setItem('refresh_token', tokenData.refresh_token);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      formData.append('grant_type', 'password');
      formData.append('scope', '');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const tokenData: TokenData = await response.json();
      storeTokens(tokenData, rememberMe);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      clearTokens();
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Logout failed');
      }

      clearTokens();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    const storedRefreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const formData = new URLSearchParams();
      formData.append('refresh_token', storedRefreshToken);
      formData.append('grant_type', 'refresh_token');

      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokenData: TokenData = await response.json();
      // Use the same storage as the original token
      const rememberMe = !!localStorage.getItem('refresh_token');
      storeTokens(tokenData, rememberMe);
    } catch (error) {
      console.error('Token refresh error:', error);
      clearTokens();
      setIsAuthenticated(false);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 