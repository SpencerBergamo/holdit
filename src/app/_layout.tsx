import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';

function RootLayoutNav() {
  // TODO: Replace with Supabase auth state
  const isSignedIn = false;

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack screenOptions={{
      headerShown: false,
      headerBackButtonDisplayMode: 'minimal',
      headerShadowVisible: false,
    }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="sign-up"
        />
        <Stack.Screen
          name="sign-in"
        />
        <Stack.Screen
          name="forgot-password"
        />
        <Stack.Screen
          name="reset-code"
        />
        <Stack.Screen
          name="reset-password"
        />
      </Stack.Protected>

      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

    </Stack>
  );
}

export default function RootLayout() {

  return (
    <KeyboardProvider>
      <RootLayoutNav />
    </KeyboardProvider>
  );
}
