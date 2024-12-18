'use client';

import { useAuth } from '../context/AuthContext';
import { motion, HTMLMotionProps } from 'framer-motion';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';

const MotionDiv = motion.div as React.ComponentType<HTMLMotionProps<"div"> & { className?: string }>;

const features = [
  {
    title: "⚡ Advanced Meme Matching",
    description: "Get more accurate and contextually relevant meme suggestions using our advanced AI algorithms.",
    isPremium: true
  },
  {
    title: "✨ Basic Meme Suggestions",
    description: "Access to our basic meme suggestion engine.",
    isPremium: false
  },
  {
    title: "🎯 Higher Accuracy",
    description: "Enhanced natural language processing for better understanding of article context and emotion.",
    isPremium: true
  },
  {
    title: "🔍 Basic Article Analysis",
    description: "Simple analysis of article content.",
    isPremium: false
  },
  {
    title: "🚀 Priority Processing",
    description: "Your requests are processed first, ensuring faster response times.",
    isPremium: true
  },
  {
    title: "💫 Unlimited Searches",
    description: "No daily limits on article analysis and meme suggestions.",
    isPremium: true
  },
  {
    title: "📱 Mobile Friendly",
    description: "Access from any device, anywhere.",
    isPremium: false
  }
];

export default function FeaturesPage() {
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
          <h1 className="text-4xl font-bold mb-4">Features Overview</h1>
          <p className="text-xl text-gray-400 mb-8">
            Compare our free and premium features
          </p>
          <div className="inline-block bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-4 border border-purple-500/20">
            <p className="text-2xl font-bold">Premium Plan</p>
            <p className="text-4xl font-bold mt-2">$2<span className="text-lg text-gray-400">/month</span></p>
          </div>
        </MotionDiv>

        <div className="grid gap-6">
          {features.map((feature, index) => (
            <MotionDiv
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-xl p-6 border ${
                feature.isPremium 
                  ? "bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20" 
                  : "bg-gray-800/50 border-gray-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{feature.title}</h2>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
                {feature.isPremium && (
                  <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    PREMIUM
                  </span>
                )}
              </div>
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