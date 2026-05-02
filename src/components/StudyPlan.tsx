import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, CheckCircle2, Circle, Clock, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

interface StudyPlanProps {
  plan: any;
  onToggleTask: (dayIndex: number, taskIndex: number) => void;
}

export default function StudyPlan({ plan, onToggleTask }: StudyPlanProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const days = plan?.days || [];
  const currentDay = days[selectedDay];

  if (!days.length) return null;

  return (
    <div className="space-y-8 pb-24 lg:pb-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-display">Your Study Plan</h1>
        <div className="flex items-center gap-2 bg-slate-500/5 dark:bg-white/5 p-1.5 rounded-2xl w-full md:w-auto justify-between md:justify-start border border-slate-200 dark:border-white/10">
          <button 
            onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
            disabled={selectedDay === 0}
            className="p-3 hover:bg-slate-500/10 dark:hover:bg-white/10 rounded-xl disabled:opacity-30 transition-all active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="px-6 font-black text-sm md:text-base whitespace-nowrap uppercase tracking-widest text-slate-700 dark:text-white/80">Day {selectedDay + 1} <span className="text-slate-400">/ {days.length}</span></span>
          <button 
            onClick={() => setSelectedDay(Math.min(days.length - 1, selectedDay + 1))}
            disabled={selectedDay === days.length - 1}
            className="p-3 hover:bg-slate-500/10 dark:hover:bg-white/10 rounded-xl disabled:opacity-30 transition-all active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-10">
        {/* Day Navigation Sidebar (Desktop) / Horizontal Scroll (Mobile) */}
        <div className="lg:h-[calc(100vh-280px)] overflow-x-auto lg:overflow-y-auto no-scrollbar lg:custom-scrollbar flex lg:flex-col gap-3 pb-4 lg:pb-0 px-1">
          {days.map((day: any, i: number) => {
            const completedTasks = day.tasks.filter((t: any) => t.completed).length;
            const isFullyCompleted = completedTasks === day.tasks.length;

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={cn(
                  "min-w-[120px] lg:min-w-0 text-left p-4 md:p-5 rounded-2xl transition-all duration-300 group shrink-0 border",
                  selectedDay === i 
                    ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20 scale-[1.02]" 
                    : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-500/50 text-slate-600 dark:text-white/60 hover:text-blue-600 dark:hover:text-white"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-sm md:text-lg font-display">Day {day.day}</span>
                  {isFullyCompleted && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-60">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[10px] font-black opacity-40">{completedTasks}/{day.tasks.length}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tasks View */}
        <div className="lg:col-span-3 space-y-6 md:space-y-8">
          <div className="glass-card p-6 md:p-10 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Calendar className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white font-display">
                  {new Date(currentDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <p className="text-xs md:text-base text-slate-500 dark:text-white/60 font-bold uppercase tracking-widest mt-1">Target: {currentDay.tasks.length} learning modules</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentDay.tasks.map((task: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onToggleTask(selectedDay, i)}
                className={cn(
                  "glass-card p-6 flex flex-col justify-between gap-6 group transition-all border cursor-pointer select-none",
                  task.completed 
                    ? "opacity-60 bg-green-500/5 border-green-500/20" 
                    : "hover:border-blue-500/40 hover:bg-white dark:hover:bg-[#1e293b]/50"
                )}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                      task.completed 
                        ? "bg-green-500/10 text-green-600 outline outline-green-500/20" 
                        : "bg-slate-500/5 text-slate-400 group-hover:bg-blue-600/10 group-hover:text-blue-500"
                    )}>
                      {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                    </div>
                    <span className={cn(
                      "text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-black font-display border",
                      task.priority === 'high' 
                        ? "bg-red-500/10 text-red-500 border-red-500/20" 
                        : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}>
                      {task.priority}
                    </span>
                  </div>
                  <h3 className={cn(
                    "text-xl font-black leading-tight mb-2 font-display",
                    task.completed && "line-through text-slate-400 dark:text-white/30"
                  )}>
                    {task.topic}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-bold">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {task.duration}</span>
                    <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                    <span className="capitalize">{task.type} session</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</span>
                  <span className={cn("text-xs font-black", task.completed ? "text-green-500" : "text-blue-500")}>
                    {task.completed ? 'COMPLETED' : 'PENDING'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
