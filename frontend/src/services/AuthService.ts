import { apiFetch, ensureCsrfToken, API_BASE_URL } from '@/lib/apiFetch';

export const AuthService = {
  async getMe() {
    try {
      const response = await apiFetch(`${API_BASE_URL}/users/me/`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Auth error:', error);
      return null;
    }
  },

  async login(username: string, password: string) {
    const response = await apiFetch(`${API_BASE_URL}/users/login/`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Invalid credentials');
    }
    return await response.json();
  },

  /** Step 1 of registration: validates & sends OTP. Returns { detail, email }. */
  async register(username: string, email: string, password: string, fullName: string) {
    const response = await apiFetch(`${API_BASE_URL}/users/register/`, {
      method: 'POST',
      body: JSON.stringify({ username, email, password, full_name: fullName }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Registration failed');
    }
    return await response.json(); // { detail, email }
  },

  /** Step 2 of registration: verify OTP and create account. Returns user data. */
  async verifyRegistrationOtp(email: string, otp: string) {
    const response = await apiFetch(`${API_BASE_URL}/users/verify_registration_otp/`, {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'OTP verification failed');
    }
    return await response.json();
  },

  /** Step 1 of password reset: sends OTP to email. */
  async requestPasswordReset(email: string) {
    const response = await apiFetch(`${API_BASE_URL}/users/request_password_reset/`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to send reset OTP');
    }
    return await response.json(); // { detail, email }
  },

  /** Step 2 of password reset: verify OTP and set new password. */
  async verifyResetOtp(email: string, otp: string, newPassword: string) {
    const response = await apiFetch(`${API_BASE_URL}/users/verify_reset_otp/`, {
      method: 'POST',
      body: JSON.stringify({ email, otp, new_password: newPassword }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'OTP verification failed');
    }
    return await response.json();
  },

  /** Legacy token-based reset confirm (kept for back-compat with old emails). */
  async resetPasswordConfirm(uid: string, token: string, newPassword: string) {
    const response = await apiFetch(`${API_BASE_URL}/users/reset_password/`, {
      method: 'POST',
      body: JSON.stringify({ uid, token, new_password: newPassword }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Password reset failed');
    }
    return await response.json();
  },

  async logout() {
    try {
      await apiFetch(`${API_BASE_URL}/users/logout/`, { method: 'POST' });
    } catch (e) {
      console.error('Logout request failed', e);
    }
  },

  async dailyCheckIn() {
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/daily_checkin/`, { method: 'POST' });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /** Explicitly seed the CSRF cookie (call at app startup) */
  ensureCsrf: ensureCsrfToken,
};
