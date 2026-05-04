import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, BookOpen, Calendar, BarChart2, MessageSquare, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import SettingsButton from './SettingsButton';
import SettingsPanel from './SettingsPanel';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  isGuest: boolean;
  onResetRequest?: () => void;
  onLogout?: () => void;
  hasSyllabus?: boolean;
}

import Logo from './Logo';

import BottomNav from './BottomNav';

export default function Layout({ children, activeTab, setActiveTab, user, isGuest, onResetRequest, onLogout, hasSyllabus }: LayoutProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'syllabus', icon: BookOpen, label: 'Syllabus' },
    { id: 'plan', icon: Calendar, label: 'Timeline' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Mobile Sticky Header */}
      <header className="lg:hidden h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-900 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter font-display uppercase italic">Examora</span>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 active:scale-90 transition-transform"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-72 bg-white dark:bg-[#050505] border-r border-slate-200 dark:border-slate-900 flex-col">
          <div className="p-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter font-display uppercase italic">Examora</span>
          </div>

          <nav className="flex-1 px-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm",
                  activeTab === item.id 
                    ? "bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/5" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent"
                )}
              >
                <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-blue-500" : "text-slate-500")} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-8 border-t border-slate-100 dark:border-slate-900">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
            >
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <SettingsIcon className="w-5 h-5 text-slate-500 group-hover:text-white" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-black truncate">Settings</p>
                <p className="text-[10px] text-slate-500 truncate uppercase mt-0.5 tracking-widest font-bold">Preferences</p>
              </div>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-5 sm:p-8 md:p-12 pb-32 lg:pb-12 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSettingsClick={() => setIsSettingsOpen(true)} 
      />

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        user={user}
        isGuest={isGuest}
        onResetRequest={onResetRequest}
        onLogout={onLogout}
        hasSyllabus={hasSyllabus}
      />
    </div>
  );
}
