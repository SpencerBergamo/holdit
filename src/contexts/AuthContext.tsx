import supabase from '@/utils/supabase';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  upgradeGuestAccount: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isGuest: false,
  isLoading: true,
  signOut: async () => { },
  continueAsGuest: async () => { },
  upgradeGuestAccount: async () => ({ success: false }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use only onAuthStateChange to avoid race conditions with storage locks
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Update guest status
      if (session?.user?.is_anonymous) {
        setIsGuest(true);
      } else if (session?.user) {
        setIsGuest(false);
      } else {
        setIsGuest(false);
      }

      // Mark loading complete on initial session
      if (event === 'INITIAL_SESSION') {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsGuest(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const continueAsGuest = async () => {
    try {
      console.log('Continuing as guest');
      // Check if signInAnonymously is available
      if (typeof supabase.auth.signInAnonymously !== 'function') {
        throw new Error(
          'Anonymous authentication is not available. Please ensure your Supabase project has anonymous auth enabled and you\'re using @supabase/supabase-js v2.39.0 or higher.'
        );
      }

      // Sign in anonymously with Supabase
      const { data, error } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            anonymous: true,
          },
        },
      });

      if (error) {
        console.error('Error creating anonymous session:', error);
        throw error;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setIsGuest(true);
      }
    } catch (error) {
      console.error('Error setting guest mode:', error);
      throw error;
    }
  };

  const upgradeGuestAccount = async (email: string, password: string) => {
    try {
      if (!session?.user?.is_anonymous) {
        return {
          success: false,
          error: 'No anonymous session to upgrade'
        };
      }

      // Update the anonymous user to a permanent user
      const { error } = await supabase.auth.updateUser({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // User is now upgraded, guest status will update via auth state change
      return { success: true };
    } catch (error) {
      console.error('Error upgrading guest account:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isGuest,
        isLoading,
        signOut,
        continueAsGuest,
        upgradeGuestAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
