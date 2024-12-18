'use client';

import { useAuth } from '../context/AuthContext';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';

const MotionDiv = motion.div as React.ComponentType<HTMLMotionProps<"div"> & { className?: string }>;

const premiumFeatures = [
  {
    title: "⚡ Advanced Meme Matching",
    description: "Get more accurate and contextually relevant meme suggestions using our advanced AI algorithms."
  },
  {
    title: "🎯 Higher Accuracy",
    description: "Enhanced natural language processing for better understanding of article context and emotion."
  },
  {
    title: "🚀 Priority Processing",
    description: "Your requests are processed first, ensuring faster response times."
  },
  {
    title: "💫 Unlimited Searches",
    description: "No daily limits on article analysis and meme suggestions."
  },
  {
    title: "🎨 Custom Categories",
    description: "Access to exclusive meme categories and premium content."
  }
];

export default function PremiumFeaturesPage() {
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  useEffect(() => {
    // If user just signed in and there's a pending checkout, redirect to Stripe
    if (user && pendingCheckout) {
      handleStripeCheckout();
      setPendingCheckout(false);
    }
  }, [user, pendingCheckout]);

  const handleStripeCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user!.uid,
          userEmail: user!.email,
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

  const handleUpgradeClick = async () => {
    if (!user) {
      setPendingCheckout(true);
      setLoading(true);
      try {
        await signInWithGoogle();
      } catch (error) {
        setPendingCheckout(false);
        console.error('Sign in error:', error);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    await handleStripeCheckout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">
            {user?.isPremium ? '⭐ Your Premium Features' : '✨ Premium Features'}
          </h1>
          <p className="text-xl text-gray-400">
            {user?.isPremium 
              ? 'Thank you for being a premium member! Here are all your exclusive features:'
              : 'Unlock these powerful features with a premium subscription:'}
          </p>
        </MotionDiv>

        <div className="grid gap-8">
          {premiumFeatures.map((feature, index) => (
            <MotionDiv
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20"
            >
              <h2 className="text-2xl font-bold mb-2">{feature.title}</h2>
              <p className="text-gray-300">{feature.description}</p>
            </MotionDiv>
          ))}
        </div>

        {!user?.isPremium && (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Button 
              onClick={handleUpgradeClick}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg"
            >
              {loading ? 'Processing...' : user ? 'Upgrade to Premium' : 'Sign In to Upgrade'}
            </Button>
          </MotionDiv>
        )}
      </div>
    </div>
  );
} 