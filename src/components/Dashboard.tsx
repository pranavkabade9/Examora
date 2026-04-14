import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, CheckCircle2, Clock, 
  TrendingUp, Zap, ChevronRight,
  BookOpen, Target, Sparkles, Bot,
  AlertCircle, RefreshCcw
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
    <div className="space-y-8 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-display">Welcome to Examora! 🎓</h1>
          <p className="text-slate-500 dark:text-white/60 mt-2 text-lg font-display">{today}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4">
          {plan && (
            <button 
              onClick={onResetRequest}
              className="px-4 md:px-6 py-2 md:py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/20 rounded-xl font-medium transition-all flex items-center gap-2 text-sm"
            >
              <RefreshCcw className="w-4 h-4 md:w-5 h-5" />
              <span className="hidden sm:inline">Start New Plan</span>
              <span className="sm:hidden">Reset</span>
            </button>
          )}
          <button 
            onClick={() => onAction('syllabus')}
            className="px-4 md:px-6 py-2 md:py-3 bg-slate-500/5 dark:bg-white/5 hover:bg-slate-500/10 dark:hover:bg-white/10 rounded-xl font-medium transition-all text-sm border border-slate-200 dark:border-white/10"
          >
            Update Syllabus
          </button>
          <button 
            onClick={() => onAction('chat')}
            className="px-4 md:px-6 py-2 md:py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all glow-blue flex items-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4 md:w-5 h-5" />
            AI Coach
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 md:p-6 space-y-1 md:space-y-2"
          >
            <stat.icon className={cn("w-5 h-5 md:w-6 h-6", stat.color)} />
            <p className="text-[10px] md:text-sm text-slate-400 dark:text-white/40 font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Today's Plan */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 font-display">
              <Calendar className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
              Today's Mission
            </h2>
            <button 
              onClick={() => onAction('plan')}
              className="text-xs md:text-sm text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Full Plan <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 md:space-y-4">
            {todaysTasks && todaysTasks.length > 0 ? (
              todaysTasks.map((task: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "glass-card p-4 md:p-6 flex items-center justify-between group transition-all",
                    task.completed ? "opacity-60 bg-green-500/5 border-green-500/20" : "hover:bg-slate-500/5 dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border text-sm md:text-base transition-colors",
                      task.completed ? "bg-green-500/20 text-green-400 border-green-500/20" : "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20"
                    )}>
                      {task.completed ? <CheckCircle2 className="w-5 h-5 md:w-6 h-6" /> : i + 1}
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-bold text-sm md:text-lg transition-all",
                        task.completed ? "line-through text-slate-400 dark:text-white/40" : "text-slate-900 dark:text-white/90"
                      )}>
                        {task.topic || task.name}
                      </h3>
                      <p className="text-[10px] md:text-sm text-slate-400 dark:text-white/40">{task.duration} • {task.priority} Priority</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onToggleTask?.(todayIndex, i)}
                    className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-full border flex items-center justify-center transition-all shrink-0",
                      task.completed 
                        ? "bg-green-500 border-green-500 text-white" 
                        : "border-slate-200 dark:border-white/10 hover:bg-green-500 hover:border-green-500"
                    )}
                  >
                    <CheckCircle2 className={cn(
                      "w-5 h-5 md:w-6 h-6 transition-colors",
                      task.completed ? "text-white" : "text-slate-200 dark:text-white/20 group-hover:text-white"
                    )} />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="glass-card p-8 md:p-12 text-center space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-500/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-slate-300 dark:text-white/20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg md:text-xl font-bold">No Active Plan</h3>
                  <p className="text-slate-400 dark:text-white/40 max-w-xs mx-auto text-xs md:text-sm">Let Examora build your study plan 🚀 Upload your syllabus to get started.</p>
                </div>
                <button 
                  onClick={() => onAction('syllabus')}
                  className="px-6 py-2 md:py-3 bg-slate-500/10 dark:bg-white/10 hover:bg-slate-500/20 dark:hover:bg-white/20 rounded-xl text-xs md:text-sm font-bold transition-all"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestions Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 font-display">
            <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-yellow-400" />
            Examora Insights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {suggestions && suggestions.length > 0 ? (
              suggestions.map((s, i) => (
                <SuggestionCard key={i} suggestion={s} />
              ))
            ) : (
              <div className="glass-card p-8 text-center space-y-4 opacity-50 col-span-full">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-500/5 dark:bg-white/5 rounded-xl flex items-center justify-center mx-auto animate-pulse">
                  <Target className="w-5 h-5 md:w-6 h-6 text-slate-300 dark:text-white/20" />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-widest">Analyzing your data...</p>
              </div>
            )}
          </div>

          <div className="glass-card p-5 md:p-6 bg-blue-600/10 border-blue-500/20 space-y-4">
            <h3 className="font-bold text-xs md:text-sm flex items-center gap-2">
              <Bot className="w-4 h-4 md:w-5 h-5 text-blue-400" />
              Examora AI Coach
            </h3>
            <p className="text-[10px] md:text-xs text-slate-500 dark:text-white/60 italic leading-relaxed">
              "You're most productive between 8 AM and 10 AM. Try tackling your hardest topics then for maximum retention! 🧠"
            </p>
            <button 
              onClick={() => onAction('chat')}
              className="w-full py-2 md:py-3 bg-blue-500 hover:bg-blue-600 text-white text-[10px] md:text-xs font-bold rounded-xl transition-all"
            >
              Talk to Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
