import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../utils/supabase/client';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { session, error } = await api.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name
        });
      }
    } catch (error) {
      console.log('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await api.signIn(email, password);
      if (error) {
        return { error };
      }
      
      if (data.session?.access_token) {
        setAccessToken(data.session.access_token);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name
        });
      }
      
      return {};
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await api.signup(email, password, name);
      if (result.error) {
        return { error: result.error };
      }
      
      // After signup, automatically sign in
      return await signIn(email, password);
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await api.signOut();
      setUser(null);
      setAccessToken(null);
    } catch (error) {
      console.log('Sign out error:', error);
    }
  };

  const value = {
    user,
    accessToken,
    loading,
    signIn,
    signUp,
    signOut
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