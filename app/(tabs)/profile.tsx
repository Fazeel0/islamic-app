import { router } from 'expo-router';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logout, setGuest } from '../../redux/slice/authSlice';
import { toggleTheme } from '../../redux/slice/themeSlice';
import { resetHabits } from '../../redux/slice/habitsSlice';
import { logOut } from '../../services/authService';
import { useAppTheme } from '../../hooks/useAppTheme';
import { PURGE } from 'redux-persist';

export default function Profile() {
  const dispatch = useDispatch();
  const { user, isGuest } = useSelector((state: any) => state.auth);
  const { isDarkMode, classes } = useAppTheme();

  const handleLogout = () => {
    console.log('handleLogout called, isGuest:', isGuest);
    
    if (isGuest) {
      Alert.alert(
        'Sign In',
        'Sign in to your account to sync data across devices.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Login',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              try {
                await logOut();
                // Clear Redux persist storage and reset all state
                dispatch({ type: PURGE, key: 'root' });
                dispatch(logout());
                router.replace('/login');
              } catch (error) {
                console.error('Error logging out:', error);
              }
            },
          },
        ]
      );
    }
  };

  const handleContinueAsGuest = () => {
    if (isGuest) {
      Alert.alert('Already Guest', 'You are currently in guest mode.');
      return;
    }

    Alert.alert(
      'Continue as Guest',
      'This will sign you out and continue as a guest. Your local data will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // Clear persist and set guest mode
            dispatch({ type: PURGE, key: 'root' });
            dispatch(setGuest());
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const handleSwitchAccount = () => handleLogout();

  const handleToggleDarkMode = () => dispatch(toggleTheme());

  // Theme colors for dynamic styling
  const bgColor = classes.background;
  const surfaceColor = classes.surface;
  const textColor = classes.text;
  const textSecondary = classes.textSecondary;
  const primaryColor = classes.primary;

  return (
    <View className={`flex-1 ${bgColor}`}>
      {/* Header */}
      <View className={`${primaryColor} pt-12 pb-5 px-5`}>
        <Text className="text-3xl font-bold text-white">Profile</Text>
        <Text className="text-sm text-white/80 mt-1">Manage your account</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* User Info Card */}
        <View className={`${surfaceColor} rounded-2xl p-6 items-center mb-5 shadow-md`}>
          <View className={`${primaryColor} w-20 h-20 rounded-full items-center justify-center mb-3`}>
            <Ionicons name="person" size={32} color="white" />
          </View>
          <Text className={`text-xl font-bold ${textColor}`}>
            {isGuest ? 'Guest User' : (user?.displayName || 'User')}
          </Text>
          <Text className={`text-sm ${textSecondary} mt-1`}>
            {isGuest ? 'Not signed in' : user?.email || "guest@gmail.com"}
          </Text>
          {isGuest && (
            <View className="bg-yellow-100 px-3 py-1 rounded-lg mt-3">
              <Text className="text-yellow-700 text-xs font-semibold">Guest Mode</Text>
            </View>
          )}
        </View>

        {/* Account Section */}
        <View className="mb-5">
          <Text className={`text-sm font-semibold ${textSecondary} uppercase mb-2 ml-1`}>Account</Text>

          {!isGuest && (
            <TouchableOpacity 
              className={`${surfaceColor} flex-row items-center p-4 rounded-xl mb-2`} 
              onPress={handleSwitchAccount}
            >
              <Text className="text-xl mr-3">🔄</Text>
              <Text className={`flex-1 text-base ${textColor}`}>Switch Account</Text>
              <Text className={`text-xl ${textSecondary}`}>›</Text>
            </TouchableOpacity>
          )}

          {isGuest && (
            <TouchableOpacity 
              className={`${surfaceColor} flex-row items-center p-4 rounded-xl mb-2`} 
              onPress={handleLogout}
            >
              <Text className="text-xl mr-3">🔑</Text>
              <Text className={`flex-1 text-base ${textColor}`}>Sign In</Text>
              <Text className={`text-xl ${textSecondary}`}>›</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            className={`${surfaceColor} flex-row items-center p-4 rounded-xl`} 
            onPress={handleContinueAsGuest}
          >
            <Text className="text-xl mr-3">👤</Text>
            <Text className={`flex-1 text-base ${textColor}`}>
              {isGuest ? 'Stay as Guest' : 'Continue as Guest'}
            </Text>
            <Text className={`text-xl ${textSecondary}`}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View className="mb-5">
          <Text className={`text-sm font-semibold ${textSecondary} uppercase mb-2 ml-1`}>Settings</Text>

          <TouchableOpacity 
            className={`${surfaceColor} flex-row items-center p-4 rounded-xl mb-2`} 
            onPress={handleToggleDarkMode}
          >
            <Text className="text-xl mr-3">{isDarkMode ? '☀️' : '🌙'}</Text>
            <Text className={`flex-1 text-base ${textColor}`}>Dark Mode</Text>
            <View className={`w-12 h-7 rounded-full ${isDarkMode ? 'bg-indigo-500' : 'bg-gray-300'} justify-center px-1`}>
              <View className={`w-5 h-5 rounded-full bg-white ${isDarkMode ? 'ml-6' : 'ml-0'}`} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className={`${surfaceColor} flex-row items-center p-4 rounded-xl`}>
            <Text className="text-xl mr-3">🔔</Text>
            <Text className={`flex-1 text-base ${textColor}`}>Notifications</Text>
            <Text className={`text-xl ${textSecondary}`}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View className="mb-5">
          <Text className={`text-sm font-semibold ${textSecondary} uppercase mb-2 ml-1`}>About</Text>

          <TouchableOpacity className={`${surfaceColor} flex-row items-center p-4 rounded-xl mb-2`}>
            <Text className="text-xl mr-3">ℹ️</Text>
            <Text className={`flex-1 text-base ${textColor}`}>App Info</Text>
            <Text className={`text-xl ${textSecondary}`}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity className={`${surfaceColor} flex-row items-center p-4 rounded-xl`}>
            <Text className="text-xl mr-3">❓</Text>
            <Text className={`flex-1 text-base ${textColor}`}>Help & Support</Text>
            <Text className={`text-xl ${textSecondary}`}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        {user && !isGuest && (
          <TouchableOpacity className="bg-red-100 p-4 rounded-xl items-center mt-2" onPress={handleLogout}>
            <Text className="text-red-600 font-semibold">Sign Out</Text>
          </TouchableOpacity>
        )}

        {/* App Version */}
        <Text className={`text-center text-sm font-semibold mt-8 ${textSecondary}`}>v1.0.0</Text>
        <Text className={`text-center text-xs mt-1 ${textSecondary}`}>Created by Hamzah</Text>
        <Text className={`text-center text-xs mt-1 ${textSecondary}`}>© 2026 - Personal Habit Tracking System</Text>
      </ScrollView>
    </View>
  );
}
