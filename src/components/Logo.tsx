import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = "", showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-2xl' },
    lg: { icon: 'w-12 h-12', text: 'text-4xl' }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div 
        className={`${sizes[size].icon} relative flex items-center justify-center`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse" />
        
        {/* Abstract Spark / Arrow Icon */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full"
        >
          <path 
            d="M12 3L14.5 9H21L16 13L18 20L12 16L6 20L8 13L3 9H9.5L12 3Z" 
            className="fill-blue-400"
          />
          <path 
            d="M12 3L14.5 9H21L16 13L18 20L12 16L6 20L8 13L3 9H9.5L12 3Z" 
            className="stroke-white/20"
            strokeWidth="0.5"
          />
          <motion.path
            d="M12 6V14M12 14L9 11M12 14L15 11"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </svg>
      </motion.div>

      {showText && (
        <motion.span 
          className={`${sizes[size].text} font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 font-display`}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Examora
        </motion.span>
      )}
    </div>
  );
}
