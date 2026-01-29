import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

export default function UpgradeAccount() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { upgradeGuestAccount, isGuest } = useAuth();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  // Redirect if not a guest
  if (!isGuest) {
    router.replace('/');
    return null;
  }

  const handleUpgrade = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await upgradeGuestAccount(email, password);

      if (result.success) {
        Alert.alert(
          'Success!',
          'Your account has been upgraded! Please check your email to verify your account.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/'),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to upgrade account');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isLargeScreen && styles.scrollContentLarge,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[
          styles.content,
          isLargeScreen && styles.contentLarge,
        ]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Upgrade Your Account</Text>
          <Text style={styles.subtitle}>
            Keep all your progress and unlock full features
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ✓ All your guest data will be preserved{'\n'}
              ✓ Sync across devices{'\n'}
              ✓ Unlock all premium features
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleUpgrade}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Upgrade Account</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            By upgrading, you agree to receive a verification email
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Platform.OS === 'web' ? 32 : 24,
    paddingTop: Platform.OS === 'web' ? 64 : 24,
    paddingBottom: Platform.OS === 'web' ? 64 : 24,
  },
  scrollContentLarge: {
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  contentLarge: {
    maxWidth: 480,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 36 : 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    ...Platform.select({
      web: {
        userSelect: 'none',
      },
    }),
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
    ...Platform.select({
      web: {
        userSelect: 'none',
      },
    }),
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 15,
    color: '#2E7D32',
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 48,
    ...Platform.select({
      web: {
        outlineStyle: undefined,
      },
    }),
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 52,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'opacity 0.2s',
      },
    }),
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: Platform.OS === 'web' ? 13 : 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
