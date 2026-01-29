import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UpgradeAccount() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const { upgradeGuestAccount, isGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flex: 1, paddingHorizontal: 16, paddingTop: insets.top, backgroundColor: colors.background }}
      bottomOffset={40}
    >
      <SafeAreaView>
        <Text style={[styles.title, { color: colors.text }]}>Upgrade Your Account</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Keep all your progress and unlock full features
        </Text>

        <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoText, { color: colors.text }]}>
            ✓ All your guest data will be preserved{'\n'}
            ✓ Sync across devices{'\n'}
            ✓ Unlock all premium features
          </Text>
        </View>

        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleUpgrade}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { color: colors.background }]}>Upgrade Account</Text>
          )}
        </Pressable>

        <Text style={[styles.note, { color: colors.text }]}>
          By upgrading, you agree to receive a verification email
        </Text>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  contentLarge: {
    maxWidth: 480,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoBox: {
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
  },
  buttonText: {
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
