const USER_NAME_KEY = 'riko.user.name';
let memoryUserName = '';

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getUserName(): Promise<string> {
  try {
    const value = await AsyncStorage.getItem(USER_NAME_KEY);
    if (value) {
      memoryUserName = value;
      return value;
    }
  } catch {
    // Fallback for runtimes where AsyncStorage native module is unavailable.
  }

  return memoryUserName;
}

export async function setUserName(name: string): Promise<void> {
  const trimmedName = name.trim();
  memoryUserName = trimmedName;

  try {
    await AsyncStorage.setItem(USER_NAME_KEY, trimmedName);
  } catch {
    // Keep working with in-memory fallback when native storage is unavailable.
  }
}
