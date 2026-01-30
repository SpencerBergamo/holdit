import PlatformIcon from '@/components/PlatformIcon';
import { useTheme } from '@/constants/theme';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isLoaded, signUp, setActive } = useSignUp();

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
  const confirmPasswordRef = useRef<TextInput>(null);

  // States
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  async function handleSignUp(data: FormData) {
    if (!isLoaded) return;
    setLoading(true);

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);

    } catch (err: any) {
      console.error('Sign-up error:', JSON.stringify(err, null, 2));
      const errorMessage = err?.errors?.[0]?.longMessage || err?.message || 'Please try again';
      Alert.alert('Unable to create account', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleVerifyEmail = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/');
      } else {
        throw new Error('Failed to verify email', { cause: JSON.stringify(completeSignUp, null, 2) });
      }
    } catch (e: any) {
      console.error('Verification error:', e);
      console.error('Verification error details:', {
        message: e?.message,
        errors: e?.errors,
        status: e?.status,
      });

      const errorMessage = e?.errors?.[0]?.longMessage || e?.message || 'Please try again';
      Alert.alert("Unable to verify email", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, code, signUp, setActive, router]);

  if (pendingVerification) {
    return (
      <KeyboardAwareScrollView
        bottomOffset={40}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top,
          paddingBottom: 32,
          backgroundColor: colors.bg,
        }}
      >
        <SafeAreaView style={{ paddingHorizontal: 16 }}>
          <Text style={[styles.title, { color: colors.text }]}>Verify your email</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            We sent a verification code to your email
          </Text>

          <TextInput
            autoFocus
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Verification code"
            placeholderTextColor={colors.textMuted}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            editable={!loading}
            onSubmitEditing={handleVerifyEmail}
          />

          <View style={{ height: 16 }} />

          <Pressable
            style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleVerifyEmail}
            disabled={loading || code.length === 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify Email</Text>
            )}
          </Pressable>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAwareScrollView
        bottomOffset={40}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top,
        }}
      >
        <SafeAreaView style={{ paddingHorizontal: 16 }}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
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
              <TextInput
                ref={emailRef}
                autoFocus
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
                onBlur={onBlur}
                onSubmitEditing={() => passwordRef.current?.focus()}
                returnKeyType="next"
                returnKeyLabel="next"
              />
            )}
          />
          {errors.email && <View style={styles.errorTextView}>
            <Text style={{ color: colors.error }}>{errors.email?.message}</Text>
          </View>}

          <View style={{ position: 'relative' }}>
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
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!isPasswordVisible}
                  editable={!loading}
                  autoComplete="password-new"
                  spellCheck={false}
                  onBlur={onBlur}
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  returnKeyType="next"
                  returnKeyLabel="next"
                />
              )}
            />

            <Pressable
              style={{
                position: 'absolute',
                right: 12,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <PlatformIcon
                name={isPasswordVisible ? 'eye' : 'eyeOff'}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          </View>
          {errors.password && (
            <View style={styles.errorTextView}>
              <Text style={{ color: colors.error }}>{errors.password?.message}</Text>
            </View>
          )}

          <View style={{ marginBottom: 16 }} />

          <Pressable
            style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit(handleSignUp)}
            disabled={loading || !isValid}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </Pressable>

          <Text style={{ textAlign: 'center', marginTop: 8 }}>
            Already have an account? <Link href="/sign-in" style={{ color: colors.primary }}>Sign in</Link>
          </Text>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>


        </SafeAreaView>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  errorTextView: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
});