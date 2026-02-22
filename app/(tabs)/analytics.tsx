import { View, Text, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { getPastNDays } from '../../utils/dateUtils';
import { useAppTheme } from '../../hooks/useAppTheme';

export default function Analytics() {
  const { habits, completions } = useSelector((state: any) => state.habits);
  const { isGuest } = useSelector((state: any) => state.auth);
  const { isDarkMode, colors, classes } = useAppTheme();

  // Calculate stats
  const completedCount = completions.filter((c: any) => c.completed).length;
  const totalPossible = habits.filter((h: any) => h.isActive).length * 7;
  const completionRate = totalPossible > 0 ? (completedCount / totalPossible) * 100 : 0;
  
  // Calculate current streak
  const calculateStreak = () => {
    const dates = getPastNDays(30);
    let streak = 0;
    
    for (const date of dates) {
      const dayCompletions = completions.filter((c: any) => c.date === date && c.completed);
      const activeHabits = habits.filter((h: any) => h.isActive);
      
      if (dayCompletions.length >= activeHabits.length && activeHabits.length > 0) {
        streak++;
      } else if (streak > 0) {
        break;
      }
    }
    
    return streak;
  };

  // Calculate weekly progress
  const weekDates = getPastNDays(7);
  const thisWeekCompletions = completions.filter((c: any) => 
    weekDates.includes(c.date) && c.completed
  ).length;

  const stats = {
    totalCompletions: completedCount,
    currentStreak: calculateStreak(),
    weeklyProgress: thisWeekCompletions,
    completionRate: Math.round(completionRate),
  };

  const getHabitStats = () => {
    return habits.map((habit: any) => {
      const habitCompletions = completions.filter((c: any) => c.habitId === habit.id);
      const completedCount = habitCompletions.filter((c: any) => c.completed).length;
      const rate = Math.round((completedCount / 30) * 100);
      
      return {
        name: habit.name,
        category: habit.category,
        completed: completedCount,
        rate,
      };
    });
  };

  return (
    <View className={`flex-1 ${classes.background}`}>
      {/* Header */}
      <View className={`px-5 pt-12 pb-5 ${classes.headerBg}`}>
        <Text className="text-3xl font-bold text-white">Analytics</Text>
        <Text className="text-sm text-white/80 mt-1">
          {isGuest ? 'Guest Mode' : 'Track your progress'}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-4">
          <View className={`w-[48%] rounded-2xl p-5 mb-3 items-center ${classes.surface}`} style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
            <Text className={`text-3xl font-bold ${classes.primaryText}`}>{stats.currentStreak}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="flame" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Text className={`text-sm mt-0.5 ${classes.textSecondary}`}> Day Streak</Text>
            </View>
          </View>
          <View className={`w-[48%] rounded-2xl p-5 mb-3 items-center ${classes.surface}`} style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
            <Text className={`text-3xl font-bold ${classes.primaryText}`}>{stats.weeklyProgress}</Text>
            <Text className={`text-sm mt-1 ${classes.textSecondary}`}>This Week</Text>
          </View>
          <View className={`w-[48%] rounded-2xl p-5 mb-3 items-center ${classes.surface}`} style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
            <Text className={`text-3xl font-bold ${classes.primaryText}`}>{stats.totalCompletions}</Text>
            <Text className={`text-sm mt-1 ${classes.textSecondary}`}>Total</Text>
          </View>
          <View className={`w-[48%] rounded-2xl p-5 mb-3 items-center ${classes.surface}`} style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
            <Text className={`text-3xl font-bold ${classes.primaryText}`}>{stats.completionRate}%</Text>
            <Text className={`text-sm mt-1 ${classes.textSecondary}`}>Rate</Text>
          </View>
        </View>

        {/* Completion Rate */}
        <View className={`rounded-2xl p-5 mb-4 ${classes.surface}`} style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
          <Text className={`text-lg font-semibold mb-4 ${classes.text}`}>Overall Completion Rate</Text>
          <View className={`h-3 rounded-lg overflow-hidden mb-2 ${classes.border}`}>
            <View className="h-full rounded-lg" style={{ width: `${stats.completionRate}%`, backgroundColor: isDarkMode ? '#818cf8' : '#667eea' }} />
          </View>
          <Text className={`text-sm text-right ${classes.textSecondary}`}>{stats.completionRate}% completed</Text>
        </View>

        {/* Per-Habit Stats */}
        <View className={`rounded-2xl p-5 mb-4 ${classes.surface}`} style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
          <Text className={`text-lg font-semibold mb-4 ${classes.text}`}>Habit Performance (30 days)</Text>
          {getHabitStats().map((habit, index) => (
            <View key={index} className="flex-row items-center mb-3">
              <View className="w-[100px]">
                <Text className={`text-sm font-semibold ${classes.text}`}>{habit.name}</Text>
                <Text className={`text-xs ${classes.textSecondary}`}>{habit.completed}/30 days</Text>
              </View>
              <View className={`flex-1 h-2 rounded-lg mx-3 overflow-hidden ${classes.border}`}>
                <View className="h-full rounded-lg" style={{ width: `${habit.rate}%`, backgroundColor: isDarkMode ? '#34D399' : '#10B981' }} />
              </View>
              <Text className={`w-10 text-sm font-semibold text-right ${classes.success}`}>{habit.rate}%</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
