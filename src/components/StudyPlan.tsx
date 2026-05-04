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
    <div className="space-y-8 pb-32 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white font-display italic">Timeline</h1>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-[2rem] w-full md:w-auto shadow-xl shadow-black/[0.02] border border-white/5">
          <button 
            onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
            disabled={selectedDay === 0}
            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-full disabled:opacity-30 transition-all active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center min-w-[120px]">
             <span className="font-black text-sm md:text-xl uppercase tracking-widest text-white">Day {selectedDay + 1}</span>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{days.length} Days Total</p>
          </div>
          <button 
            onClick={() => setSelectedDay(Math.min(days.length - 1, selectedDay + 1))}
            disabled={selectedDay === days.length - 1}
            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-full disabled:opacity-30 transition-all active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
        {/* Day Navigation */}
        <div className="lg:h-[calc(100vh-320px)] overflow-x-auto lg:overflow-y-auto no-scrollbar lg:custom-scrollbar flex lg:flex-col gap-4 pb-6 lg:pb-0 px-1 snap-x">
          {days.map((day: any, i: number) => {
            const completedTasks = day.tasks.filter((t: any) => t.completed).length;
            const isFullyCompleted = completedTasks === day.tasks.length;

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={cn(
                  "min-w-[140px] lg:min-w-0 text-left p-6 rounded-[2rem] transition-all duration-500 group shrink-0 border snap-center",
                  selectedDay === i 
                    ? "bg-blue-600 text-white border-blue-500 shadow-2xl shadow-blue-500/30 scale-[1.05]" 
                    : "bg-white/5 border-white/5 hover:border-blue-500/50 text-white/40"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-sm md:text-xl font-display italic">Day {day.day}</span>
                  {isFullyCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-blue-500/20" />
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest opacity-60 text-white">
                   {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                   <span className="text-xs">{completedTasks}/{day.tasks.length}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tasks View */}
        <div className="lg:col-span-3 space-y-8 md:space-y-12">
          <div className="glass-card p-8 md:p-14 bg-gradient-to-br from-blue-600/[0.05] to-purple-600/[0.05] border-blue-500/20 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/[0.03] blur-[100px] rounded-full pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
              <div className="w-20 h-20 md:w-28 md:h-28 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Calendar className="w-10 h-10 md:w-14 md:h-14 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-black text-white font-display tracking-tight leading-none italic">
                  {new Date(currentDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <div className="flex items-center gap-3">
                   <div className="h-1.5 w-12 bg-blue-500 rounded-full" />
                   <p className="text-xs md:text-lg text-white/60 font-black uppercase tracking-widest">{currentDay.tasks.length} Learning Modules</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {currentDay.tasks.map((task: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onToggleTask(selectedDay, i)}
                className={cn(
                  "glass-card p-8 md:p-10 flex flex-col justify-between gap-8 group transition-all border cursor-pointer select-none rounded-[2.5rem] relative overflow-hidden",
                  task.completed 
                    ? "opacity-60 bg-green-500/5 border-green-500/20" 
                    : "hover:border-blue-500/40 hover:bg-white/[0.01] border-white/5"
                )}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-all duration-500 shadow-inner",
                      task.completed 
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/30" 
                        : "bg-blue-600/5 text-blue-500 border border-blue-500/10 group-hover:bg-blue-600 group-hover:text-white"
                    )}>
                      {task.completed ? <CheckCircle2 className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
                    </div>
                    <span className={cn(
                      "text-[10px] md:text-xs uppercase tracking-[0.2em] px-4 py-2 rounded-full font-black border",
                      task.priority === 'high' 
                        ? "bg-red-500/10 text-red-500 border-red-500/20" 
                        : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}>
                      {task.priority} Priority
                    </span>
                  </div>
                  <h3 className={cn(
                    "text-2xl md:text-3xl font-black leading-tight mb-4 font-display tracking-tight",
                    task.completed && "line-through text-white/30"
                  )}>
                    {task.topic}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full"><Clock className="w-4 h-4" /> {task.duration}</span>
                    <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                    <span className="bg-white/5 px-3 py-1.5 rounded-full">{task.type}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Module Status</span>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", task.completed ? "bg-green-500" : "bg-blue-500")} />
                    <span className={cn("text-xs font-black tracking-widest", task.completed ? "text-green-500" : "text-blue-500")}>
                      {task.completed ? 'VERIFIED' : 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
