export const THEMES = {
  indigo: {
    primary: '#4F46E5',         // Indigo
    primaryDark: '#3730A3',     // Dark Indigo
    background: '#FAFBFD',      // Soft light gray background
    cardBackground: '#FFFFFF',  // Pure white
    border: '#E2E8F0',          // Slate border
    textPrimary: '#0F172A',     // Slate-900
    textSecondary: '#64748B',   // Slate-500
    white: '#FFFFFF',
    red: '#EF4444',
    accentGreen: '#10B981',
    accentOrange: '#F59E0B',
  },
  dark: {
    primary: '#818CF8',         // Light Indigo/Lavender
    primaryDark: '#6366F1',     // Dark Slate Indigo
    background: '#0F172A',      // Midnight blue background
    cardBackground: '#1E293B',  // Slate card background
    border: '#334155',          // Slate border
    textPrimary: '#F8FAFC',     // Off-white readability
    textSecondary: '#94A3B8',   // Light gray body text
    white: '#FFFFFF',
    red: '#F87171',
    accentGreen: '#34D399',
    accentOrange: '#FBBF24',
  },
  emerald: {
    primary: '#059669',         // Emerald Green
    primaryDark: '#047857',     // Dark Emerald
    background: '#F0FDF4',      // Soft green background
    cardBackground: '#FFFFFF',  // Pure white cards
    border: '#D1FAE5',          // Mint border
    textPrimary: '#064E3B',     // Deep forest text
    textSecondary: '#065F46',   // Forest body text
    white: '#FFFFFF',
    red: '#EF4444',
    accentGreen: '#10B981',
    accentOrange: '#F59E0B',
  }
};

// Backwards-compatible default colors export
export const COLORS = THEMES.indigo;
export type ThemeName = 'indigo' | 'dark' | 'emerald';
export type ThemeColorsType = typeof THEMES.indigo;
