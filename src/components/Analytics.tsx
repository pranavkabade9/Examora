import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Brain, TrendingUp, Award, AlertTriangle } from 'lucide-react';

const data = [
  { name: 'Mon', hours: 4 },
  { name: 'Tue', hours: 6 },
  { name: 'Wed', hours: 3 },
  { name: 'Thu', hours: 8 },
  { name: 'Fri', hours: 5 },
  { name: 'Sat', hours: 7 },
  { name: 'Sun', hours: 4 },
];

const topicData = [
  { name: 'Physics', score: 85 },
  { name: 'Math', score: 45 },
  { name: 'Chemistry', score: 70 },
  { name: 'Biology', score: 92 },
];

export default function Analytics() {
  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Performance Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-4 md:p-8 space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Study Consistency
            </h2>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs md:text-sm outline-none w-full sm:w-auto">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="glass-card p-4 md:p-8 space-y-4 md:space-y-6">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Topic Mastery
          </h2>
          <div className="space-y-4 md:space-y-6">
            {topicData.map((topic) => (
              <div key={topic.name} className="space-y-2">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-white/60">{topic.name}</span>
                  <span className="font-bold">{topic.score}%</span>
                </div>
                <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${topic.score < 50 ? 'bg-red-500' : topic.score < 80 ? 'bg-blue-500' : 'bg-green-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Weak Areas */}
        <div className="glass-card p-4 md:p-8 space-y-4 md:space-y-6 border-red-500/20">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Weak Areas Detected
          </h2>
          <div className="space-y-3 md:space-y-4">
            {[
              { topic: 'Calculus III: Triple Integrals', reason: 'Low quiz score (42%)' },
              { topic: 'Organic Chemistry: Mechanisms', reason: 'Skipped 2 revision tasks' },
              { topic: 'Quantum Physics: Wave Functions', reason: 'High doubt frequency' },
            ].map((item, i) => (
              <div key={i} className="p-3 md:p-4 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1">
                <p className="font-semibold text-xs md:text-sm">{item.topic}</p>
                <p className="text-[10px] md:text-xs text-red-400/60">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-card p-4 md:p-8 space-y-4 md:space-y-6 border-green-500/20">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-green-400">
            <Award className="w-5 h-5" />
            Recent Achievements
          </h2>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              { label: 'Early Bird', desc: 'Started before 7 AM', icon: '🌅' },
              { label: 'Deep Focus', desc: '4h without breaks', icon: '🧠' },
              { label: 'Revision Pro', desc: 'Completed 10 revisions', icon: '📚' },
              { label: 'Streak Master', desc: '7 days consistent', icon: '🔥' },
            ].map((item, i) => (
              <div key={i} className="p-3 md:p-4 bg-green-500/5 border border-green-500/10 rounded-xl text-center space-y-1 md:space-y-2">
                <span className="text-xl md:text-2xl">{item.icon}</span>
                <p className="font-bold text-xs md:text-sm">{item.label}</p>
                <p className="text-[8px] md:text-[10px] text-green-400/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
