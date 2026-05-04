import React from 'react';
import { LayoutDashboard, BookOpen, Calendar, BarChart2, MessageSquare, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSettingsClick: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, onSettingsClick }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'plan', label: 'Timeline', icon: Calendar },
    { id: 'analytics', label: 'Stats', icon: BarChart2 },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-2xl border-t border-slate-800 z-50 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex items-center justify-around h-20 px-2 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center flex-1 h-full relative group outline-none"
          >
            <div className={cn(
              "p-2.5 rounded-[1.25rem] transition-all duration-300 relative z-10",
              activeTab === tab.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40 -translate-y-1" 
                : "text-slate-500 active:scale-90"
            )}>
              <tab.icon className="w-5 h-5" />
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-[0.1em] mt-1 transition-colors duration-300",
              activeTab === tab.id ? "text-blue-400" : "text-slate-600"
            )}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute inset-x-4 top-0 h-1 bg-blue-600 rounded-b-full hidden"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
