import { useTheme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestCode() {
    // TODO: Implement with Supabase auth
    if (!email) return;
    setLoading(true);
    try {
      console.log('Request reset code for:', email);
      router.push('/reset-code');
    } catch (err: any) {
      Alert.alert('Unable to reset password', err?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAwareScrollView
        bottomOffset={40}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60 },
        ]}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Forgot password?</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Enter your email and we&apos;ll send you a code to reset your password
          </Text>

          <TextInput
            autoFocus
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.elevated }]}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
            onSubmitEditing={handleRequestCode}
            returnKeyType="done"
          />

          <Pressable
            style={[styles.button, { backgroundColor: colors.primary, opacity: loading || !email ? 0.5 : 1 }]}
            onPress={handleRequestCode}
            disabled={loading || !email}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Code</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.textButton}
            onPress={() => router.replace('/sign-in')}
            disabled={loading}
          >
            <Text style={[styles.textButtonLabel, { color: colors.textMuted }]}>
              Back to <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 54,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 24,
    minHeight: 54,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  textButtonLabel: {
    fontSize: 14,
  },
});
