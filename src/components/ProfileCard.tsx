import { useTheme } from '@/constants/theme';
import { useUser } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function ProfileCard() {
  const router = useRouter();
  const { colors, space, radius, type, shadow } = useTheme();
  const { user } = useUser();

  if (!user) return null;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/profile/edit-profile');
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.elevated,
          borderRadius: radius.lg,
          padding: space[4],
          gap: space[4],
          opacity: pressed ? 0.9 : 1,
          ...shadow.sm,
        }
      ]}
    >
      <View style={[styles.content, { gap: space[4] }]}>
        <Image
          source={{ uri: user.imageUrl }}
          style={[
            styles.avatar,
            {
              borderRadius: radius.full,
              borderWidth: 2,
              borderColor: colors.border,
            }
          ]}
        />
        <View style={styles.info}>
          <Text style={[type.headline, { color: colors.text }]} numberOfLines={1}>
            {user.fullName}
          </Text>
          {user.username && (
            <Text style={[type.body, { color: colors.textMuted }]} numberOfLines={1}>
              @{user.username}
            </Text>
          )}
          <Text style={[type.caption, { color: colors.primary, marginTop: space[1] }]}>
            Tap to edit
          </Text>
        </View>
      </View>

      <View style={[styles.chevron, { paddingLeft: space[2] }]}>
        <Text style={[type.headline, { color: colors.textMuted }]}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
  },
  info: {
    flex: 1,
  },
  chevron: {
    justifyContent: 'center',
  },
});
