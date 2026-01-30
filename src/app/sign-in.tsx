import PlatformIcon from '@/components/PlatformIcon';
import { useTheme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(data: FormData) {

  }

  return (
    <KeyboardAwareScrollView
      bottomOffset={40}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flex: 1, paddingHorizontal: 16, paddingTop: insets.top, backgroundColor: colors.bg }}
    >
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
        <Text style={styles.title}>Welcome to HoldIt</Text>
        <Text style={styles.subtitle}>Sign in to sync your data across devices</Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              ref={emailRef}
              autoFocus
              style={styles.input}
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
            />
          )}
        />
        <View style={styles.errorTextView}>
          <Text style={{ color: '#FF3B30' }}>{errors.email?.message}</Text>
        </View>

        <View style={{ position: 'relative' }}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry={!isPasswordVisible}
                editable={!loading}
                autoComplete='current-password'
                spellCheck={false}
                placeholderTextColor={colors.border}
                onBlur={onBlur}
                onSubmitEditing={handleSubmit(handleSignIn)}
              />
            )} />

          <View style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
            {isPasswordVisible ? (
              <Pressable>
                <PlatformIcon name="eye" size={20} color={colors.text} />
              </Pressable>
            ) : (
              <Pressable>
                <PlatformIcon name="eyeOff" size={20} color={colors.text} />
              </Pressable>
            )}
          </View>
        </View>
        <View style={styles.errorTextView}>
          <Text style={{ color: '#FF3B30' }}>{errors.password?.message}</Text>
        </View>

        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={handleSubmit(handleSignIn)}
          disabled={loading || !isValid}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>


        {/* Social OAuth Buttons */}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

      </SafeAreaView>
    </KeyboardAwareScrollView>
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
    padding: 24,
    paddingTop: 64,
    paddingBottom: 64,
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
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
  },
  errorTextView: {
    flex: 1,
    height: 21,
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  guestButton: {
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButtonText: {
    color: '#333',
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
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  guestNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
