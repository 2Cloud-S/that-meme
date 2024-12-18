'use client'

import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { motion, HTMLMotionProps } from "framer-motion";
import { useState } from 'react';

// Define proper motion component types with correct HTML props
const MotionDiv = motion.div as React.ComponentType<HTMLMotionProps<"div"> & { className?: string }>;
const MotionLi = motion.li as React.ComponentType<HTMLMotionProps<"li"> & { className?: string }>;

const features = {
  free: [
    "✨ Basic meme suggestions",
    "🔍 Article analysis",
    "📱 Mobile friendly",
  ],
  premium: [
    "⚡ Advanced meme matching",
    "🎯 Higher accuracy suggestions",
    "🚀 Priority processing",
    "💫 Unlimited searches",
    "🎨 Custom meme categories",
  ]
};

export default function SubscriptionPage() {
  const { user, signInWithGoogle } = useAuth();
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
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      if (!data.sessionUrl) {
        throw new Error('No checkout URL received');
      }

      window.location.href = data.sessionUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // Optionally add user feedback here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-400">Unlock the full potential of That Meme 9000</p>
        </MotionDiv>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4">Free</h2>
            <p className="text-3xl font-bold mb-8">$0<span className="text-lg font-normal text-gray-400">/month</span></p>
            <ul className="space-y-4 mb-8">
              {features.free.map((feature, index) => (
                <MotionLi
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-center text-gray-300"
                >
                  <span className="mr-2">{feature}</span>
                </MotionLi>
              ))}
            </ul>
            <Button
              variant="outline"
              className="w-full"
              disabled={true}
            >
              Current Plan
            </Button>
          </MotionDiv>

          {/* Premium Plan */}
          <MotionDiv
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20"
          >
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                RECOMMENDED
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Premium</h2>
            <p className="text-3xl font-bold mb-8">$2<span className="text-lg font-normal text-gray-400">/month</span></p>
            <ul className="space-y-4 mb-8">
              {features.premium.map((feature, index) => (
                <MotionLi
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex items-center text-gray-300"
                >
                  <span className="mr-2">{feature}</span>
                </MotionLi>
              ))}
            </ul>
            <Button
              onClick={handleUpgradeClick}
              disabled={loading || (user?.isPremium)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              {loading ? 'Processing...' : user?.isPremium ? 'Current Plan' : 'Upgrade to Premium'}
            </Button>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
} 