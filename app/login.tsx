import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { signIn, signUp } from '../services/authService';
import { login, setGuest } from '../redux/slice/authSlice';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const result = await signUp(email, password);
        if (result.success && result.user) {
          dispatch(login({
            user: {
              uid: result.user.uid,
              email: result.user.email || email,
              displayName: result.user.displayName || '',
            },
            token: await result.user.getIdToken(),
          }));
          router.replace('/(tabs)');
        } else {
          setError(result.error || 'Failed to create account');
        }
      } else {
        const result = await signIn(email, password);
        if (result.success && result.user) {
          dispatch(login({
            user: {
              uid: result.user.uid,
              email: result.user.email || email,
              displayName: result.user.displayName || '',
            },
            token: await result.user.getIdToken(),
          }));
          router.replace('/(tabs)');
        } else {
          setError(result.error || 'Failed to sign in');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    dispatch(setGuest());
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-indigo-500"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center">
        <View className="px-6">
          {/* Header */}
          <View className="items-center mb-10">
            <MaterialIcons name="assignment" size={64} color="white" />
            <Text className="text-3xl font-bold text-white text-center mt-4 mb-2">Personal Habit Tracker</Text>
            <Text className="text-lg text-white/90 mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back!'}
            </Text>
            <Text className="text-sm text-white/70">
              Track your daily habits
            </Text>
          </View>

          {/* Form */}
          <View className="bg-white rounded-2xl p-6">
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-700 mb-2">Email</Text>
              <TextInput
                className="border-2 border-gray-200 rounded-xl p-4 text-base text-gray-800 bg-gray-50"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-700 mb-2">Password</Text>
              <TextInput
                className="border-2 border-gray-200 rounded-xl p-4 text-base text-gray-800 bg-gray-50"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Error Message */}
            {error ? (
              <View className="bg-red-100 p-3 rounded-lg mb-4">
                <Text className="text-red-600 text-sm text-center">{error}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity 
              className={`bg-indigo-500 py-4 rounded-xl items-center mt-2 ${loading ? 'opacity-70' : ''}`}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text className="text-white text-lg font-bold">
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Toggle Sign In/Sign Up */}
            <TouchableOpacity 
              className="mt-4 items-center"
              onPress={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
            >
              <Text className="text-indigo-500 text-base font-semibold">
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mt-6 mb-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-gray-400 mx-4 text-sm">OR</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Continue as Guest */}
            <TouchableOpacity 
              className="bg-gray-100 py-4 rounded-xl items-center"
              onPress={handleGuestMode}
            >
              <Text className="text-gray-700 text-base font-semibold">
                Continue as Guest
              </Text>
            </TouchableOpacity>
            
            <Text className="text-gray-400 text-xs text-center mt-3">
              Guest data is stored locally. Sign up to sync across devices.
            </Text>

            {/* Footer */}
            <View className="items-center mt-8 pb-5">
              <Text className="text-gray-400 text-sm font-semibold">v1.0.0</Text>
              <Text className="text-gray-400 text-xs mt-1">Created by Hamzah</Text>
              <Text className="text-gray-400 text-xs mt-1">© 2026 - Personal Habit Tracking System</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
