import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Bell, Shield, Moon, LogOut, ChevronRight, 
  Info, ChevronLeft, Download, Trash2, Check, Sun, Monitor, RefreshCcw
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
  hasSyllabus?: boolean;
}

type SettingsView = 'main' | 'profile' | 'notifications' | 'appearance' | 'privacy';

export default function SettingsPanel({ isOpen, onClose, user, isGuest, onResetRequest, hasSyllabus }: SettingsPanelProps) {
  const [view, setView] = useState<SettingsView>('main');
  const { settings, updateNotifications, setTheme, setSettings } = useSettingsStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    onClose();
    window.location.reload();
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
        // Fetch real data from Firebase
        const syllabi = await getDocs(query(collection(db, 'syllabi'), where('userId', '==', user.uid)));
        const plans = await getDocs(query(collection(db, 'studyPlans'), where('userId', '==', user.uid)));
        const progress = await getDocs(query(collection(db, 'progress'), where('userId', '==', user.uid)));
        
        data.syllabi = syllabi.docs.map(d => d.data());
        data.plans = plans.docs.map(d => d.data());
        data.progress = progress.docs.map(d => d.data());
      } else {
        // Get from localStorage
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

  const handleClearData = async () => {
    if (!confirm('Are you sure? This will permanently delete all your study plans and progress.')) return;
    
    setIsClearing(true);
    try {
      if (isGuest) {
        localStorage.clear();
      } else if (user) {
        // In a real app, we'd delete all user collections
        // For now, let's at least clear settings and memory
        await deleteDoc(doc(db, 'settings', user.uid));
        await deleteDoc(doc(db, 'memories', user.uid));
      }
      window.location.reload();
    } catch (error) {
      console.error('Clear data failed:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const renderMain = () => (
    <div className="space-y-8">
      {isGuest && (
        <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-4">
          <p className="text-sm font-black text-blue-600 dark:text-blue-100 uppercase tracking-widest">Guest Mode Active</p>
          <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed font-medium">
            Your data is stored locally. Sign in with Google to enable cloud sync and pro study tools.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest"
          >
            Sign in with Google
          </button>
        </div>
      )}

      <div className="space-y-5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 px-2">Account</h3>
        <div className="space-y-3">
          <SettingsItem 
            icon={User} 
            label="Profile Settings" 
            description={isGuest ? 'Guest User' : user?.email}
            onClick={() => setView('profile')}
          />
          <SettingsItem 
            icon={Bell} 
            label="Notifications" 
            description="Manage study alerts"
            onClick={() => setView('notifications')}
          />
        </div>
      </div>

      <div className="space-y-5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 px-2">App Settings</h3>
        <div className="space-y-3">
          <SettingsItem 
            icon={Moon} 
            label="Appearance" 
            description={`${settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)} mode active`}
            onClick={() => setView('appearance')}
          />
          <SettingsItem 
            icon={Shield} 
            label="Privacy & Security" 
            description="Data protection"
            onClick={() => setView('privacy')}
          />
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8">
      <div className="flex flex-col items-center py-8 space-y-5">
        <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center border-2 border-blue-500/20 shadow-xl shadow-blue-500/5 overflow-hidden">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="w-12 h-12 text-blue-500" />
          )}
        </div>
        <div className="text-center space-y-1">
          <h4 className="text-2xl font-black text-slate-900 dark:text-white font-display">{user?.displayName || 'Guest Student'}</h4>
          <p className="text-sm text-slate-500 dark:text-white/40 font-medium">{user?.email || 'Local Session'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-5 bg-slate-500/5 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
          <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block mb-2">Account Type</label>
          <p className="text-sm font-bold text-slate-700 dark:text-white/90">{isGuest ? 'Guest (Local)' : 'Premium (Cloud)'}</p>
        </div>
        {!isGuest && (
          <div className="p-5 bg-slate-500/5 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
            <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest block mb-2">Member Since</label>
            <p className="text-sm font-bold text-slate-700 dark:text-white/90">{new Date(user?.metadata.creationTime).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <ToggleItem 
          label="Study Reminders" 
          description="Get notified when it's time to study"
          isActive={settings.notifications.studyReminders}
          onToggle={() => updateNotifications({ studyReminders: !settings.notifications.studyReminders })}
        />
        <ToggleItem 
          label="Daily Goal Alerts" 
          description="Track your daily progress targets"
          isActive={settings.notifications.dailyGoalAlerts}
          onToggle={() => updateNotifications({ dailyGoalAlerts: !settings.notifications.dailyGoalAlerts })}
        />
        <ToggleItem 
          label="Smart Suggestions" 
          description="Receive personalized study tips"
          isActive={settings.notifications.aiSuggestions}
          onToggle={() => updateNotifications({ aiSuggestions: !settings.notifications.aiSuggestions })}
        />
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <ThemeOption 
          icon={Moon} 
          label="Dark Mode" 
          isActive={settings.theme === 'dark'} 
          onClick={() => setTheme('dark')} 
        />
        <ThemeOption 
          icon={Sun} 
          label="Light Mode" 
          isActive={settings.theme === 'light'} 
          onClick={() => setTheme('light')} 
        />
        <ThemeOption 
          icon={Monitor} 
          label="System Default" 
          isActive={settings.theme === 'system'} 
          onClick={() => setTheme('system')} 
        />
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 bg-slate-500/5 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
          <h4 className="text-sm font-bold">Data Management</h4>
          <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed">
            Your data is used to personalize your study experience. You can export or delete your data at any time.
          </p>
        </div>

        <button 
          onClick={handleExportData}
          disabled={isExporting}
          className="w-full flex items-center justify-between p-4 bg-slate-500/5 dark:bg-white/5 hover:bg-slate-500/10 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">Export My Data</p>
              <p className="text-xs text-slate-500 dark:text-white/40">Download as JSON</p>
            </div>
          </div>
          {isExporting ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <ChevronRight className="w-4 h-4 text-slate-400 dark:text-white/20" />}
        </button>

        {hasSyllabus && (
          <button 
            onClick={() => {
              onClose();
              onResetRequest?.();
            }}
            className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-2xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <RefreshCcw className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-red-400">Change Syllabus</p>
                <p className="text-xs text-red-500/40">Reset plan and start fresh</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-500/20" />
          </button>
        )}

        <button 
          onClick={handleClearData}
          disabled={isClearing}
          className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-2xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-red-400">Clear All Data</p>
              <p className="text-xs text-red-500/40">Permanently delete everything</p>
            </div>
          </div>
          {isClearing ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <ChevronRight className="w-4 h-4 text-red-500/20" />}
        </button>
      </div>
    </div>
  );

  const getViewTitle = () => {
    switch (view) {
      case 'profile': return 'Profile Settings';
      case 'notifications': return 'Notifications';
      case 'appearance': return 'Appearance';
      case 'privacy': return 'Privacy & Security';
      case 'ai-profile': return 'AI Study Profile';
      default: return 'Settings';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white dark:bg-[#0a0a0a] border-l border-slate-200 dark:border-white/10 z-[80] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-500/5 dark:bg-white/5">
              <div className="flex items-center gap-3">
                {view !== 'main' && (
                  <button 
                    onClick={() => setView('main')}
                    className="p-2 hover:bg-slate-500/10 dark:hover:bg-white/10 rounded-lg transition-colors mr-1"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Info className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold">{getViewTitle()}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-500/10 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {view === 'main' && renderMain()}
                  {view === 'profile' && renderProfile()}
                  {view === 'notifications' && renderNotifications()}
                  {view === 'appearance' && renderAppearance()}
                  {view === 'privacy' && renderPrivacy()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            {view === 'main' && (
              <div className="p-6 border-t border-white/10 bg-white/5">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-2xl border border-red-500/20 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
                <p className="text-center text-[10px] text-white/20 mt-4 uppercase tracking-widest">
                  Examora v1.2.0
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SettingsItem({ icon: Icon, label, description, onClick, highlight }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-5 bg-slate-500/5 dark:bg-white/5 hover:bg-slate-500/10 dark:hover:bg-white/10 border rounded-2xl transition-all group active:scale-[0.98]",
        highlight ? "border-blue-500/30 bg-blue-500/5" : "border-slate-200 dark:border-white/5"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
          highlight ? "bg-blue-500/20 shadow-lg shadow-blue-500/10" : "bg-slate-500/10 dark:bg-white/5 group-hover:bg-blue-500/20"
        )}>
          <Icon className={cn(
            "w-6 h-6 transition-colors",
            highlight ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-white/40 group-hover:text-blue-600 dark:group-hover:text-blue-400"
          )} />
        </div>
        <div className="text-left">
          <p className="text-sm font-black text-slate-900 dark:text-white/90 uppercase tracking-wider">{label}</p>
          <p className="text-xs text-slate-500 dark:text-white/40 font-medium">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-white/20 group-hover:text-blue-500 dark:group-hover:text-white/60 transition-all group-hover:translate-x-1" />
    </button>
  );
}

function ToggleItem({ label, description, isActive, onToggle }: any) {
  return (
    <div className="flex items-center justify-between p-5 bg-slate-500/5 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl">
      <div className="text-left">
        <p className="text-sm font-black text-slate-900 dark:text-white/90 uppercase tracking-wider">{label}</p>
        <p className="text-xs text-slate-500 dark:text-white/40 font-medium">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className={cn(
          "w-14 h-7 rounded-full transition-all relative",
          isActive ? "bg-blue-600" : "bg-slate-300 dark:bg-white/10"
        )}
      >
        <div className={cn(
          "absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md",
          isActive ? "left-8" : "left-1"
        )} />
      </button>
    </div>
  );
}

function ThemeOption({ icon: Icon, label, isActive, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-[0.98]",
        isActive 
          ? "bg-blue-600/10 border-blue-600/40 shadow-xl shadow-blue-500/5" 
          : "bg-slate-500/5 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:bg-slate-500/10 dark:hover:bg-white/10"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
          isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-500/10 dark:bg-white/5 text-slate-500 dark:text-white/40"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{label}</p>
      </div>
      {isActive && (
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </button>
  );
}

function SelectField({ label, value, options, onChange }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] px-2">{label}</label>
      <div className="grid grid-cols-1 gap-2">
        {options.map((opt: any) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          const active = value === val;
          return (
            <button
              key={val}
              onClick={() => onChange(val)}
              className={cn(
                "w-full p-4 rounded-2xl border text-sm text-left transition-all font-bold active:scale-[0.98]",
                active 
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/10" 
                  : "bg-slate-500/5 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:bg-slate-500/10 dark:hover:bg-white/10 text-slate-600 dark:text-white/60"
              )}
            >
              {lbl}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InputField({ label, value, placeholder, onChange }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] px-2">{label}</label>
      <input 
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 bg-slate-500/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20"
      />
    </div>
  );
}
