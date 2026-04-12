import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, getSession, onAuthStateChange, signOut } from '../services/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch existing session on mount
    getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email ?? '',
          name: data.session.user.user_metadata?.name ?? data.session.user.email?.split('@')[0] ?? '',
        });
      }
      setLoading(false);
    });

    // Listen to auth state changes
    const subscription = onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
