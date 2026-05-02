import { create } from 'zustand';
import { UserSettings, DEFAULT_SETTINGS, Theme } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  setSettings: (settings: Partial<UserSettings>) => void;
  updateNotifications: (notifications: Partial<UserSettings['notifications']>) => void;
  setTheme: (theme: Theme) => void;
  loadSettings: (userId?: string) => Promise<void>;
  syncToBackend: () => Promise<void>;
}

const SETTINGS_LOCAL_KEY = 'exam_killer_settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,

  setSettings: (newSettings) => {
    const updatedSettings = { ...get().settings, ...newSettings };
    set({ settings: updatedSettings });
    
    // Save to localStorage immediately
    localStorage.setItem(SETTINGS_LOCAL_KEY, JSON.stringify(updatedSettings));
    
    // Apply theme
    applyTheme(updatedSettings.theme);
    
    // Sync to backend if logged in
    get().syncToBackend();
  },

  updateNotifications: (notifications) => {
    const updatedSettings = {
      ...get().settings,
      notifications: { ...get().settings.notifications, ...notifications }
    };
    get().setSettings(updatedSettings);
  },

  setTheme: (theme) => {
    get().setSettings({ theme });
  },

  loadSettings: async (userId) => {
    set({ isLoading: true });
    try {
      let loadedSettings = DEFAULT_SETTINGS;

      // 1. Try LocalStorage
      const localData = localStorage.getItem(SETTINGS_LOCAL_KEY);
      if (localData) {
        loadedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(localData) };
      }

      // 2. Try Firebase if userId provided
      if (userId) {
        const docRef = doc(db, 'settings', userId);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            loadedSettings = { ...loadedSettings, ...docSnap.data() };
          } else {
            // If no settings in Firebase, save local ones there
            await setDoc(docRef, loadedSettings);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `settings/${userId}`);
        }
      }

      set({ settings: loadedSettings, isLoading: false });
      applyTheme(loadedSettings.theme);
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoading: false });
    }
  },

  syncToBackend: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const docRef = doc(db, 'settings', userId);
      await setDoc(docRef, get().settings);
      console.log('Settings synced to backend');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `settings/${userId}`);
    }
  }
}));

function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');

  const updateTheme = () => {
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  };

  updateTheme();

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = () => {
    if (theme === 'system') updateTheme();
  };

  mediaQuery.removeEventListener('change', listener);
  mediaQuery.addEventListener('change', listener);
}
