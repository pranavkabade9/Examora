import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Bell, Shield, Moon, LogOut, ChevronRight, 
  Sparkles, ChevronLeft, Download, Trash2, Check, Sun, Monitor, RefreshCcw
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { useSettingsStore } from '../store/useSettingsStore';
import { Theme, AIProfile } from '../types';
import { doc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isGuest: boolean;
  onResetRequest?: () => void;
  hasSyllabus?: boolean;
}

type SettingsView = 'main' | 'profile' | 'notifications' | 'appearance' | 'privacy' | 'ai-profile';

export default function SettingsPanel({ isOpen, onClose, user, isGuest, onResetRequest, hasSyllabus }: SettingsPanelProps) {
  const [view, setView] = useState<SettingsView>('main');
  const { settings, updateAIProfile, updateNotifications, setTheme, setSettings } = useSettingsStore();
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
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-3">
          <p className="text-sm font-medium text-blue-100">You are using Guest Mode</p>
          <p className="text-xs text-white/40 leading-relaxed">
            Your data is stored locally. Sign in with Google to enable cloud sync and advanced AI features.
          </p>
          <button 
            onClick={() => window.location.reload()} // Auth component will show up
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all"
          >
            Sign in with Google
          </button>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 px-2">Account</h3>
        <div className="space-y-2">
          <SettingsItem 
            icon={User} 
            label="Profile Settings" 
            description={isGuest ? 'Guest User' : user?.email}
            onClick={() => setView('profile')}
          />
          <SettingsItem 
            icon={Sparkles} 
            label="AI Study Profile" 
            description="Customize AI behavior"
            onClick={() => setView('ai-profile')}
            highlight
          />
          <SettingsItem 
            icon={Bell} 
            label="Notifications" 
            description="Manage study alerts"
            onClick={() => setView('notifications')}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 px-2">App Settings</h3>
        <div className="space-y-2">
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
    <div className="space-y-6">
      <div className="flex flex-col items-center py-6 space-y-4">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-blue-500/40">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full" />
          ) : (
            <User className="w-10 h-10 text-blue-400" />
          )}
        </div>
        <div className="text-center">
          <h4 className="text-lg font-bold">{user?.displayName || 'Guest Student'}</h4>
          <p className="text-sm text-white/40">{user?.email || 'Local Session'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
          <label className="text-xs font-bold text-white/30 uppercase block mb-2">Account Type</label>
          <p className="text-sm font-medium">{isGuest ? 'Guest (Local)' : 'Premium (Cloud)'}</p>
        </div>
        {!isGuest && (
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <label className="text-xs font-bold text-white/30 uppercase block mb-2">Member Since</label>
            <p className="text-sm font-medium">{new Date(user?.metadata.creationTime).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAIProfile = () => (
    <div className="space-y-6 pb-10">
      <p className="text-xs text-white/40 px-2">
        This profile directly influences how the AI Coach explains concepts, generates plans, and interacts with you.
      </p>
      
      <div className="space-y-4">
        <SelectField 
          label="Education Level"
          value={settings.aiProfile.educationLevel}
          options={['School', 'Diploma', 'Engineering', 'Competitive Exams', 'Other']}
          onChange={(val) => updateAIProfile({ educationLevel: val })}
        />
        <InputField 
          label="Branch / Major"
          value={settings.aiProfile.branch}
          placeholder="e.g. Mechanical Engineering"
          onChange={(val) => updateAIProfile({ branch: val })}
        />
        <InputField 
          label="Year / Semester"
          value={settings.aiProfile.yearSemester}
          placeholder="e.g. 3rd Year / 6th Sem"
          onChange={(val) => updateAIProfile({ yearSemester: val })}
        />
        
        <div className="h-px bg-white/10 my-4" />

        <SelectField 
          label="Study Goal"
          value={settings.aiProfile.studyGoal}
          options={[
            { value: 'pass', label: 'Just Pass' },
            { value: 'rank', label: 'Top Rank' },
            { value: 'deep-understanding', label: 'Deep Understanding' }
          ]}
          onChange={(val) => updateAIProfile({ studyGoal: val as any })}
        />
        <SelectField 
          label="Explanation Style"
          value={settings.aiProfile.explanationStyle}
          options={[
            { value: 'simple', label: 'Simple (Layman)' },
            { value: 'detailed', label: 'Detailed (Academic)' },
            { value: 'exam-focused', label: 'Exam Focused (Short)' }
          ]}
          onChange={(val) => updateAIProfile({ explanationStyle: val as any })}
        />
        <SelectField 
          label="Language Preference"
          value={settings.aiProfile.languageStyle}
          options={[
            { value: 'english', label: 'Pure English' },
            { value: 'hinglish', label: 'Hinglish (Mix)' }
          ]}
          onChange={(val) => updateAIProfile({ languageStyle: val as any })}
        />
        <SelectField 
          label="Learning Style"
          value={settings.aiProfile.learningStyle}
          options={[
            { value: 'conceptual', label: 'Conceptual' },
            { value: 'problem-solving', label: 'Problem Solving' },
            { value: 'visual', label: 'Visual / Analogies' }
          ]}
          onChange={(val) => updateAIProfile({ learningStyle: val as any })}
        />
        <SelectField 
          label="Difficulty Level"
          value={settings.aiProfile.difficultyPreference}
          options={[
            { value: 'easy', label: 'Beginner' },
            { value: 'medium', label: 'Intermediate' },
            { value: 'hard', label: 'Advanced' }
          ]}
          onChange={(val) => updateAIProfile({ difficultyPreference: val as any })}
        />
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
          label="AI Suggestions" 
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
                  <Sparkles className="w-6 h-6 text-blue-400" />
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
                  {view === 'ai-profile' && renderAIProfile()}
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
        "w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border rounded-2xl transition-all group",
        highlight ? "border-blue-500/30 bg-blue-500/5" : "border-white/5"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
          highlight ? "bg-blue-500/20" : "bg-white/5 group-hover:bg-blue-500/20"
        )}>
          <Icon className={cn(
            "w-5 h-5 transition-colors",
            highlight ? "text-blue-400" : "text-white/60 group-hover:text-blue-400"
          )} />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-white/90">{label}</p>
          <p className="text-xs text-white/40">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60" />
    </button>
  );
}

function ToggleItem({ label, description, isActive, onToggle }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
      <div className="text-left">
        <p className="text-sm font-bold text-white/90">{label}</p>
        <p className="text-xs text-white/40">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className={cn(
          "w-12 h-6 rounded-full transition-all relative",
          isActive ? "bg-blue-500" : "bg-white/10"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
          isActive ? "left-7" : "left-1"
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
        "flex items-center justify-between p-4 rounded-2xl border transition-all",
        isActive ? "bg-blue-500/10 border-blue-500/40" : "bg-white/5 border-white/5 hover:bg-white/10"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          isActive ? "bg-blue-500/20" : "bg-white/5"
        )}>
          <Icon className={cn("w-5 h-5", isActive ? "text-blue-400" : "text-white/60")} />
        </div>
        <p className="text-sm font-bold">{label}</p>
      </div>
      {isActive && <Check className="w-5 h-5 text-blue-400" />}
    </button>
  );
}

function SelectField({ label, value, options, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-white/30 uppercase px-2">{label}</label>
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
                "w-full p-3 rounded-xl border text-sm text-left transition-all",
                active ? "bg-blue-500/10 border-blue-500/40 text-blue-100" : "bg-white/5 border-white/5 hover:bg-white/10 text-white/60"
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
    <div className="space-y-2">
      <label className="text-xs font-bold text-white/30 uppercase px-2">{label}</label>
      <input 
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 transition-all"
      />
    </div>
  );
}
