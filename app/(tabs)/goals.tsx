import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { getHabits, saveHabits, deleteHabit as deleteHabitFromStorage } from '../../utils/storage';
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

export default function Goals() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>('other');
  
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
    error: '#F87171',
  } : {
    background: '#F3F4F6',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#667eea',
    success: '#10B981',
    error: '#EF4444',
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const loadedHabits = await getHabits();
      setHabits(loadedHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    const newHabit: Habit = {
      id: `${user?.uid || 'guest'}-${Date.now()}`,
      userId: user?.uid || 'guest',
      name: newHabitName.trim(),
      category: newHabitCategory,
      frequency: 'daily',
      targetCount: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedHabits = [...habits, newHabit];
    saveHabits(updatedHabits);
    setHabits(updatedHabits);
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
          onPress: async () => {
            await deleteHabitFromStorage(habitId);
            setHabits(habits.filter(h => h.id !== habitId));
          },
        },
      ]
    );
  };

  const handleToggleActive = async (habitId: string) => {
    const updatedHabits = habits.map(h => 
      h.id === habitId ? { ...h, isActive: !h.isActive, updatedAt: new Date() } : h
    );
    await saveHabits(updatedHabits);
    setHabits(updatedHabits);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Goals</Text>
        <Text style={styles.subtitle}>
          {isGuest ? 'Guest Mode' : 'Manage your habits'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Add Button */}
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => setShowModal(true)}>
          <Text style={styles.addButtonText}>+ Add New Habit</Text>
        </TouchableOpacity>

        {/* Habits List */}
        {habits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="flag-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No habits yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Add your first habit to get started!</Text>
          </View>
        ) : (
          habits.map((habit) => (
            <View key={habit.id} style={[styles.habitCard, { backgroundColor: colors.surface }]}>
              <View style={styles.habitHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[habit.category] + '20' }]}>
                  <Text style={[styles.categoryText, { color: CATEGORY_COLORS[habit.category] }]}>
                    {CATEGORIES.find(c => c.value === habit.category)?.emoji}{' '}
                    {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[styles.toggleButton, { backgroundColor: habit.isActive ? colors.success : colors.textSecondary }]}
                  onPress={() => handleToggleActive(habit.id)}
                >
                  <Text style={styles.toggleText}>
                    {habit.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[
                styles.habitName, 
                { color: habit.isActive ? colors.text : colors.textSecondary }
              ]}>
                {habit.name}
              </Text>
              
              <View style={styles.habitFooter}>
                <Text style={[styles.frequency, { color: colors.textSecondary }]}>
                  {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                </Text>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteHabit(habit.id)}
                >
                  <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Habit</Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Habit name"
              value={newHabitName}
              onChangeText={setNewHabitName}
              placeholderTextColor={colors.textSecondary}
            />
            
            <Text style={[styles.categoryLabel, { color: colors.text }]}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryOption,
                    { borderColor: colors.border },
                    newHabitCategory === cat.value && { 
                      backgroundColor: CATEGORY_COLORS[cat.value],
                      borderColor: CATEGORY_COLORS[cat.value],
                    }
                  ]}
                  onPress={() => setNewHabitCategory(cat.value)}
                >
                  <Text style={[
                    styles.categoryOptionText, 
                    { color: newHabitCategory === cat.value ? 'white' : colors.text }
                  ]}>
                    {cat.emoji} {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: colors.background }]}
                onPress={() => {
                  setShowModal(false);
                  setNewHabitName('');
                  setNewHabitCategory('other');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleAddHabit}
              >
                <Text style={styles.saveButtonText}>Add Habit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  habitCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  habitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  frequency: {
    fontSize: 14,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryOption: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryOptionText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
