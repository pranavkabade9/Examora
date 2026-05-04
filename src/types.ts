export type Theme = 'light' | 'dark' | 'system';

export interface NotificationSettings {
  studyReminders: boolean;
  dailyGoalAlerts: boolean;
  aiSuggestions: boolean;
}

export interface UserSettings {
  notifications: NotificationSettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    studyReminders: true,
    dailyGoalAlerts: true,
    aiSuggestions: true,
  }
};
