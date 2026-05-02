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
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'syllabus', icon: BookOpen, label: 'Curriculum' },
    { id: 'plan', icon: Calendar, label: 'Strategy' },
    { id: 'analytics', icon: BarChart2, label: 'Performance' },
    { id: 'chat', icon: MessageSquare, label: 'Assistant' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-[#020617] border-r border-slate-900 flex-col">
        <div className="p-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white font-display">Examora</span>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 px-4">Workspace</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm",
                activeTab === item.id 
                  ? "bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-[0_0_20px_rgba(30,64,175,0.1)]" 
                  : "text-slate-500 hover:text-white hover:bg-slate-900 border border-transparent"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-blue-500" : "text-slate-500")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-slate-900">
          <div className="flex items-center gap-4 p-4 glass-card bg-slate-900/50 border-slate-800">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-800 shadow-xl ring-2 ring-slate-800">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">{isGuest ? 'Guest Access' : user?.displayName}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase mt-0.5 tracking-widest font-bold">Free Plan</p>
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
