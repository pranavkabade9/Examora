import React from 'react';
import { Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsButtonProps {
  onClick: () => void;
}

export default function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 z-[60] glass-card p-4 rounded-full shadow-2xl glow-blue border-white/20 bg-white/10 hover:bg-white/20 transition-all"
      aria-label="Open Settings"
    >
      <Settings className="w-6 h-6 text-white" />
    </motion.button>
  );
}
