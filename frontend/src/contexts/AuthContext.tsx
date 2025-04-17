'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize authentication state from localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    setIsAuthenticated(!!accessToken);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    console.log('Login attempt with:', { email, rememberMe });
    setIsLoading(true);
    try {
      // Create form data as expected by FastAPI's OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', email);  // FastAPI expects 'username' field
      formData.append('password', password);
      formData.append('grant_type', 'password');  // Required by OAuth2
      formData.append('scope', '');  // Optional, but included for completeness

      console.log('Sending login request...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      console.log('Login response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login error:', errorData);
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful, storing tokens');
      
      // Store tokens
      localStorage.setItem('access_token', data.access_token);
      if (rememberMe && data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error caught:', error);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const formData = new URLSearchParams();
      formData.append('refresh_token', refreshToken);
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

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
    } catch (error) {
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