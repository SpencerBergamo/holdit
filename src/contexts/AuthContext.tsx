import React, { createContext, useContext, useState } from 'react';

// Placeholder types until Convex is integrated
type Session = null;
type User = null;

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
  const [session] = useState<Session | null>(null);
  const [user] = useState<User | null>(null);
  const [isGuest] = useState(false);
  const [isLoading] = useState(false);

  // TODO: Implement with Convex

  const signOut = async () => {
    // TODO: Implement with Convex
    console.log('Sign out - to be implemented with Convex');
  };

  const continueAsGuest = async () => {
    // TODO: Implement with Convex
    console.log('Continue as guest - to be implemented with Convex');
    throw new Error('Guest mode not yet implemented');
  };

  const upgradeGuestAccount = async (_email: string, _password: string) => {
    // TODO: Implement with Convex
    console.log('Upgrade guest account - to be implemented with Convex');
    return {
      success: false,
      error: 'Account upgrade not yet implemented'
    };
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
