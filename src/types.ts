export type Theme = 'light' | 'dark' | 'system';

export interface NotificationSettings {
  studyReminders: boolean;
  dailyGoalAlerts: boolean;
  aiSuggestions: boolean;
}

export interface UserSettings {
  theme: Theme;
  notifications: NotificationSettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  notifications: {
    studyReminders: true,
    dailyGoalAlerts: true,
    aiSuggestions: true,
  }
};
