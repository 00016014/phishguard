'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '@/services/AuthService';

const AuthContext = createContext<any>({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        // Run CSRF seed and getMe in parallel — getMe is a GET, doesn't need the token
        const [, userData] = await Promise.all([
          AuthService.ensureCsrf(),
          AuthService.getMe(),
        ]);
        setUser(userData);
        if (userData) {
          // Fire-and-forget daily check-in on app load
          AuthService.dailyCheckIn();
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    try {
      const userData = await AuthService.login(username, password);
      setUser(userData);
      // Fire-and-forget daily check-in on login
      AuthService.dailyCheckIn();
      return userData;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    // Step 1: request OTP (does NOT create user yet)
    const username = metadata?.username || email.split('@')[0];
    const fullName = metadata?.fullName || '';
    const result = await AuthService.register(username, email, password, fullName);
    return result; // { detail, email }
  };

  const verifySignUpOtp = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const userData = await AuthService.verifyRegistrationOtp(email, otp);
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    const result = await AuthService.requestPasswordReset(email);
    return result;
  };

  const signOut = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const userData = await AuthService.getMe();
    if (userData) setUser(userData);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    verifySignUpOtp,
    resetPassword,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
