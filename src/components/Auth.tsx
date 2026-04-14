import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { motion } from 'motion/react';
import { LogIn, Zap, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface AuthProps {
  onGuestLogin: () => void;
}

import Logo from './Logo';

export default function Auth({ onGuestLogin }: AuthProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('The sign-in popup was closed before completion. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Only one sign-in popup can be open at a time.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#050505] via-[#0a0a1a] to-[#050505]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 max-w-md w-full text-center space-y-8 relative overflow-hidden"
      >
        {/* Decorative glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative space-y-6">
          <div className="flex justify-center">
            <Logo size="lg" showText={false} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 font-display">
              Examora
            </h1>
            <p className="text-white/60 text-lg font-medium tracking-wide font-display">Your AI Study Coach</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-left"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200/80">{error}</p>
            </motion.div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 px-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Continue with Google
                </>
              )}
            </button>

            <button
              onClick={onGuestLogin}
              disabled={loading}
              className="w-full py-4 px-4 bg-white/5 text-white font-semibold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 border border-white/10 transition-all active:scale-[0.98] group"
            >
              <Sparkles className="w-5 h-5 text-blue-400 group-hover:animate-pulse" />
              Continue as Guest ⚡
            </button>
          </div>

          <p className="text-sm text-white/40">
            No sign-up needed. Try instantly.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
