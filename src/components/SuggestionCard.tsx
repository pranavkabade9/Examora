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
      case 'optimization': return <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'time': return <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'revision': return <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'focus': return <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'priority': return <Target className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default: return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
  };

  const getImpactColor = () => {
    switch (suggestion.impact) {
      case 'high': return 'bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "glass-card p-5 flex gap-5 items-start relative overflow-hidden group transition-all border border-slate-200 dark:border-white/10",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="w-12 h-12 rounded-2xl bg-slate-500/5 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10 group-hover:bg-blue-500/10 transition-colors">
        {getIcon()}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-black text-sm md:text-base text-slate-900 dark:text-white/90 uppercase tracking-tight">{suggestion.title}</h4>
          <span className={cn("text-[8px] md:text-[10px] px-2.5 py-1 rounded-lg border font-black uppercase tracking-widest whitespace-nowrap", getImpactColor())}>
            {suggestion.impact} Impact
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-500 dark:text-white/60 leading-relaxed font-medium">{suggestion.text}</p>
      </div>
    </motion.div>
  );
}
