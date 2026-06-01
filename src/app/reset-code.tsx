import { useTheme } from '@/constants/theme';
import { supabase } from '@/utils/supabase';
import { AuthApiError } from '@supabase/supabase-js';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function ResetCode() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerifyCode() {
    if (!code || !email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });
      if (error) throw error;
      // User now has a valid session — navigate to set new password
      router.replace('/reset-password');
    } catch (e: unknown) {
      let message = 'Please try again.';
      if (e instanceof AuthApiError) {
        switch (e.code) {
          case 'otp_expired':
            message = 'Code has expired. Please request a new one.';
            break;
          default:
            message = e.message;
        }
      } else if (e instanceof Error) {
        message = e.message;
      }
      Alert.alert('Unable to verify code', message);
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
          <Text style={[styles.title, { color: colors.text }]}>Check your email</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Enter the verification code we sent you
          </Text>

          <TextInput
            autoFocus
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.elevated }]}
            placeholder="Verification code"
            placeholderTextColor={colors.textMuted}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            editable={!loading}
            onSubmitEditing={handleVerifyCode}
          />

          <Pressable
            style={[styles.button, { backgroundColor: colors.primary, opacity: loading || !code ? 0.5 : 1 }]}
            onPress={handleVerifyCode}
            disabled={loading || !code}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify Code</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.textButton, { marginTop: 16 }]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={[styles.textButtonLabel, { color: colors.textMuted }]}>Go back</Text>
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
