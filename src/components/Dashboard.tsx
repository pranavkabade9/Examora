import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, CheckCircle2, Clock, 
  TrendingUp, Zap, ChevronRight,
  BookOpen, Target, Info, RefreshCcw, FileText, Rocket
} from 'lucide-react';
import { cn } from '../lib/utils';

interface DashboardProps {
  user: any;
  syllabus: any;
  plan: any;
  progress: any[];
  onAction: (tab: string) => void;
  onToggleTask?: (dayIndex: number, taskIndex: number) => void;
  onResetRequest?: () => void;
  isGuest?: boolean;
}

export default function Dashboard({ user, syllabus, plan, progress, onAction, onResetRequest, onToggleTask }: DashboardProps) {
  const isDemoMode = plan?.id === 'demo-plan';
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
    <div className="space-y-8 md:space-y-12 pb-24 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-white/40 leading-tight"
          >
            Welcome, <br className="md:hidden" /> Master! <span className="inline-block grayscale-0 not-italic text-slate-900 dark:text-white transform hover:scale-110 transition-transform">🎓</span>
          </motion.h1>
          <p className="text-slate-500 dark:text-white/60 text-base md:text-xl font-display font-medium flex items-center gap-2">
            Focus and Consistency
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {plan && (
            <button 
              onClick={onResetRequest}
              className="w-full sm:w-auto px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-2xl font-black transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-sm"
            >
              <RefreshCcw className="w-4 h-4" />
              Reset Plan
            </button>
          )}
        </div>
      </div>

      {isDemoMode && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden group bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-blue-600/10 border border-blue-500/20 p-6 md:p-8 rounded-[2rem] flex flex-col md:row items-center justify-between gap-8 backdrop-blur-3xl"
        >
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left relative z-10">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 shrink-0 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <Rocket className="w-8 h-8 md:w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white">Demo Plan Active 🚀</h3>
              <p className="text-slate-500 dark:text-white/60 font-medium text-sm md:text-lg max-w-lg leading-relaxed">
                You're viewing a demo plan. Add your own syllabus to get started 🚀
              </p>
            </div>
          </div>
          <button 
            onClick={() => onAction('syllabus')}
            className="w-full md:w-auto px-10 py-5 bg-white dark:bg-white/10 hover:bg-slate-900 dark:hover:bg-white/20 text-slate-900 dark:text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.25em] transition-all shadow-2xl shadow-black/10 flex items-center justify-center gap-3 active:scale-95 group/btn"
          >
            Create My Plan
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 md:p-8 space-y-4 rounded-[2rem] border-slate-200/50 dark:border-white/5 shadow-xl shadow-black/[0.02]"
          >
            <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 duration-500", stat.color.replace('text-', 'bg-').replace('400', '400/10'))}>
              <stat.icon className={cn("w-6 h-6 md:w-7 h-7", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-slate-400 dark:text-white/40 font-black uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-2xl md:text-4xl font-black mt-1.5 tracking-tight font-display">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 space-y-8 md:space-y-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl md:text-4xl font-black flex items-center gap-4 font-display uppercase tracking-tight">
              <Calendar className="w-8 h-8 md:w-10 h-10 text-blue-500" />
              Active Mission
            </h2>
            <button 
              onClick={() => onAction('plan')}
              className="text-xs md:text-sm font-black uppercase tracking-[0.1em] text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors flex items-center gap-2 group"
            >
              Timeline <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="space-y-5 md:space-y-6">
            {todaysTasks && todaysTasks.length > 0 ? (
              todaysTasks.map((task: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "glass-card p-6 md:p-10 flex flex-col sm:row sm:items-center justify-between gap-6 group transition-all rounded-[2rem]",
                    task.completed ? "opacity-60 bg-green-500/5 border-green-500/20" : "hover:bg-blue-600/[0.02] dark:hover:bg-white/[0.02] border-slate-200/50 dark:border-white/5"
                  )}
                >
                  <div className="flex items-center gap-6 md:gap-8">
                    <div className={cn(
                      "w-14 h-14 md:w-20 md:h-20 rounded-[1.5rem] flex items-center justify-center border text-xl md:text-3xl font-black transition-all group-hover:scale-105 duration-500",
                      task.completed ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20" : "bg-blue-600/5 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-inner"
                    )}>
                      {task.completed ? <CheckCircle2 className="w-8 h-8 md:w-10 h-10" /> : i + 1}
                    </div>
                    <div className="space-y-1">
                      <h3 className={cn(
                        "font-black text-lg md:text-3xl transition-all font-display tracking-tight leading-tight",
                        task.completed ? "line-through text-slate-400 dark:text-white/40" : "text-slate-900 dark:text-white"
                      )}>
                        {task.topic || task.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-white/30 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                          <Clock className="w-3 h-3" />
                          {task.duration}
                        </span>
                        <span className={cn(
                          "text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full", 
                          task.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                        )}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onToggleTask?.(todayIndex, i)}
                    className={cn(
                      "w-full sm:w-20 sm:h-20 h-14 rounded-2xl sm:rounded-full border-2 flex items-center justify-center transition-all shrink-0 active:scale-90",
                      task.completed 
                        ? "bg-green-500 border-green-500 text-white shadow-xl shadow-green-500/30" 
                        : "border-slate-200 dark:border-white/10 hover:border-green-500 group-hover:bg-green-500/5 hover:text-green-500"
                    )}
                  >
                    <CheckCircle2 className={cn(
                      "w-6 h-6 md:w-10 md:h-10 transition-colors",
                      task.completed ? "text-white" : "text-slate-200 dark:text-white/20 group-hover:text-green-500"
                    )} />
                    <span className="sm:hidden ml-3 font-black text-xs uppercase tracking-widest">
                      {task.completed ? 'Completed' : 'Mark Done'}
                    </span>
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="grid grid-cols-1 gap-6 md:gap-8">
                <div 
                  onClick={() => onAction('syllabus')}
                  className="glass-card p-8 md:p-12 bg-blue-600/[0.02] hover:bg-blue-600/[0.04] border-blue-500/20 cursor-pointer group transition-all rounded-[2.5rem] shadow-xl shadow-black/[0.01]"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-8 text-center md:text-left">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mx-auto md:mx-0 group-hover:scale-110 transition-transform shadow-inner shadow-blue-500/5">
                      <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-4xl font-black font-display tracking-tight">Smart Syllabus Organizer</h3>
                      <p className="text-slate-500 dark:text-white/40 font-medium text-base md:text-lg">Organizes your syllabus into structured topics automatically.</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => onAction('syllabus')}
                  className="glass-card p-8 md:p-12 bg-purple-600/[0.02] hover:bg-purple-600/[0.04] border-purple-500/20 cursor-pointer group transition-all rounded-[2.5rem] shadow-xl shadow-black/[0.01]"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-8 text-center md:text-left">
                    <div className="w-20 h-20 bg-purple-500/10 rounded-[2rem] flex items-center justify-center mx-auto md:mx-0 group-hover:scale-110 transition-transform shadow-inner shadow-purple-500/5">
                      <Calendar className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-4xl font-black font-display tracking-tight">Auto Study Planner</h3>
                      <p className="text-slate-500 dark:text-white/40 font-medium text-base md:text-lg">Creates a balanced daily study schedule based on your time.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <h2 className="text-2xl md:text-4xl font-black flex items-center gap-4 font-display uppercase tracking-tight px-2">
            <Info className="w-8 h-8 md:w-10 h-10 text-blue-500" />
            Resources
          </h2>
          
          <div className="glass-card p-8 md:p-10 space-y-8 rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-white dark:from-white/[0.02] dark:to-transparent border-slate-200/50 dark:border-white/5">
            <div className="space-y-1">
              <h3 className="text-xl font-black uppercase tracking-tight">Curriculum Focus</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Topic Distribution</p>
            </div>
            
            <div className="space-y-6">
              {syllabus?.content ? Object.entries(syllabus.content).map(([category, topics]: any, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{category}</span>
                    <span className="text-xs font-black">{topics.length} Units</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${Math.min(100, (topics.length / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center opacity-30">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Data Locked</p>
                </div>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden group glass-card p-8 md:p-10 bg-blue-600/[0.04] dark:bg-blue-600/10 border-blue-500/20 space-y-8 rounded-[2.5rem]">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center shadow-inner">
                <Target className="w-7 h-7 text-blue-600 font-bold" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-widest font-display">Optimization</h3>
            </div>
            <p className="text-base md:text-lg text-slate-600 dark:text-white/60 leading-relaxed font-medium relative z-10">
              "Your current verified progress is {completionRate}%. Stay focused on the active timeline to maintain momentum."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
