import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Types for your Islamic app
export interface UserPreferences {
  userId: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
  calculationMethod: string; // e.g., "Karachi", "ISNA", "Makkah"
  notifications: {
    prayerAlerts: boolean;
    quranReminders: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

export interface PrayerRecord {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

// COLLECTION NAMES
const USERS_COLLECTION = 'users';
const PRAYER_RECORDS_COLLECTION = 'prayerRecords';

// ===== USER PREFERENCES =====

// Save or update user preferences
export const saveUserPreferences = async (userId: string, data: Partial<UserPreferences>) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, {
      ...data,
      updatedAt: new Date()
    }, { merge: true });
    console.log('Preferences saved successfully!');
    return true;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return false;
  }
};

// Get user preferences
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const snapshot = await getDoc(userRef);
    
    if (snapshot.exists()) {
      return snapshot.data() as UserPreferences;
    }
    return null;
  } catch (error) {
    console.error('Error getting preferences:', error);
    return null;
  }
};

// Update specific preference
export const updateUserPreference = async (userId: string, key: string, value: any) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      [key]: value,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating preference:', error);
    return false;
  }
};

// ===== PRAYER TRACKING =====

// Save daily prayer record
export const savePrayerRecord = async (userId: string, date: string, prayers: Omit<PrayerRecord, 'id' | 'userId' | 'date'>) => {
  try {
    const recordRef = doc(db, PRAYER_RECORDS_COLLECTION, `${userId}_${date}`);
    await setDoc(recordRef, {
      userId,
      date,
      ...prayers,
      updatedAt: new Date()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving prayer record:', error);
    return false;
  }
};

// Get prayer record for a specific date
export const getPrayerRecord = async (userId: string, date: string): Promise<PrayerRecord | null> => {
  try {
    const recordRef = doc(db, PRAYER_RECORDS_COLLECTION, `${userId}_${date}`);
    const snapshot = await getDoc(recordRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as PrayerRecord;
    }
    return null;
  } catch (error) {
    console.error('Error getting prayer record:', error);
    return null;
  }
};

// Get all prayer records for a user
export const getAllPrayerRecords = async (userId: string): Promise<PrayerRecord[]> => {
  try {
    const q = query(
      collection(db, PRAYER_RECORDS_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrayerRecord));
  } catch (error) {
    console.error('Error getting prayer records:', error);
    return [];
  }
};

// Get monthly statistics
export const getMonthlyStats = async (userId: string, year: number, month: number): Promise<{
  total: number;
  completed: number;
  percentage: number;
}> => {
  try {
    // Get all records for the month
    const records = await getAllPrayerRecords(userId);
    const monthRecords = records.filter(r => {
      const [recordYear, recordMonth] = r.date.split('-').map(Number);
      return recordYear === year && recordMonth === month;
    });

    const total = monthRecords.length * 5; // 5 prayers per day
    const completed = monthRecords.reduce((sum, r) => {
      return sum + (r.fajr ? 1 : 0) + (r.dhuhr ? 1 : 0) + (r.asr ? 1 : 0) + (r.maghrib ? 1 : 0) + (r.isha ? 1 : 0);
    }, 0);

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  } catch (error) {
    console.error('Error getting monthly stats:', error);
    return { total: 0, completed: 0, percentage: 0 };
  }
};
