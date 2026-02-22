import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useAppTheme } from '../../hooks/useAppTheme';
import { addHabit, deleteHabit, toggleHabitActive } from '../../redux/slice/habitsSlice';
import { Habit, HabitCategory } from '../../types';

const CATEGORIES: { value: HabitCategory; label: string; emoji: string }[] = [
  { value: 'prayer', label: 'Prayer', emoji: '🙏' },
  { value: 'quran', label: 'Quran', emoji: '📖' },
  { value: 'fasting', label: 'Fasting', emoji: '🌙' },
  { value: 'charity', label: 'Charity', emoji: '💝' },
  { value: 'dhikr', label: 'Dhikr', emoji: '✨' },
  { value: 'other', label: 'Other', emoji: '📝' },
];

const CATEGORY_COLORS: Record<HabitCategory, string> = {
  prayer: '#667eea',
  quran: '#764ba2',
  fasting: '#f093fb',
  charity: '#4facfe',
  dhikr: '#ffd200',
  other: '#667eea',
};

export default function Habits() {
  const [showModal, setShowModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>('other');

  const dispatch = useDispatch();
  const { user, isGuest } = useSelector((state: any) => state.auth);
  const { habits } = useSelector((state: any) => state.habits);
  const { isDarkMode, classes } = useAppTheme();

  const handleAddHabit = () => {
    if (!newHabitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    const newHabit: Habit = {
      id: `custom-${Date.now()}`,
      userId: user?.uid || 'guest',
      name: newHabitName.trim(),
      category: newHabitCategory,
      frequency: 'daily',
      targetCount: 1,
      isActive: true,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch(addHabit(newHabit));
    setShowModal(false);
    setNewHabitName('');
    setNewHabitCategory('other');
  };

  const handleDeleteHabit = (habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteHabit(habitId));
          },
        },
      ]
    );
  };

  const handleToggleActive = (habitId: string) => {
    dispatch(toggleHabitActive(habitId));
  };

  const defaultHabits = habits.filter((h: any) => h.isDefault);
  const customHabits = habits.filter((h: any) => !h.isDefault);

  return (
    <View className={`flex-1 ${classes.background}`}>
      {/* Header */}
      <View className={`px-5 pt-12 pb-5 ${classes.headerBg}`}>
        <Text className="text-3xl font-bold text-white">Habits</Text>
        <Text className="text-sm text-white/80 mt-1">
          {isGuest ? 'Guest Mode' : 'Manage your habits'}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Add Button */}
        <TouchableOpacity
          className={`px-4 py-4 rounded-xl items-center mb-5 ${classes.primary}`}
          onPress={() => setShowModal(true)}
        >
          <Text className="text-white text-base font-semibold">+ Add New Habit</Text>
        </TouchableOpacity>

        {/* Habits List */}
        {habits.length === 0 ? (
          <View className="items-center py-10">
            <Ionicons name="flag-outline" size={48} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Text className={`text-lg font-semibold mt-4 ${classes.text}`}>No habits yet</Text>
            <Text className={`text-sm mt-2 ${classes.textSecondary}`}>Add your first habit to get started!</Text>
          </View>
        ) : (
          <>
            {/* Default Habits Section */}
            {defaultHabits.length > 0 && (
              <>
                <Text className={`text-sm font-semibold mb-3 ${classes.textSecondary}`}>DEFAULT HABITS</Text>
                {defaultHabits.map((habit: any) => (
                  <View key={habit.id} className={`rounded-xl p-4 mb-3 ${classes.surface}`} style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
                    <View className="flex-row justify-between items-center mb-2">
                      <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: CATEGORY_COLORS[habit.category] + '20' }}>
                        <Text className="text-xs font-semibold" style={{ color: CATEGORY_COLORS[habit.category] }}>
                          {CATEGORIES.find(c => c.value === habit.category)?.emoji}{' '}
                          {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        className={`px-3 py-1 rounded-lg ${habit.isActive ? classes.activeBg : classes.inactiveBg}`}
                        onPress={() => handleToggleActive(habit.id)}
                      >
                        <Text className="text-white text-xs font-semibold">
                          {habit.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text className={`text-lg font-semibold mb-2 ${habit.isActive ? classes.text : classes.textSecondary}`}>
                      {habit.name}
                    </Text>

                    <View className="flex-row justify-between items-center">
                      <Text className={`text-sm ${classes.textSecondary}`}>
                        {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Custom Habits Section */}
            {customHabits.length > 0 && (
              <>
                <Text className={`text-sm font-semibold mb-3 mt-4 ${classes.textSecondary}`}>MY HABITS</Text>
                {customHabits.map((habit: any) => (
                  <View key={habit.id} className={`rounded-xl p-4 mb-3 ${classes.surface}`} style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
                    <View className="flex-row justify-between items-center mb-2">
                      <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: CATEGORY_COLORS[habit.category] + '20' }}>
                        <Text className="text-xs font-semibold" style={{ color: CATEGORY_COLORS[habit.category] }}>
                          {CATEGORIES.find(c => c.value === habit.category)?.emoji}{' '}
                          {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        className={`px-3 py-1 rounded-lg ${habit.isActive ? classes.activeBg : classes.inactiveBg}`}
                        onPress={() => handleToggleActive(habit.id)}
                      >
                        <Text className="text-white text-xs font-semibold">
                          {habit.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text className={`text-lg font-semibold mb-2 ${habit.isActive ? classes.text : classes.textSecondary}`}>
                      {habit.name}
                    </Text>

                    <View className="flex-row justify-between items-center">
                      <Text className={`text-sm ${classes.textSecondary}`}>
                        {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                      </Text>
                      <TouchableOpacity
                        className="px-3 py-1.5"
                        onPress={() => handleDeleteHabit(habit.id)}
                      >
                        <Text className={`text-sm font-semibold ${classes.error}`}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal 
        visible={showModal} 
        animationType="slide" 
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={Keyboard.dismiss}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View className={`rounded-t-3xl p-6 pb-20 ${classes.surface}`}>
            <Text className={`text-xl font-bold mb-5 text-center ${classes.text}`}>Add New Habit</Text>

            <TextInput
              className={`border-2 rounded-xl p-4 text-base mb-5 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${classes.text}`}
              placeholder="Habit name"
              value={newHabitName}
              onChangeText={setNewHabitName}
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            />

            <Text className={`text-base font-semibold mb-3 ${classes.text}`}>Category</Text>
            <View className="flex-row flex-wrap mb-5">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  className={`border-2 rounded-lg px-3 py-2 mr-2 mb-2 ${newHabitCategory === cat.value ? '' : classes.border}`}
                  style={{
                    backgroundColor: newHabitCategory === cat.value ? CATEGORY_COLORS[cat.value] : 'transparent',
                    borderColor: newHabitCategory === cat.value ? CATEGORY_COLORS[cat.value] : (isDarkMode ? '#374151' : '#E5E7EB'),
                  }}
                  onPress={() => setNewHabitCategory(cat.value)}
                >
                  <Text
                    className="text-sm"
                    style={{ color: newHabitCategory === cat.value ? 'white' : (isDarkMode ? '#F9FAFB' : '#1F2937') }}
                  >
                    {cat.emoji} {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row">
              <TouchableOpacity
                className={`flex-1 px-4 py-4 rounded-xl mr-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                onPress={() => {
                  setShowModal(false);
                  setNewHabitName('');
                  setNewHabitCategory('other');
                }}
              >
                <Text className={`text-base font-semibold text-center ${classes.textSecondary}`}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 px-4 py-4 rounded-xl ml-2 ${classes.primary}`}
                onPress={handleAddHabit}
              >
                <Text className="text-white text-base font-semibold text-center">Add Habit</Text>
              </TouchableOpacity>
            </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
