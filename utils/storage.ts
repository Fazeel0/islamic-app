// ============================================
// Local Storage Utility Functions (Offline-First)
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, Completion, SyncQueueItem, User } from '../types';

// Storage Keys
const STORAGE_KEYS = {
  USER: '@habit_tracker_user',
  HABITS: '@habit_tracker_habits',
  COMPLETIONS: '@habit_tracker_completions',
  SYNC_QUEUE: '@habit_tracker_sync_queue',
  LAST_SYNC: '@habit_tracker_last_sync',
  PENDING_SYNC: '@habit_tracker_pending_sync',
};

// ============================================
// User Storage
// ============================================

/**
 * Save user to local storage
 */
export const saveUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

/**
 * Get user from local storage
 */
export const getUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

/**
 * Remove user from local storage (logout)
 */
export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER,
      STORAGE_KEYS.HABITS,
      STORAGE_KEYS.COMPLETIONS,
      STORAGE_KEYS.SYNC_QUEUE,
      STORAGE_KEYS.LAST_SYNC,
    ]);
  } catch (error) {
    console.error('Error removing user:', error);
    throw error;
  }
};

// ============================================
// Habits Storage
// ============================================

/**
 * Save all habits to local storage
 */
export const saveHabits = async (habits: Habit[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (error) {
    console.error('Error saving habits:', error);
    throw error;
  }
};

/**
 * Get all habits from local storage
 */
export const getHabits = async (): Promise<Habit[]> => {
  try {
    const habitsJson = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
    return habitsJson ? JSON.parse(habitsJson) : [];
  } catch (error) {
    console.error('Error getting habits:', error);
    return [];
  }
};

/**
 * Add a single habit to local storage
 */
export const addHabit = async (habit: Habit): Promise<void> => {
  const habits = await getHabits();
  habits.push(habit);
  await saveHabits(habits);
};

/**
 * Update a habit in local storage
 */
export const updateHabit = async (updatedHabit: Habit): Promise<void> => {
  const habits = await getHabits();
  const index = habits.findIndex(h => h.id === updatedHabit.id);
  if (index !== -1) {
    habits[index] = updatedHabit;
    await saveHabits(habits);
  }
};

/**
 * Delete a habit from local storage
 */
export const deleteHabit = async (habitId: string): Promise<void> => {
  const habits = await getHabits();
  const filtered = habits.filter(h => h.id !== habitId);
  await saveHabits(filtered);
};

// ============================================
// Completions Storage
// ============================================

/**
 * Save all completions to local storage
 */
export const saveCompletions = async (completions: Completion[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
  } catch (error) {
    console.error('Error saving completions:', error);
    throw error;
  }
};

/**
 * Get all completions from local storage
 */
export const getCompletions = async (): Promise<Completion[]> => {
  try {
    const completionsJson = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    return completionsJson ? JSON.parse(completionsJson) : [];
  } catch (error) {
    console.error('Error getting completions:', error);
    return [];
  }
};

/**
 * Get completions for a specific date
 */
export const getCompletionsForDate = async (date: string): Promise<Completion[]> => {
  const completions = await getCompletions();
  return completions.filter(c => c.date === date);
};

/**
 * Get completions for a specific habit
 */
export const getCompletionsForHabit = async (habitId: string): Promise<Completion[]> => {
  const completions = await getCompletions();
  return completions.filter(c => c.habitId === habitId);
};

/**
 * Add or update a completion
 */
export const saveCompletion = async (completion: Completion): Promise<void> => {
  const completions = await getCompletions();
  const index = completions.findIndex(
    c => c.habitId === completion.habitId && c.date === completion.date
  );
  
  if (index !== -1) {
    completions[index] = completion;
  } else {
    completions.push(completion);
  }
  
  await saveCompletions(completions);
};

// ============================================
// Sync Queue Storage (Offline-First)
// ============================================

/**
 * Add item to sync queue
 */
export const addToSyncQueue = async (item: SyncQueueItem): Promise<void> => {
  try {
    const queue = await getSyncQueue();
    queue.push(item);
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    await setPendingSyncCount(queue.length);
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    throw error;
  }
};

/**
 * Get sync queue
 */
export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  try {
    const queueJson = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
};

/**
 * Clear sync queue after successful sync
 */
export const clearSyncQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    await setPendingSyncCount(0);
  } catch (error) {
    console.error('Error clearing sync queue:', error);
    throw error;
  }
};

/**
 * Remove specific item from sync queue
 */
export const removeFromSyncQueue = async (itemId: string): Promise<void> => {
  const queue = await getSyncQueue();
  const filtered = queue.filter(item => item.id !== itemId);
  await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filtered));
  await setPendingSyncCount(filtered.length);
};

// ============================================
// Sync Status
// ============================================

/**
 * Save last sync timestamp
 */
export const setLastSyncTime = async (date: Date): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, date.toISOString());
  } catch (error) {
    console.error('Error setting last sync time:', error);
  }
};

/**
 * Get last sync timestamp
 */
export const getLastSyncTime = async (): Promise<Date | null> => {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
};

/**
 * Set pending sync count
 */
export const setPendingSyncCount = async (count: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, count.toString());
  } catch (error) {
    console.error('Error setting pending sync count:', error);
  }
};

/**
 * Get pending sync count
 */
export const getPendingSyncCount = async (): Promise<number> => {
  try {
    const count = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error getting pending sync count:', error);
    return 0;
  }
};

// ============================================
// Clear All Data
// ============================================

/**
 * Clear all app data (for logout or data reset)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};
