import { createSlice } from '@reduxjs/toolkit';

// Default Islamic habits
const DEFAULT_HABITS = [
  {
    id: 'default-fajr',
    userId: 'default',
    name: 'Fajr Prayer',
    category: 'prayer',
    frequency: 'daily',
    targetCount: 1,
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-dhuhr',
    userId: 'default',
    name: 'Dhuhr Prayer',
    category: 'prayer',
    frequency: 'daily',
    targetCount: 1,
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-asr',
    userId: 'default',
    name: 'Asr Prayer',
    category: 'prayer',
    frequency: 'daily',
    targetCount: 1,
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-maghrib',
    userId: 'default',
    name: 'Maghrib Prayer',
    category: 'prayer',
    frequency: 'daily',
    targetCount: 1,
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-isha',
    userId: 'default',
    name: 'Isha Prayer',
    category: 'prayer',
    frequency: 'daily',
    targetCount: 1,
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialState = {
  habits: DEFAULT_HABITS,
  completions: [],
}

const habitsSlice = createSlice({
  name: "habits",
  initialState,
  reducers: {
    // Set all habits (replaces default + custom)
    setHabits: (state, action) => {
      // Always keep default habits at the top
      const defaultHabits = state.habits.filter(h => h.isDefault);
      const customHabits = action.payload.filter(h => !h.isDefault);
      state.habits = [...defaultHabits, ...customHabits];
    },
    
    // Add a new custom habit
    addHabit: (state, action) => {
      state.habits.push(action.payload);
    },
    
    // Update a habit
    updateHabit: (state, action) => {
      const index = state.habits.findIndex(h => h.id === action.payload.id);
      if (index !== -1) {
        state.habits[index] = action.payload;
      }
    },
    
    // Toggle habit active status
    toggleHabitActive: (state, action) => {
      const habit = state.habits.find(h => h.id === action.payload);
      if (habit) {
        habit.isActive = !habit.isActive;
        habit.updatedAt = new Date().toISOString();
      }
    },
    
    // Delete a custom habit (cannot delete default habits)
    deleteHabit: (state, action) => {
      const habit = state.habits.find(h => h.id === action.payload);
      if (habit && !habit.isDefault) {
        state.habits = state.habits.filter(h => h.id !== action.payload);
      }
    },
    
    // Set all completions
    setCompletions: (state, action) => {
      state.completions = action.payload;
    },
    
    // Toggle completion for a habit on a specific date
    toggleCompletion: (state, action) => {
      const { habitId, date } = action.payload;
      const existingIndex = state.completions.findIndex(
        c => c.habitId === habitId && c.date === date
      );
      
      if (existingIndex !== -1) {
        // Toggle existing
        state.completions[existingIndex].completed = !state.completions[existingIndex].completed;
      } else {
        // Add new completion
        state.completions.push({
          id: `${habitId}-${date}`,
          habitId,
          userId: 'default',
          date,
          completed: true,
          localUpdatedAt: new Date().toISOString(),
        });
      }
    },
    
    // Reset to default habits (clear custom habits)
    resetHabits: (state) => {
      state.habits = DEFAULT_HABITS;
      state.completions = [];
    },
  }
})

export const {
  setHabits,
  addHabit,
  updateHabit,
  toggleHabitActive,
  deleteHabit,
  setCompletions,
  toggleCompletion,
  resetHabits,
} = habitsSlice.actions;

export default habitsSlice.reducer;
