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
    <div className="space-y-8 pb-20 lg:pb-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Your Study Plan</h1>
        <div className="flex items-center gap-2 bg-slate-500/5 dark:bg-white/5 p-1 rounded-xl w-full md:w-auto justify-between md:justify-start">
          <button 
            onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
            disabled={selectedDay === 0}
            className="p-2 hover:bg-slate-500/10 dark:hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 font-medium text-sm md:text-base whitespace-nowrap">Day {selectedDay + 1} of {days.length}</span>
          <button 
            onClick={() => setSelectedDay(Math.min(days.length - 1, selectedDay + 1))}
            disabled={selectedDay === days.length - 1}
            className="p-2 hover:bg-slate-500/10 dark:hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Day Navigation Sidebar (Desktop) / Horizontal Scroll (Mobile) */}
        <div className="lg:h-[calc(100vh-250px)] overflow-x-auto lg:overflow-y-auto no-scrollbar lg:custom-scrollbar flex lg:flex-col gap-2 pb-2 lg:pb-0">
          {days.map((day: any, i: number) => {
            const completedTasks = day.tasks.filter((t: any) => t.completed).length;
            const isFullyCompleted = completedTasks === day.tasks.length;

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={cn(
                  "min-w-[100px] lg:min-w-0 text-left p-3 md:p-4 rounded-xl transition-all duration-200 group shrink-0",
                  selectedDay === i 
                    ? "bg-blue-500 text-white glow-blue" 
                    : "bg-slate-500/5 dark:bg-white/5 lg:bg-transparent hover:bg-slate-500/10 dark:hover:bg-white/10 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs md:text-base">Day {day.day}</span>
                  {isFullyCompleted && <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-green-400" />}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] md:text-xs opacity-60">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[8px] md:text-[10px] opacity-40">{completedTasks}/{day.tasks.length}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tasks View */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          <div className="glass-card p-4 md:p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <div className="flex items-center gap-3 md:gap-4">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
              <div>
                <h2 className="text-lg md:text-2xl font-bold">
                  {new Date(currentDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <p className="text-[10px] md:text-sm text-slate-500 dark:text-white/60">Target: {currentDay.tasks.length} learning modules</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            {currentDay.tasks.map((task: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "glass-card p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all",
                  task.completed ? "opacity-60 bg-green-500/5 border-green-500/20" : "hover:border-blue-500/30"
                )}
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <div className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                    task.completed 
                      ? "bg-green-500/20 text-green-400" 
                      : task.type === 'revision' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                  )}>
                    {task.completed ? <CheckCircle2 className="w-5 h-5 md:w-6 h-6" /> : task.type === 'revision' ? <BookOpen className="w-5 h-5 md:w-6 h-6" /> : <Clock className="w-5 h-5 md:w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <h3 className={cn(
                        "text-sm md:text-xl font-semibold line-clamp-1 transition-all",
                        task.completed && "line-through text-slate-400 dark:text-white/40"
                      )}>
                        {task.topic}
                      </h3>
                      <span className={cn(
                        "text-[8px] md:text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-black",
                        task.priority === 'high' ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                      )}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 mt-1 md:mt-2 text-[10px] md:text-sm text-slate-400 dark:text-white/40">
                      <span className="flex items-center gap-1 md:gap-1.5"><Clock className="w-3 h-3 md:w-4 md:h-4" /> {task.duration}</span>
                      <span className="flex items-center gap-1 md:gap-1.5 capitalize"><Circle className="w-2 h-2 md:w-3 md:h-3 fill-current" /> {task.type}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onToggleTask(selectedDay, i)}
                  className={cn(
                    "w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl text-xs md:text-sm font-semibold transition-all",
                    task.completed 
                      ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" 
                      : "bg-slate-500/5 dark:bg-white/5 hover:bg-green-500/20 hover:text-green-400 dark:hover:text-green-400"
                  )}
                >
                  {task.completed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </>
                  ) : (
                    "Mark Done"
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
