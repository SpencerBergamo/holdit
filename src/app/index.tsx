import Button from '@/components/common/Button';
import { useTheme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FEATURES = [
  {
    emoji: '📸',
    title: 'Save anything',
    description: 'Snap a photo, paste a link, or add items manually',
  },
  {
    emoji: '📁',
    title: 'Stay organized',
    description: 'Group your saves into collections for any occasion',
  },
  {
    emoji: '🎁',
    title: 'Share with friends',
    description: 'Let loved ones see exactly what you want',
  },
];

export default function WelcomeScreen() {
  const { colors, type, space } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleGetStarted = useCallback(() => {
    // TODO: Navigate to sign-up / onboarding
    router.push('/sign-up');
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      {/* Hero section */}
      <View style={styles.hero}>
        <Animated.Text
          entering={FadeInUp.delay(100).springify()}
          style={[styles.logo, { color: colors.primary }]}
        >
          HoldIt
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(200).springify()}
          style={[type.headline as TextStyle, styles.tagline, { color: colors.textMuted }]}
        >
          Your wishlist, all in one place
        </Animated.Text>
      </View>

      {/* Features */}
      <View style={[styles.features, { gap: space[4] }]}>
        {FEATURES.map((feature, index) => (
          <Animated.View
            key={feature.title}
            entering={FadeInDown.delay(300 + index * 100).springify()}
            style={[
              styles.featureCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={styles.featureEmoji}>{feature.emoji}</Text>
            <View style={styles.featureText}>
              <Text style={[type.bodyStrong as TextStyle, { color: colors.text }]}>
                {feature.title}
              </Text>
              <Text style={[type.body as TextStyle, { color: colors.textMuted }]}>
                {feature.description}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* CTA */}
      <Animated.View
        entering={FadeInDown.delay(650).springify()}
        style={styles.cta}
      >
        <Button onPress={handleGetStarted}>Get Started</Button>
      </Animated.View>

      <Pressable
        style={{ alignItems: 'center', marginTop: 16, paddingBottom: insets.bottom }}
        onPress={() => router.push('/sign-in')}
      >
        <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 16 }}>
          Already have an account? Sign in
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  logo: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
  },
  tagline: {
    marginTop: 8,
    textAlign: 'center',
  },
  features: {
    flex: 1,
    paddingHorizontal: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  cta: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
