import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getHabits, getCompletions } from '../../utils/storage';
import { getPastNDays } from '../../utils/dateUtils';

export default function Analytics() {
  const [habits, setHabits] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCompletions: 0,
    currentStreak: 0,
    weeklyProgress: 0,
    completionRate: 0,
  });
  
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
    success: '#34D399',
    successBg: '#064E3B',
  } : {
    background: '#F3F4F6',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#667eea',
    success: '#10B981',
    successBg: '#D1FAE5',
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const loadedHabits = await getHabits();
      const loadedCompletions = await getCompletions();
      
      setHabits(loadedHabits);
      setCompletions(loadedCompletions);
      
      // Calculate stats
      const completedCount = loadedCompletions.filter(c => c.completed).length;
      const totalPossible = loadedHabits.length * 7; // Last 7 days
      const completionRate = totalPossible > 0 ? (completedCount / totalPossible) * 100 : 0;
      
      // Calculate current streak
      const streak = calculateStreak(loadedCompletions, loadedHabits);
      
      // Calculate weekly progress
      const weekDates = getPastNDays(7);
      const thisWeekCompletions = loadedCompletions.filter(c => 
        weekDates.includes(c.date) && c.completed
      ).length;
      
      setStats({
        totalCompletions: completedCount,
        currentStreak: streak,
        weeklyProgress: thisWeekCompletions,
        completionRate: Math.round(completionRate),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const calculateStreak = (completions: any[], habits: any[]): number => {
    const dates = getPastNDays(30);
    let streak = 0;
    
    for (const date of dates) {
      const dayCompletions = completions.filter(c => c.date === date && c.completed);
      const activeHabits = habits.filter(h => h.isActive);
      
      if (dayCompletions.length >= activeHabits.length && activeHabits.length > 0) {
        streak++;
      } else if (streak > 0) {
        break;
      }
    }
    
    return streak;
  };

  const getHabitStats = () => {
    return habits.map(habit => {
      const habitCompletions = completions.filter(c => c.habitId === habit.id);
      const completedCount = habitCompletions.filter(c => c.completed).length;
      const rate = Math.round((completedCount / 30) * 100); // Last 30 days
      
      return {
        name: habit.name,
        category: habit.category,
        completed: completedCount,
        rate,
      };
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>
          {isGuest ? 'Guest Mode' : 'Track your progress'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.currentStreak}</Text>
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={16} color={colors.textSecondary} />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}> Day Streak</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.weeklyProgress}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Week</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalCompletions}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.completionRate}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rate</Text>
          </View>
        </View>

        {/* Completion Rate */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Overall Completion Rate</Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${stats.completionRate}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>{stats.completionRate}% completed</Text>
        </View>

        {/* Per-Habit Stats */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Habit Performance (30 days)</Text>
          {getHabitStats().map((habit, index) => (
            <View key={index} style={styles.habitStatItem}>
              <View style={styles.habitStatInfo}>
                <Text style={[styles.habitStatName, { color: colors.text }]}>{habit.name}</Text>
                <Text style={[styles.habitStatCount, { color: colors.textSecondary }]}>{habit.completed}/30 days</Text>
              </View>
              <View style={[styles.habitProgressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.habitProgressFill, { width: `${habit.rate}%`, backgroundColor: colors.success }]} />
              </View>
              <Text style={[styles.habitRate, { color: colors.success }]}>{habit.rate}%</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
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
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'right',
  },
  habitStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitStatInfo: {
    width: 100,
  },
  habitStatName: {
    fontSize: 14,
    fontWeight: '600',
  },
  habitStatCount: {
    fontSize: 12,
  },
  habitProgressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  habitProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  habitRate: {
    width: 40,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
});
