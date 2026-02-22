import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getTodayDate, formatDisplayDate, getDaysAgo, getDayName } from '../../utils/dateUtils';
import { CATEGORY_ICONS, HabitCategory } from '../../types';
import { useAppTheme } from '../../hooks/useAppTheme';
import { toggleCompletion as toggleCompletionAction } from '../../redux/slice/habitsSlice';

export default function DailyTracker() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  
  const dispatch = useDispatch();
  const { user, isGuest } = useSelector((state: any) => state.auth);
  const { habits, completions } = useSelector((state: any) => state.habits);
  const { isDarkMode, classes } = useAppTheme();

  // Get active habits
  const activeHabits = habits.filter((h: any) => h.isActive);
  
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
    return completions.some((c: any) => c.habitId === habitId && c.date === selectedDate && c.completed);
  };

  // Calculate progress
  const completedCount = activeHabits.filter((h: any) => isCompleted(h.id)).length;
  const totalHabits = activeHabits.length;
  const progressPercent = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

  // Toggle completion
  const handleToggleCompletion = (habitId: string) => {
    dispatch(toggleCompletionAction({ habitId, date: selectedDate }));
  };

  // Get colors for completed state
  const getCompletedColors = (completed: boolean) => {
    if (completed) {
      return isDarkMode 
        ? { bg: '#064E3B', border: '#34D399', text: '#34D399' }
        : { bg: '#D1FAE5', border: '#10B981', text: '#10B981' };
    }
    return { bg: '', border: '', text: '' };
  };

  return (
    <View className={`flex-1 ${classes.background}`}>
      {/* Header */}
      <View className={`${classes.primary} pt-12 pb-5 px-5`}>
        <Text className="text-3xl font-bold text-white">Daily Tracker</Text>
        <Text className="text-sm text-white/80 mt-1">
          {isGuest ? 'Guest Mode' : user?.email}
        </Text>
      </View>

      {/* Date Selector */}
      <View className={`${classes.surface} py-4 px-2`}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weekDates.map((date) => {
            const isToday = date === getTodayDate();
            const isSelected = date === selectedDate;
            return (
              <TouchableOpacity
                key={date}
                className={`items-center px-4 py-2 mx-1 rounded-xl min-w-[50px] ${
                  isSelected ? classes.primary : ''
                } ${isToday && !isSelected ? `border-2 ${classes.primaryText}` : ''}`}
                onPress={() => setSelectedDate(date)}
              >
                <Text className={`text-xs font-semibold ${
                  isSelected ? 'text-white' : classes.textSecondary
                }`}>
                  {getDayName(date, true)}
                </Text>
                <Text className={`text-lg font-bold mt-0.5 ${
                  isSelected ? 'text-white' : classes.text
                }`}>
                  {new Date(date).getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected Date Display */}
      <Text className={`text-base text-center py-3 font-semibold ${classes.text}`}>
        {formatDisplayDate(selectedDate)}
      </Text>

      {/* Habits List */}
      <ScrollView className="flex-1 px-4">
        {/* Progress Bar */}
        <View className="mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className={`text-sm font-semibold ${classes.text}`}>Today's Progress</Text>
            <Text className={`text-sm ${classes.textSecondary}`}>{Math.round(progressPercent)}%</Text>
          </View>
          <View className={`h-2 rounded-lg ${classes.border}`}>
            <View 
              className={`h-full rounded-lg ${classes.primary}`}
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>

        {/* Habits - Card changes color when completed */}
        {activeHabits.map((habit: any) => {
          const completed = isCompleted(habit.id);
          const completedColors = getCompletedColors(completed);
          
          return (
            <TouchableOpacity
              key={habit.id}
              className="rounded-xl p-4 mb-3"
              style={{ 
                backgroundColor: completedColors.bg || (isDarkMode ? '#1F2937' : '#FFFFFF'),
                borderLeftWidth: 4,
                borderLeftColor: completedColors.border || (isDarkMode ? '#374151' : '#E5E7EB'),
                elevation: 2, 
                shadowColor: '#000', 
                shadowOffset: { width: 0, height: 1 }, 
                shadowOpacity: 0.1, 
                shadowRadius: 2 
              }}
              onPress={() => handleToggleCompletion(habit.id)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Text className="text-2xl mr-3">{CATEGORY_ICONS[habit.category as HabitCategory]}</Text>
                  <View className="flex-1">
                    <Text className={`text-base font-semibold ${completed ? 'text-green-600' : classes.text}`}
                      style={completed ? { color: completedColors.text } : {}}
                    >
                      {habit.name}
                    </Text>
                    <Text className={`text-xs ${classes.textSecondary}`}>
                      {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <View 
                  className="w-7 h-7 rounded-full items-center justify-center"
                  style={{ 
                    borderWidth: 2,
                    borderColor: completedColors.border || (isDarkMode ? '#374151' : '#E5E7EB'),
                    backgroundColor: completed ? completedColors.border : 'transparent'
                  }}
                >
                  {completed && <Text className="text-white font-bold">✓</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
