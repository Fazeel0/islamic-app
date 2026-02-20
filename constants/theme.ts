// Theme constants for the Islamic Habit Tracker app

export const Colors = {
  light: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#F3F4F6',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    // Category colors
    prayer: '#667eea',
    quran: '#764ba2',
    fasting: '#f093fb',
    charity: '#4facfe',
    dhikr: '#ffd200',
    other: '#667eea',
  },
  dark: {
    primary: '#818cf8',
    secondary: '#a78bfa',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    // Category colors
    prayer: '#818cf8',
    quran: '#a78bfa',
    fasting: '#f472b6',
    charity: '#60a5fa',
    dhikr: '#facc15',
    other: '#818cf8',
  },
};

export type ColorScheme = keyof typeof Colors;
