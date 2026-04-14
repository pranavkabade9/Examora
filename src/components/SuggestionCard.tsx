import React from 'react';
import { motion } from 'motion/react';
import { Zap, Clock, Target, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Suggestion {
  type: 'optimization' | 'time' | 'revision' | 'focus' | 'priority';
  title: string;
  text: string;
  impact: 'high' | 'medium' | 'low';
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  className?: string;
  key?: React.Key;
}

export default function SuggestionCard({ suggestion, className }: SuggestionCardProps) {
  const getIcon = () => {
    switch (suggestion.type) {
      case 'optimization': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'time': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'revision': return <TrendingUp className="w-5 h-5 text-purple-400" />;
      case 'focus': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'priority': return <Target className="w-5 h-5 text-red-400" />;
      default: return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    }
  };

  const getImpactColor = () => {
    switch (suggestion.impact) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "glass-card p-4 flex gap-4 items-start relative overflow-hidden group transition-all",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
        {getIcon()}
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white/90">{suggestion.title}</h4>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider", getImpactColor())}>
            {suggestion.impact} Impact
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-white/60 leading-relaxed">{suggestion.text}</p>
      </div>
    </motion.div>
  );
}
