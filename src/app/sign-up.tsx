import PlatformIcon from '@/components/PlatformIcon';
import { useTheme } from '@/constants/theme';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
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
      const errorMessage = e?.errors?.[0]?.longMessage || e?.message || 'Please try again';
      Alert.alert("Unable to verify email", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, code, signUp, setActive, router]);

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
              onSubmitEditing={handleVerifyEmail}
            />

            <Pressable
              style={[styles.button, { backgroundColor: colors.primary, opacity: loading || code.length === 0 ? 0.5 : 1 }]}
              onPress={handleVerifyEmail}
              disabled={loading || code.length === 0}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
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
              <TextInput
                ref={emailRef}
                autoFocus
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.elevated }]}
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
          {errors.email && (
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.email?.message}</Text>
          )}

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
                  style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.elevated }]}
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!isPasswordVisible}
                  editable={!loading}
                  autoComplete="password-new"
                  spellCheck={false}
                  onBlur={onBlur}
                  onSubmitEditing={handleSubmit(handleSignUp)}
                />
              )}
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
  textButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  textButtonLabel: {
    fontSize: 14,
  },
});
