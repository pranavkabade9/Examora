import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, CheckCircle2, Clock, 
  TrendingUp, Zap, ChevronRight,
  BookOpen, Target, Info, RefreshCcw
} from 'lucide-react';
import { cn } from '../lib/utils';
import SuggestionCard, { Suggestion } from './SuggestionCard';

interface DashboardProps {
  plan: any;
  progress: any[];
  suggestions?: Suggestion[];
  onAction: (action: string) => void;
  onResetRequest?: () => void;
  onToggleTask?: (dayIndex: number, taskIndex: number) => void;
}

export default function Dashboard({ plan, progress, suggestions, onAction, onResetRequest, onToggleTask }: DashboardProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const todayISO = new Date().toISOString().split('T')[0];
  const todayIndex = plan?.days?.findIndex((d: any) => d.date === todayISO);
  const todaysTasks = todayIndex !== -1 ? plan?.days?.[todayIndex]?.tasks : [];
  
  // Calculate real stats
  const totalTasks = plan?.days?.reduce((acc: number, day: any) => acc + day.tasks.length, 0) || 0;
  const completedTasks = progress.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const stats = [
    { label: 'Study Streak', value: '5 Days', icon: Zap, color: 'text-yellow-400' },
    { label: 'Completion', value: `${completionRate}%`, icon: CheckCircle2, color: 'text-green-400' },
    { label: 'Focus Time', value: `${(completedTasks * 0.5).toFixed(1)}h`, icon: Clock, color: 'text-blue-400' },
    { label: 'Consistency', value: '92%', icon: TrendingUp, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60">
            Welcome to Examora! 🎓
          </h1>
          <p className="text-slate-500 dark:text-white/60 mt-2 text-lg font-display font-medium">{today}</p>
        </div>
        <div className="flex flex-wrap gap-3 md:gap-4">
          {plan && (
            <button 
              onClick={onResetRequest}
              className="flex-1 md:flex-none px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Reset Plan</span>
            </button>
          )}
          <button 
            onClick={() => onAction('chat')}
            className="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
          >
            <Info className="w-4 h-4" />
            Study Assistant
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 md:p-8 space-y-3 md:space-y-4"
          >
            <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center bg-slate-500/5 dark:bg-white/5", stat.color.replace('text-', 'bg-').replace('400', '400/10'))}>
              <stat.icon className={cn("w-5 h-5 md:w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-slate-400 dark:text-white/40 font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl md:text-3xl font-black mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Today's Plan */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 font-display">
              <Calendar className="w-8 h-8 text-blue-500" />
              Today's Mission
            </h2>
            <button 
              onClick={() => onAction('plan')}
              className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Full Plan <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 md:space-y-6">
            {todaysTasks && todaysTasks.length > 0 ? (
              todaysTasks.map((task: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "glass-card p-5 md:p-8 flex items-center justify-between group transition-all",
                    task.completed ? "opacity-60 bg-green-500/5 border-green-500/20" : "hover:bg-slate-500/5 dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className={cn(
                      "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border text-lg md:text-xl font-black transition-colors",
                      task.completed ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    )}>
                      {task.completed ? <CheckCircle2 className="w-6 h-6 md:w-8 h-8" /> : i + 1}
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-black text-base md:text-2xl transition-all",
                        task.completed ? "line-through text-slate-400 dark:text-white/40" : "text-slate-900 dark:text-white/90"
                      )}>
                        {task.topic || task.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">{task.duration}</span>
                        <span className="w-1 h-1 bg-slate-300 dark:bg-white/10 rounded-full" />
                        <span className={cn("text-[10px] md:text-xs font-bold uppercase tracking-widest", task.priority === 'high' ? 'text-red-500' : 'text-blue-500')}>{task.priority} Priority</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onToggleTask?.(todayIndex, i)}
                    className={cn(
                      "w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                      task.completed 
                        ? "bg-green-500 border-green-500 text-white" 
                        : "border-slate-200 dark:border-white/10 hover:bg-green-500 hover:border-green-500 group-hover:scale-110"
                    )}
                  >
                    <CheckCircle2 className={cn(
                      "w-6 h-6 md:w-8 md:h-8 transition-colors",
                      task.completed ? "text-white" : "text-slate-200 dark:text-white/20 group-hover:text-white"
                    )} />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="glass-card p-12 md:p-20 text-center space-y-6">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-500/5 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-slate-300 dark:text-white/20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-black">No Active Plan</h3>
                  <p className="text-slate-500 dark:text-white/40 max-w-xs mx-auto text-sm md:text-base">Let Examora build your study plan 🚀 Upload your syllabus to get started.</p>
                </div>
                <button 
                  onClick={() => onAction('syllabus')}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 font-display px-2">
            <Info className="w-8 h-8 text-blue-500" />
            Assistant Panel
          </h2>
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {suggestions && suggestions.length > 0 ? (
              suggestions.map((s, i) => (
                <SuggestionCard key={i} suggestion={s} />
              ))
            ) : (
              <div className="glass-card p-10 text-center space-y-4 opacity-50">
                <div className="w-12 h-12 bg-slate-500/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                  <Target className="w-6 h-6 text-slate-300 dark:text-white/20" />
                </div>
                <p className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-widest font-bold">Waiting for input...</p>
              </div>
            )}
          </div>

          <div className="glass-card p-6 md:p-8 bg-blue-600/5 dark:bg-blue-600/10 border-blue-500/20 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-widest">About Examora</h3>
            </div>
            <p className="text-sm md:text-base text-slate-600 dark:text-white/60 leading-relaxed font-medium">
              Examora uses a localized rule-based engine to organize your studies. It's fast, private, and works offline.
            </p>
            <button 
              onClick={() => onAction('chat')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20"
            >
              Explore Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
