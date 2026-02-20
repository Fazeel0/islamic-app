import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
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
          // Store user in Redux
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
          // Store user in Redux
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
    // Continue without login - user data will be stored locally only
    dispatch(setGuest());
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="assignment" size={64} color="white" />
            <Text style={styles.title}>Personal Habit Tracker</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Create your account' : 'Welcome back!'}
            </Text>
            <Text style={styles.tagline}>
              Track your daily habits
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Toggle Sign In/Sign Up */}
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
            >
              <Text style={styles.toggleText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Continue as Guest */}
            <TouchableOpacity 
              style={styles.guestButton}
              onPress={handleGuestMode}
            >
              <Text style={styles.guestButtonText}>
                Continue as Guest
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.guestHint}>
              Guest data is stored locally. Sign up to sync across devices.
            </Text>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerVersion}>v1.0.0</Text>
              <Text style={styles.footerDev}>Created by Hamzah</Text>
              <Text style={styles.footerCopyright}>© 2026 - Personal Habit Tracking System</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  toggleText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    marginHorizontal: 16,
    fontSize: 14,
  },
  guestButton: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  guestHint: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingBottom: 20,
  },
  footerVersion: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  footerDev: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  footerCopyright: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
});
