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
  hasSyllabus?: boolean;
}

import Logo from './Logo';

import BottomNav from './BottomNav';

export default function Layout({ children, activeTab, setActiveTab, user, isGuest, onResetRequest, hasSyllabus }: LayoutProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'syllabus', icon: BookOpen, label: 'Syllabus' },
    { id: 'plan', icon: Calendar, label: 'Plan' },
    { id: 'analytics', icon: BarChart2, label: 'Stats' },
    { id: 'chat', icon: MessageSquare, label: 'AI Coach' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 glass-card m-4 mr-0 flex-col border-slate-200 dark:border-white/10">
        <div className="p-8">
          <Logo />
          <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold tracking-[0.2em] uppercase mt-1 ml-11">AI Study Coach</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                activeTab === item.id 
                  ? "bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20" 
                  : "text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-500/5 dark:hover:bg-white/5 border border-transparent"
              )}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                />
              )}
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", activeTab === item.id ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-white/40")} />
              <span className="font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-200 dark:border-white/5 bg-slate-500/5 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center border border-slate-300 dark:border-white/10">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-5 h-5 text-slate-400 dark:text-white/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{isGuest ? 'Guest Student' : user?.displayName}</p>
              <p className="text-[10px] text-slate-400 dark:text-white/30 truncate uppercase tracking-widest">{isGuest ? 'Local Session' : 'Premium Member'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-7xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation - Mobile */}
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onSettingsClick={() => setIsSettingsOpen(true)} 
        />
      </div>

      {/* Global Settings Components */}
      <div className="hidden lg:block">
        <SettingsButton onClick={() => setIsSettingsOpen(true)} />
      </div>
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        user={user}
        isGuest={isGuest}
        onResetRequest={onResetRequest}
        hasSyllabus={hasSyllabus}
      />
    </div>
  );
}
