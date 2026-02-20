import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { getHabits, getCompletionsForDate, saveCompletion } from '../../utils/storage';
import { getTodayDate, formatDisplayDate, getDaysAgo, getDayName } from '../../utils/dateUtils';
import { Habit, Completion, CATEGORY_ICONS } from '../../types';

export default function DailyTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [loading, setLoading] = useState(true);
  
  const { user, isGuest } = useSelector((state: any) => state.auth);
  const { isDarkMode } = useSelector((state: any) => state.theme);

  // Theme colors
  const colors = isDarkMode ? {
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    primary: '#818cf8',
    primaryDark: '#6366f1',
    success: '#34D399',
    successBg: '#064E3B',
  } : {
    background: '#F3F4F6',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#667eea',
    primaryDark: '#5a67d8',
    success: '#10B981',
    successBg: '#D1FAE5',
  };

  // Load habits and completions
  const loadData = async () => {
    try {
      setLoading(true);
      const loadedHabits = await getHabits();
      const loadedCompletions = await getCompletionsForDate(selectedDate);
      
      // If no habits, add default habits
      if (loadedHabits.length === 0) {
        const defaultHabits = getDefaultHabits(user?.uid || 'guest');
        setHabits(defaultHabits);
      } else {
        setHabits(loadedHabits);
      }
      
      setCompletions(loadedCompletions);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Toggle habit completion
  const toggleCompletion = async (habitId: string) => {
    try {
      const existing = completions.find(c => c.habitId === habitId);
      const newCompletion: Completion = {
        id: existing?.id || `${habitId}-${selectedDate}`,
        habitId,
        userId: user?.uid || 'guest',
        date: selectedDate,
        completed: !existing?.completed,
        localUpdatedAt: new Date(),
      };
      
      await saveCompletion(newCompletion);
      
      // Update local state
      if (existing) {
        setCompletions(prev => 
          prev.map(c => c.habitId === habitId ? newCompletion : c)
        );
      } else {
        setCompletions(prev => [...prev, newCompletion]);
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  // Get dates for the week
  const getWeekDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      dates.push(getDaysAgo(i));
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // Check if habit is completed
  const isCompleted = (habitId: string) => {
    return completions.some(c => c.habitId === habitId && c.completed);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Daily Tracker</Text>
        <Text style={styles.subtitle}>
          {isGuest ? 'Guest Mode' : user?.email}
        </Text>
      </View>

      {/* Date Selector */}
      <View style={[styles.dateSelector, { backgroundColor: colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weekDates.map((date) => {
            const isToday = date === getTodayDate();
            const isSelected = date === selectedDate;
            return (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dateButton,
                  isSelected && { backgroundColor: colors.primary },
                  isToday && !isSelected && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dateDayName,
                  isSelected && styles.dateTextActive,
                  !isSelected && { color: colors.textSecondary }
                ]}>
                  {getDayName(date, true)}
                </Text>
                <Text style={[
                  styles.dateDay,
                  isSelected && styles.dateTextActive,
                  !isSelected && { color: colors.text }
                ]}>
                  {new Date(date).getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected Date Display */}
      <Text style={[styles.selectedDate, { color: colors.text }]}>{formatDisplayDate(selectedDate)}</Text>

      {/* Habits List */}
      <ScrollView style={styles.habitsList}>
        {loading ? (
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
        ) : habits.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No habits yet. Add some in Goals tab!</Text>
        ) : (
          habits.filter(h => h.isActive).map((habit) => (
            <TouchableOpacity
              key={habit.id}
              style={[
                styles.habitItem,
                { backgroundColor: isCompleted(habit.id) ? colors.successBg : colors.surface }
              ]}
              onPress={() => toggleCompletion(habit.id)}
            >
              <View style={styles.habitInfo}>
                <Text style={styles.habitIcon}>{CATEGORY_ICONS[habit.category]}</Text>
                <View style={styles.habitDetails}>
                  <Text style={[
                    styles.habitName,
                    { color: isCompleted(habit.id) ? colors.success : colors.text }
                  ]}>
                    {habit.name}
                  </Text>
                  <Text style={[styles.habitCategory, { color: colors.textSecondary }]}>
                    {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.checkbox,
                { borderColor: isCompleted(habit.id) ? colors.success : colors.border },
                isCompleted(habit.id) && { backgroundColor: colors.success }
              ]}>
                {isCompleted(habit.id) && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Progress Summary */}
      <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.progressText, { color: colors.text }]}>
          {completions.filter(c => c.completed).length} / {habits.filter(h => h.isActive).length} completed
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[
            styles.progressFill,
            { 
              width: `${(completions.filter(c => c.completed).length / Math.max(habits.filter(h => h.isActive).length, 1)) * 100}%`,
              backgroundColor: colors.success
            }
          ]} />
        </View>
      </View>
    </View>
  );
}

// Default habits
function getDefaultHabits(userId: string): Habit[] {
  return [
    {
      id: `${userId}-fajr`,
      userId,
      name: 'Fajr Prayer',
      category: 'prayer',
      frequency: 'daily',
      targetCount: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `${userId}-dhuhr`,
      userId,
      name: 'Dhuhr Prayer',
      category: 'prayer',
      frequency: 'daily',
      targetCount: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `${userId}-asr`,
      userId,
      name: 'Asr Prayer',
      category: 'prayer',
      frequency: 'daily',
      targetCount: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `${userId}-maghrib`,
      userId,
      name: 'Maghrib Prayer',
      category: 'prayer',
      frequency: 'daily',
      targetCount: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `${userId}-isha`,
      userId,
      name: 'Isha Prayer',
      category: 'prayer',
      frequency: 'daily',
      targetCount: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `${userId}-quran`,
      userId,
      name: 'Read Quran',
      category: 'quran',
      frequency: 'daily',
      targetCount: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `${userId}-dhikr`,
      userId,
      name: 'Morning/Evening Dhikr',
      category: 'dhikr',
      frequency: 'daily',
      targetCount: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  dateSelector: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  dateButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    minWidth: 50,
  },
  dateDayName: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  dateTextActive: {
    color: 'white',
  },
  selectedDate: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '600',
  },
  habitsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  habitItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
  },
  habitCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
