import PlatformIcon from '@/components/PlatformIcon';
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

export default function ResetPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    // TODO: Implement with Supabase auth
    if (password.length < 8) return;
    setLoading(true);
    try {
      console.log('Reset password');
      router.replace('/');
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
          <Text style={[styles.title, { color: colors.text }]}>New password</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Choose a new password for your account
          </Text>

          <View style={{ position: 'relative' }}>
            <TextInput
              autoFocus
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.elevated }]}
              placeholder="New password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              editable={!loading}
              autoComplete="password-new"
              spellCheck={false}
              onSubmitEditing={handleResetPassword}
            />

            <Pressable
              style={styles.eyeButton}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <PlatformIcon
                name={isPasswordVisible ? 'eye' : 'eyeOff'}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          </View>
          {password.length > 0 && password.length < 8 && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              Password must be at least 8 characters
            </Text>
          )}

          <Pressable
            style={[styles.button, { backgroundColor: colors.primary, opacity: loading || password.length < 8 ? 0.5 : 1 }]}
            onPress={handleResetPassword}
            disabled={loading || password.length < 8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
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
  errorText: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: -4,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
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
});
