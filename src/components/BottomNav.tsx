import React from 'react';
import { LayoutDashboard, Calendar, BarChart2, MessageSquare, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSettingsClick: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, onSettingsClick }: BottomNavProps) {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'plan', label: 'Plan', icon: Calendar },
    { id: 'chat', label: 'AI Coach', icon: MessageSquare },
    { id: 'analytics', label: 'Stats', icon: BarChart2 },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-6 py-3 z-50 flex items-center justify-between safe-area-pb">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === item.id ? "text-blue-500" : "text-slate-400 dark:text-white/40"
          )}
        >
          <item.icon className={cn("w-6 h-6", activeTab === item.id && "animate-pulse")} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
      <button
        onClick={onSettingsClick}
        className="flex flex-col items-center gap-1 text-slate-400 dark:text-white/40"
      >
        <Settings className="w-6 h-6" />
        <span className="text-[10px] font-medium">Settings</span>
      </button>
    </div>
  );
}
