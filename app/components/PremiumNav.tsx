'use client'

import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { motion, HTMLMotionProps } from "framer-motion";
import { useState } from 'react';
import Link from 'next/link';

// Define proper motion component types with correct HTML props
const MotionDiv = motion.div as React.ComponentType<HTMLMotionProps<"div"> & { className?: string }>;
const MotionH2 = motion.h2 as React.ComponentType<HTMLMotionProps<"h2"> & { className?: string }>;

export default function PremiumNav() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgradeClick = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
        }),
      });
      
      const { sessionUrl } = await response.json();
      window.location.href = sessionUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-20">
      {user ? (
        <MotionDiv 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4"
        >
          <div className="flex flex-col items-end">
            {user.isPremium ? (
              <Link href="/premium-features">
                <MotionH2 
                  className="text-white text-sm font-bold mb-1 font-mono cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  ⭐ Premium Access
                </MotionH2>
              </Link>
            ) : (
              <Link href="/features">
                <MotionH2 
                  className="text-white text-sm font-bold mb-1 font-mono cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  ✨ Upgrade Available
                </MotionH2>
              </Link>
            )}
            <span className="text-white/90 text-sm font-sans">
              {user.email}
            </span>
          </div>
          <div className="flex gap-2">
            {!user.isPremium && (
              <MotionDiv
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="secondary"
                  onClick={handleUpgradeClick}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold shadow-lg"
                >
                  {loading ? 'Processing...' : 'Upgrade to Premium'}
                </Button>
              </MotionDiv>
            )}
            <MotionDiv
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="secondary"
                onClick={signOut}
                className="bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg"
              >
                Sign Out
              </Button>
            </MotionDiv>
          </div>
        </MotionDiv>
      ) : (
        <MotionDiv 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-end"
        >
          <Link href="/features">
            <MotionH2 
              className="text-white text-sm font-bold mb-1 font-mono cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              ✨ Want More Features?
            </MotionH2>
          </Link>
          <MotionDiv
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1"
          >
            <Button 
              variant="secondary"
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold shadow-lg"
            >
              {loading ? 'Signing In...' : 'Sign In for Premium'}
            </Button>
            <span className="text-xs text-gray-400">
              Required for premium features
            </span>
          </MotionDiv>
        </MotionDiv>
      )}
    </div>
  );
} 