import React from 'react';
import { Home, Calendar, Sparkles, BarChart2, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSettingsClick: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, onSettingsClick }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'plan', label: 'Plan', icon: Calendar },
    { id: 'chat', label: 'Coach', icon: Sparkles },
    { id: 'analytics', label: 'Stats', icon: BarChart2 },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-slate-200 dark:border-white/10 z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all",
              activeTab === tab.id 
                ? "text-blue-600 dark:text-blue-400" 
                : "text-slate-400 dark:text-white/40"
            )}
          >
            <tab.icon className={cn("w-5 h-5", activeTab === tab.id && "scale-110")} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
        <button
          onClick={onSettingsClick}
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-slate-400 dark:text-white/40"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Settings</span>
        </button>
      </div>
    </div>
  );
}
