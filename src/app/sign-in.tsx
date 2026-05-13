import PlatformIcon from '@/components/PlatformIcon';
import { useTheme } from '@/constants/theme';
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
}

export default function SignIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  // TODO: Replace with Supabase auth

  const { control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<FormData>({
    mode: "onChange",
  });

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Second Factor Verification
  const [showEmailCodeVerification, setShowEmailCodeVerification] = useState(false);
  const [emailCode, setEmailCode] = useState('');

  async function handleSignIn(data: FormData) {
    // TODO: Implement with Supabase auth
    setLoading(true);
    try {
      console.log('Sign in:', data.email);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Unable to sign in', e?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  }

  const handleVerifyEmailCode = useCallback(async () => {
    // TODO: Implement with Supabase auth if needed
    try {
      console.log('Verify email code:', emailCode);
    } catch (e: any) {
      Alert.alert('Unable to verify code', e?.message || 'Please try again');
    }
  }, [emailCode]);

  if (showEmailCodeVerification) {
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
            <Text style={[styles.title, { color: colors.text }]}>New device?</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Enter the verification code we sent to your email
            </Text>

            <TextInput
              autoFocus
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.elevated }]}
              placeholder="Verification code"
              placeholderTextColor={colors.textMuted}
              value={emailCode}
              onChangeText={setEmailCode}
              keyboardType="number-pad"
              editable={!loading}
              onSubmitEditing={handleVerifyEmailCode}
            />

            <Pressable
              style={[styles.button, { backgroundColor: colors.primary, opacity: loading || emailCode.length === 0 ? 0.5 : 1 }]}
              onPress={handleVerifyEmailCode}
              disabled={loading || emailCode.length === 0}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.textButton, { marginTop: 16 }]}
              onPress={() => setShowEmailCodeVerification(false)}
              disabled={loading}
            >
              <Text style={[styles.textButtonLabel, { color: colors.textMuted }]}>Go back</Text>
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
          <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Sign in to continue</Text>

          <Controller
            control={control}
            name="email"
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
                returnKeyType='next'
                returnKeyLabel='next'
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
                  autoComplete='current-password'
                  spellCheck={false}
                  onBlur={onBlur}
                  onSubmitEditing={handleSubmit(handleSignIn)}
                />
              )} />

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
