'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, subscribeToUserPremiumStatus } from '../firebase/config';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';

interface User {
  uid: string;
  email: string | null;
  isPremium: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Set initial user state
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isPremium: false, // Default value
        });

        // Subscribe to premium status updates
        const unsubscribe = subscribeToUserPremiumStatus(firebaseUser.uid, (isPremium) => {
          setUser(currentUser => 
            currentUser ? { ...currentUser, isPremium } : null
          );
        });

        return () => unsubscribe();
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Don't show error for user-cancelled popup
      if (error.code !== 'auth/cancelled-popup-request') {
        console.error('Google sign-in error:', error);
        // You might want to add toast notification here for other errors
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 