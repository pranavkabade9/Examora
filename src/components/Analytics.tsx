import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Brain, TrendingUp, Award, AlertTriangle } from 'lucide-react';
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
    <div className="space-y-8 md:space-y-12 pb-24 lg:pb-0">
      <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-display">Performance Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-6 md:p-10 space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 font-display">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Study Momentum
            </h2>
            <div className="text-right">
              <p className="text-2xl md:text-4xl font-black text-blue-600 dark:text-blue-400">{completedTasksCount}</p>
              <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">Total Done</p>
            </div>
          </div>
          <div className="h-[280px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/5" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="currentColor" 
                  className="text-slate-400 dark:text-white/20" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '16px', 
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: 'var(--text)' }}
                />
                <Area type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTasks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="glass-card p-6 md:p-10 space-y-6 md:space-y-8">
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 font-display">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Topic Mastery
          </h2>
          <div className="space-y-6 md:space-y-8">
            {topicStats.length > 0 ? topicStats.map((topic) => (
              <div key={topic.name} className="space-y-3">
                <div className="flex justify-between text-xs md:text-sm font-bold">
                  <span className="text-slate-500 dark:text-white/60 uppercase tracking-widest">{topic.name}</span>
                  <span className="font-black text-slate-900 dark:text-white">{topic.score}%</span>
                </div>
                <div className="h-2 md:h-3 bg-slate-500/10 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.score}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className={cn(
                      "h-full rounded-full shadow-sm",
                      topic.score < 50 ? 'bg-red-500' : topic.score < 80 ? 'bg-blue-500' : 'bg-green-500'
                    )}
                  />
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 dark:text-white/40 italic">Complete more tasks to see topic insights.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        {/* Weak Areas */}
        <div className="glass-card p-6 md:p-10 space-y-6 md:space-y-8 border-red-500/20">
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 text-red-600 dark:text-red-400 font-display">
            <AlertTriangle className="w-6 h-6" />
            Focus Areas
          </h2>
          <div className="space-y-4 md:space-y-5">
            {topicStats.filter(t => t.score < 50).length > 0 ? topicStats.filter(t => t.score < 50).map((item, i) => (
              <div key={i} className="p-4 md:p-5 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-2 group hover:bg-red-500/10 transition-colors">
                <p className="font-black text-sm md:text-base text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-[10px] md:text-xs text-red-600 dark:text-red-400/60 font-bold uppercase tracking-wider">Mastery: {item.score}%</p>
              </div>
            )) : (
              <div className="py-10 text-center space-y-3 opacity-50">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Brain className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">No critical weak areas identified yet!</p>
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-card p-6 md:p-10 space-y-6 md:space-y-8 border-green-500/20">
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 text-green-600 dark:text-green-400 font-display">
            <Award className="w-6 h-6" />
            Recent Achievements
          </h2>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {[
              { label: 'Early Bird', desc: 'Started before 7 AM', icon: '🌅' },
              { label: 'Deep Focus', desc: '4h without breaks', icon: '🧠' },
              { label: 'Revision Pro', desc: 'Completed 10 revisions', icon: '📚' },
              { label: 'Streak Master', desc: '7 days consistent', icon: '🔥' },
            ].map((item, i) => (
              <div key={i} className="p-4 md:p-6 bg-green-500/5 border border-green-500/10 rounded-2xl text-center space-y-2 md:space-y-3 group hover:scale-[1.02] transition-transform">
                <span className="text-3xl md:text-4xl block">{item.icon}</span>
                <p className="font-black text-xs md:text-sm text-slate-900 dark:text-white uppercase tracking-widest">{item.label}</p>
                <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400/60 font-bold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
