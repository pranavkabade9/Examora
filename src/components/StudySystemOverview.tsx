import React from 'react';
import { BookOpen, Calendar, RefreshCw, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface StudySystemOverviewProps {
  onStart: () => void;
}

export default function StudySystemOverview({ onStart }: StudySystemOverviewProps) {
  const features = [
    {
      icon: BookOpen,
      title: 'Smart Syllabus Organizer',
      desc: 'Organizes your syllabus into structured topics.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Calendar,
      title: 'Auto Study Planner',
      desc: 'Creates a balanced daily study schedule.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      icon: RefreshCw,
      title: 'Revision Planner',
      desc: 'Adds revision sessions to improve retention.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white font-display">
          Rule-Based <span className="text-blue-500">Planning</span>
        </h2>
        <p className="text-slate-500 text-lg md:text-xl font-medium">
          A logic-driven system that turns your syllabus into a master study plan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-8 space-y-6 hover:translate-y-[-4px] transition-all group"
          >
            <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
              <feature.icon className={`w-7 h-7 ${feature.color}`} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onStart}
          className="px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl flex items-center gap-4 transition-all shadow-xl shadow-blue-500/20 group"
        >
          <span className="text-xl">Build My Study System</span>
          <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  );
}
