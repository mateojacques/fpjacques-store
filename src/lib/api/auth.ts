import { apiClient } from './client';
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  UserProfile,
  ApiResponse,
  UpdateProfileInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@/types';

export const authApi = {
  /**
   * Register a new user
   */
  register: (data: RegisterInput) =>
    apiClient.post<AuthResponse>('/api/auth/register', data),

  /**
   * Login user
   */
  login: (data: LoginInput) =>
    apiClient.post<AuthResponse>('/api/auth/login', data),

  /**
   * Get current user profile
   */
  getProfile: () =>
    apiClient.get<ApiResponse<UserProfile>>('/api/auth/me'),

  /**
   * Update current user profile
   */
  updateProfile: (data: UpdateProfileInput) =>
    apiClient.put<ApiResponse<UserProfile>>('/api/auth/me', data),

  /**
   * Change password
   */
  changePassword: (data: ChangePasswordInput) =>
    apiClient.put<{ message: string }>('/api/auth/password', data),

  /**
   * Request a password reset link. Answers the same whether or not the email exists.
   */
  forgotPassword: (data: ForgotPasswordInput) =>
    apiClient.post<ApiResponse<{ message: string }>>('/api/auth/password/forgot', data),

  /**
   * Set a new password with the token from the reset link
   */
  resetPassword: (data: ResetPasswordInput) =>
    apiClient.post<ApiResponse<{ message: string }>>('/api/auth/password/reset', data),
};
