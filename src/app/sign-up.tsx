import MyTextInput from '@/components/common/MyTextInput';
import { useTheme } from '@/constants/theme';
import { supabase } from '@/utils/supabase';
import { AuthApiError } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<FormData>({
    mode: 'onChange',
  });

  // Refs
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const _confirmPasswordRef = useRef<TextInput>(null);

  // States
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  async function handleSignUp(data: FormData) {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // Supabase returns a fake user with empty identities if the email
      // is already registered (to avoid leaking account existence).
      if (authData.user && authData.user.identities?.length === 0) {
        Alert.alert(
          'Account may already exist',
          'If you already have an account, try signing in instead.'
        );
        return;
      }

      if (authData.session) {
        // Auto-confirmed — session picked up by onAuthStateChange
      } else {
        // Email confirmation required
        setPendingVerification(true);
      }
    } catch (e: unknown) {
      if (__DEV__) {
        console.error('[SignUp] Auth error:', {
          message: e instanceof Error ? e.message : String(e),
          code: e instanceof AuthApiError ? e.code : undefined,
          status: e instanceof AuthApiError ? e.status : undefined,
        });
      }

      let title = 'Unable to create account';
      let message = 'Something went wrong. Please try again.';

      if (e instanceof AuthApiError) {
        switch (e.code) {
          case 'user_already_exists':
            message = 'An account with this email already exists. Try signing in instead.';
            break;
          case 'weak_password':
            title = 'Weak password';
            message = e.message;
            break;
          case 'over_request_limit':
          case 'over_email_send_rate_limit':
            title = 'Too many attempts';
            message = 'Please wait a moment before trying again.';
            break;
          case 'validation_failed':
            message = 'Please check your email and password and try again.';
            break;
          default:
            message = e.message;
        }
      } else if (e instanceof Error) {
        message = e.message;
      }

      Alert.alert(title, message);
    } finally {
      setLoading(false);
    }
  }

  if (pendingVerification) {
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
              We sent a confirmation link to your email.{"\n"}Tap the link to activate your account, then come back and sign in.
            </Text>

            <Pressable
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => router.replace('/sign-in')}
            >
              <Text style={styles.buttonText}>Go to Sign In</Text>
            </Pressable>
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
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
          <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Start saving your wishlists</Text>

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <MyTextInput
                ref={emailRef}
                autoFocus
                containerStyle={{ marginBottom: 12 }}
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
                onBlur={onBlur}
                onSubmitEditing={() => passwordRef.current?.focus()}
                returnKeyType="next"
                returnKeyLabel="next"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <MyTextInput
                ref={passwordRef}
                containerStyle={{ marginBottom: 12 }}
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                editable={!loading}
                autoComplete="password-new"
                spellCheck={false}
                onBlur={onBlur}
                onSubmitEditing={handleSubmit(handleSignUp)}
                error={errors.password?.message}
              />
            )}
          />
          {errors.password && (
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.password?.message}</Text>
          )}

          <Pressable
            style={[styles.button, { backgroundColor: colors.primary, opacity: loading || !isValid ? 0.5 : 1 }]}
            onPress={handleSubmit(handleSignUp)}
            disabled={loading || !isValid}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.textButton}
            onPress={() => router.replace('/sign-in')}
            disabled={loading}
          >
            <Text style={[styles.textButtonLabel, { color: colors.textMuted }]}>
              Already have an account? <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign in</Text>
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
  errorText: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: -4,
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
