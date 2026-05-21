import { api } from './client';
import {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  User,
} from '@/types/api';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  register: (req: RegisterRequest): Promise<AuthResponse> =>
    api.post('/api/auth/register', req),

  login: (req: LoginRequest): Promise<AuthResponse> =>
    api.post('/api/auth/login', req),

  me: (): Promise<User> => api.get('/api/auth/me'),

  changePassword: (req: ChangePasswordRequest): Promise<void> =>
    api.post('/api/auth/change-password', req),
};
