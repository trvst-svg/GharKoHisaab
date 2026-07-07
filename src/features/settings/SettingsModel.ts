import { Platform } from 'react-native';
import { getDB } from '../../database/connection';

// Initialize settings schema (runs on first launch of setting module)
export async function initSettingsSchema(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const db = await getDB();
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );`
    );
  } catch (error) {
    console.error('Failed to initialize settings schema:', error);
  }
}

// Fetch a setting value by key
export async function getSetting(key: string, defaultValue: string): Promise<string> {
  if (Platform.OS === 'web') {
    const val = localStorage.getItem(`setting_${key}`);
    return val !== null ? val : defaultValue;
  }

  try {
    const db = await getDB();
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ? LIMIT 1;',
      [key]
    );
    return result ? result.value : defaultValue;
  } catch (error) {
    console.error(`Failed to get setting for key "${key}":`, error);
    return defaultValue;
  }
}

// Save or update a setting value
export async function setSetting(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(`setting_${key}`, value);
    return;
  }

  try {
    const db = await getDB();
    await db.runAsync(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;',
      [key, value]
    );
  } catch (error) {
    console.error(`Failed to set setting for key "${key}":`, error);
  }
}
