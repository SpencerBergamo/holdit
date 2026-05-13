import { MyThemeProvider } from '@/contexts/MyThemeContext';
import { supabase } from '@/utils/supabase';
import type { Session } from '@supabase/supabase-js';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';

function RootLayoutNav() {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsReady(true);
      SplashScreen.hideAsync();
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isSignedIn = !!session;

  return (
    <MyThemeProvider>
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
    </MyThemeProvider>
  );
}

export default function RootLayout() {

  return (
    <KeyboardProvider>
      <RootLayoutNav />
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
