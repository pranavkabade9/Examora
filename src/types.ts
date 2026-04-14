export type Theme = 'light' | 'dark' | 'system';

export interface AIProfile {
  educationLevel: string;
  branch: string;
  yearSemester: string;
  studyGoal: 'pass' | 'rank' | 'deep-understanding';
  explanationStyle: 'simple' | 'detailed' | 'exam-focused';
  languageStyle: 'english' | 'hinglish';
  learningStyle: 'conceptual' | 'problem-solving' | 'visual';
  difficultyPreference: 'easy' | 'medium' | 'hard';
}

export interface NotificationSettings {
  studyReminders: boolean;
  dailyGoalAlerts: boolean;
  aiSuggestions: boolean;
}

export interface UserSettings {
  theme: Theme;
  notifications: NotificationSettings;
  aiProfile: AIProfile;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  notifications: {
    studyReminders: true,
    dailyGoalAlerts: true,
    aiSuggestions: true,
  },
  aiProfile: {
    educationLevel: '',
    branch: '',
    yearSemester: '',
    studyGoal: 'pass',
    explanationStyle: 'simple',
    languageStyle: 'english',
    learningStyle: 'conceptual',
    difficultyPreference: 'medium',
  },
};
