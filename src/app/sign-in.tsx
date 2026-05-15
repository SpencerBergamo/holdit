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
}

export default function SignIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<FormData>({
    mode: "onChange",
  });

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(data: FormData) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      // Session is picked up by onAuthStateChange in _layout
    } catch (e: unknown) {
      if (__DEV__) {
        console.error('[SignIn] Auth error:', {
          message: e instanceof Error ? e.message : String(e),
          code: e instanceof AuthApiError ? e.code : undefined,
          status: e instanceof AuthApiError ? e.status : undefined,
        });
      }

      let title = 'Unable to sign in';
      let message = 'Something went wrong. Please try again.';

      if (e instanceof AuthApiError) {
        switch (e.code) {
          case 'invalid_credentials':
            message = 'Invalid email or password.';
            break;
          case 'email_not_confirmed':
            title = 'Email not verified';
            message = 'Please check your email and confirm your account before signing in.';
            break;
          case 'user_banned':
            title = 'Account suspended';
            message = 'Your account has been suspended. Please contact support.';
            break;
          case 'over_request_limit':
          case 'over_email_send_rate_limit':
            title = 'Too many attempts';
            message = 'Please wait a moment before trying again.';
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
          <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Sign in to continue</Text>

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
                returnKeyType='next'
                returnKeyLabel='next'
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
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
                autoComplete='current-password'
                spellCheck={false}
                onBlur={onBlur}
                onSubmitEditing={handleSubmit(handleSignIn)}
                error={errors.password?.message}
              />
            )}
          />
          {errors.password && (
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.password?.message}</Text>
          )}

          <Pressable
            style={styles.forgotPassword}
            onPress={() => router.push('/forgot-password')}
            disabled={loading}
          >
            <Text style={[styles.textButtonLabel, { color: colors.primary }]}>Forgot password?</Text>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: colors.primary, opacity: loading || !isValid ? 0.5 : 1 }]}
            onPress={handleSubmit(handleSignIn)}
            disabled={loading || !isValid}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.textButton}
            onPress={() => router.replace('/sign-up')}
            disabled={loading}
          >
            <Text style={[styles.textButtonLabel, { color: colors.textMuted }]}>
              Don't have an account? <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign up</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    marginTop: 4,
    marginBottom: -8,
    paddingHorizontal: 8,
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
