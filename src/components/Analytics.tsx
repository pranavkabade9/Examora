import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Brain, TrendingUp, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface AnalyticsProps {
  plan: any;
  progress: any[];
}

export default function Analytics({ plan, progress }: AnalyticsProps) {
  // Calculate real data for charts
  const totalTasks = plan?.days?.reduce((acc: number, day: any) => acc + day.tasks.length, 0) || 0;
  const completedTasksCount = progress.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Weekly progress data
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weeklyData = last7Days.map(date => {
    const count = progress.filter(p => p.completedAt?.startsWith(date)).length;
    return {
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      tasks: count
    };
  });

  // Topic distribution
  const topics = plan?.days?.flatMap((d: any) => d.tasks) || [];
  const uniqueTopics = Array.from(new Set(topics.map((t: any) => t.topic)));
  const topicStats = uniqueTopics.slice(0, 5).map(topic => {
    const total = topics.filter((t: any) => t.topic === topic).length;
    const completed = progress.filter(p => p.topic === topic).length;
    return {
      name: topic as string,
      score: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  });
  return (
    <div className="space-y-8 md:space-y-12 pb-32 lg:pb-0">
      <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white font-display px-1 uppercase tracking-tighter">Performance</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-8 md:p-14 space-y-10 md:space-y-14 relative overflow-hidden rounded-[2.5rem]">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/[0.03] blur-[100px] rounded-full pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative z-10">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-4xl font-black flex items-center gap-4 font-display uppercase tracking-tight">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                Momentum
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-12">Active Learning Velocity</p>
            </div>
            <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/5 min-w-[160px] text-center">
              <p className="text-4xl md:text-6xl font-black text-blue-600 font-display leading-none">{completedTasksCount}</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3">Units Verified</p>
            </div>
          </div>
          <div className="h-[250px] md:h-[400px] w-full mt-4 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-white/5" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="currentColor" 
                  className="text-slate-400 dark:text-white/20" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={15}
                  dx={0}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgb(15, 23, 42)', 
                    border: 'none', 
                    borderRadius: '24px', 
                    fontSize: '12px',
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                    padding: '16px'
                  }}
                  itemStyle={{ color: 'white', fontWeight: '900' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="#3b82f6" 
                  strokeWidth={6} 
                  fillOpacity={1} 
                  fill="url(#colorTasks)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="glass-card p-8 md:p-14 space-y-10 rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-white dark:from-white/[0.02] dark:to-transparent">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-4 font-display uppercase tracking-tight">
              <Brain className="w-8 h-8 text-purple-600" />
              Mastery
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-12">Cognitive Weights</p>
          </div>
          <div className="space-y-8">
            {topicStats.length > 0 ? topicStats.map((topic, i) => (
              <motion.div 
                key={topic.name} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-end">
                  <span className="text-[10px] md:text-xs font-black text-slate-400 dark:text-white/40 uppercase tracking-[0.2em]">{topic.name}</span>
                  <span className="font-black text-sm md:text-lg text-slate-900 dark:text-white">{topic.score}%</span>
                </div>
                <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.score}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className={cn(
                      "h-full rounded-full shadow-lg",
                      topic.score < 50 ? 'bg-red-500' : topic.score < 80 ? 'bg-blue-500' : 'bg-green-500'
                    )}
                  />
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center space-y-4 opacity-40">
                <Brain className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-xs font-black uppercase tracking-widest">Awaiting Neural Data...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Critical Areas */}
        <div className="glass-card p-8 md:p-14 space-y-10 rounded-[2.5rem] border-red-500/10">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-4 font-display text-red-600 uppercase tracking-tight">
              <AlertTriangle className="w-8 h-8" />
              Focus
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-12">Actionable Weaknesses</p>
          </div>
          <div className="space-y-6">
            {topicStats.filter(t => t.score < 50).length > 0 ? topicStats.filter(t => t.score < 50).map((item, i) => (
              <motion.div 
                key={i} 
                whileHover={{ x: 10 }}
                className="p-6 bg-red-500/5 border border-red-500/10 rounded-[1.5rem] flex items-center justify-between group transition-all"
              >
                <div className="space-y-1">
                  <p className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                  <p className="text-[10px] text-red-600 dark:text-red-400/60 font-black uppercase tracking-[0.2em]">Priority Re-Evaluation Required</p>
                </div>
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center font-black text-red-600">
                  {item.score}%
                </div>
              </motion.div>
            )) : (
              <div className="py-14 text-center space-y-4 opacity-30">
                <div className="w-16 h-16 bg-green-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-green-500">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-[0.3em]">No Critical Drift Detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Milestones */}
        <div className="glass-card p-8 md:p-14 space-y-10 rounded-[2.5rem] border-green-500/10">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-4 font-display text-green-600 uppercase tracking-tight">
              <Award className="w-8 h-8" />
              Impact
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-12">Behavioral Milestones</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: 'Early Bird', desc: 'Pre-7AM Session', icon: '🌅', color: 'text-orange-500' },
              { label: 'Hyper Focus', desc: 'No-Break Streak', icon: '⚡', color: 'text-blue-500' },
              { label: 'Topic King', desc: '100% Mastery', icon: '👑', color: 'text-yellow-500' },
              { label: 'Long Run', desc: '7 Day Streak', icon: '🏃', color: 'text-green-500' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.05, rotate: 1 }}
                className="p-8 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[2rem] flex flex-col items-center text-center gap-4"
              >
                <div className="text-5xl mb-2 grayscale hover:grayscale-0 transition-all duration-500">{item.icon}</div>
                <div className="space-y-1">
                  <p className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-widest">{item.label}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
