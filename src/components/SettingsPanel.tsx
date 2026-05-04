import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Bell, Shield, Moon, LogOut, ChevronRight, 
  Info, ChevronLeft, Download, Trash2, Check, Sun, Monitor, RefreshCcw, BookOpen
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { useSettingsStore } from '../store/useSettingsStore';
import { Theme } from '../types';
import { doc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isGuest: boolean;
  onResetRequest?: () => void;
  onLogout?: () => void;
  hasSyllabus?: boolean;
}

type SettingsView = 'main' | 'profile' | 'notifications' | 'appearance' | 'privacy';

export default function SettingsPanel({ isOpen, onClose, user, isGuest, onResetRequest, onLogout, hasSyllabus }: SettingsPanelProps) {
  const { settings, setTheme, setSettings } = useSettingsStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('examora_session_active');
      await auth.signOut();
      window.location.reload();
    }
    onClose();
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data: any = {
        settings,
        exportedAt: new Date().toISOString(),
        mode: isGuest ? 'guest' : 'user'
      };

      if (!isGuest && user) {
        const syllabi = await getDocs(query(collection(db, 'syllabi'), where('userId', '==', user.uid)));
        const plans = await getDocs(query(collection(db, 'studyPlans'), where('userId', '==', user.uid)));
        const progress = await getDocs(query(collection(db, 'progress'), where('userId', '==', user.uid)));
        
        data.syllabi = syllabi.docs.map(d => d.data());
        data.plans = plans.docs.map(d => d.data());
        data.progress = progress.docs.map(d => d.data());
      } else {
        const localData = localStorage.getItem('exam_killer_guest_session');
        if (localData) data.guestData = JSON.parse(localData);
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `examora-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 dark:bg-[#020617]/95 backdrop-blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full lg:max-w-6xl h-full lg:h-auto lg:max-h-[90vh] bg-slate-50 dark:bg-[#020617] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden transition-colors"
      >
        {/* Header */}
        <div className="p-6 md:p-14 pb-0 flex items-start justify-between">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white font-display uppercase">Settings</h1>
            <p className="hidden md:block text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl max-w-xl">
              Manage curricula, backups, and the logic that shapes your study architect.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 md:p-4 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <X className="w-6 h-6 md:w-8 h-8" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-14 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-14">
          
          {/* Left Column */}
          <div className="space-y-12 text-left">
            {/* Section: Account */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500 font-display">Account</h3>
              <div className="glass-card bg-white dark:bg-[#0f172a]/50 p-8 border-slate-200 dark:border-slate-800 space-y-6 rounded-[2rem]">
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">Profile Context</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                    View session state and synchronization status.
                  </p>
                </div>
                
                <div className="bg-slate-50 dark:bg-[#020617] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Active Session</p>
                    <p className="text-slate-900 dark:text-white font-black truncate">{isGuest ? 'Examora Guest' : user?.displayName || user?.email}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="text-slate-500 text-sm font-medium leading-relaxed font-display">
                    {isGuest 
                      ? "You are using guest mode. Data stays local to this browser." 
                      : "Your study progress is automatically synced with your Google account."}
                  </p>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </section>

            {/* Section: Study Preferences */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500 font-display">Study Preferences</h3>
              <div className="glass-card bg-white dark:bg-[#0f172a]/50 p-8 border-slate-200 dark:border-slate-800 space-y-8 rounded-[2rem]">
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white font-display">Dashboard Components</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                    Choose which data points contribute to your top-level study metrics.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <ConfigToggle label="Active Plan" active />
                  <ConfigToggle label="Daily Tasks" active />
                  <ConfigToggle label="Revision Sessions" active />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-12 text-left">
            {/* Section: Appearance */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500 font-display">Appearance</h3>
              <div className="glass-card bg-white dark:bg-[#0f172a]/50 p-8 border-slate-200 dark:border-slate-800 space-y-6 rounded-[2rem]">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white font-display">Visual Theme</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">Toggle between light and dark modes in this workspace.</p>
                  </div>
                  <button 
                    onClick={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
                    className="p-5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-900 dark:text-white min-w-[140px]"
                  >
                    {settings.theme === 'dark' ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-blue-600" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{settings.theme}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Section: Data Management */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500 font-display">Data Management</h3>
              <div className="glass-card bg-white dark:bg-[#0f172a]/50 p-8 border-slate-200 dark:border-slate-800 space-y-6 rounded-[2rem]">
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white font-display">Data Controls</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                    Import, export, or reset your entire study workspace.
                  </p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="w-full p-6 bg-slate-50 dark:bg-[#0f172b] border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800 group-hover:bg-blue-600 transition-colors">
                        <Download className="w-6 h-6 text-slate-400 group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-slate-900 dark:text-white font-black text-sm">Export Data</p>
                        <p className="text-slate-500 text-xs font-medium">Download all your study data as a JSON file</p>
                      </div>
                    </div>
                    {isExporting ? <RefreshCcw className="w-5 h-5 animate-spin text-blue-600" /> : <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-700" />}
                  </button>

                  <button className="w-full p-6 bg-slate-50 dark:bg-[#0f172b] border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-all group relative overflow-hidden">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800 group-hover:bg-blue-600 transition-colors">
                        <BookOpen className="w-6 h-6 text-slate-400 group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-slate-900 dark:text-white font-black text-sm">Import Data</p>
                        <p className="text-slate-500 text-xs font-medium">Restore structure and progress from a JSON file</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-700" />
                    <input 
                      type="file" 
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const data = JSON.parse(event.target?.result as string);
                            if (data.settings) setSettings(data.settings);
                            if (data.guestData) localStorage.setItem('exam_killer_guest_session', JSON.stringify(data.guestData));
                            alert('Data imported successfully! Refreshing...');
                            window.location.reload();
                          } catch (e) {
                            alert('Invalid backup file');
                          }
                        };
                        reader.readAsText(file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </button>

                  <button 
                    onClick={() => {
                      onClose();
                      onResetRequest?.();
                    }}
                    className="w-full p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center justify-between hover:bg-red-500/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:bg-red-600 transition-colors">
                        <Trash2 className="w-6 h-6 text-red-500 group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-red-400 font-black text-sm">Reset Study Data</p>
                        <p className="text-red-500/40 text-xs font-medium">Permanently clear your current unit structure and plan</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-red-500/20" />
                  </button>
                </div>
              </div>
            </section>

            {/* Support section info */}
            <div className="p-10 text-center bg-slate-100 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-slate-900/50 backdrop-blur-sm shadow-sm">
              <p className="text-blue-600 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-3 font-display">Examora Stable</p>
              <p className="text-slate-400 dark:text-white/20 text-[10px] font-black tracking-widest">VERSION 1.5.2 • BUILT FOR PRODUCTIVITY</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ConfigToggle({ label, active = false }: { label: string, active?: boolean }) {
  const [isOn, setIsOn] = useState(active);
  return (
    <button 
      onClick={() => setIsOn(!isOn)}
      className={cn(
        "flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest",
        isOn 
          ? "bg-blue-600/10 border-blue-500 text-white" 
          : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400"
      )}
    >
      <div className={cn(
        "w-8 h-4 rounded-full relative transition-all",
        isOn ? "bg-blue-500" : "bg-slate-700"
      )}>
        <div className={cn(
          "absolute top-1 w-2 h-2 rounded-full bg-white transition-all shadow-sm",
          isOn ? "left-5" : "left-1"
        )} />
      </div>
      {label}
    </button>
  );
}
