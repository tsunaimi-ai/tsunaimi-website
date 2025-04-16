export * from '../../../types/auth';

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
}

export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
} 