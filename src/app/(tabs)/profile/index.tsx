import { ProfileCard } from '@/components/ProfileCard';
import { useTheme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingItem {
  id: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, space, radius } = useTheme();

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement with Supabase auth
            try {
              router.replace('/');
            } catch (err) {
              console.error('Sign out error:', err);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const settings: SettingItem[] = [
    {
      id: 'notifications',
      label: 'Notifications',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Coming Soon', 'Notification settings will be available soon');
      },
    },
    {
      id: 'privacy',
      label: 'Privacy & Security',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Coming Soon', 'Privacy settings will be available soon');
      },
    },
    {
      id: 'help',
      label: 'Help & Support',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Coming Soon', 'Help & support will be available soon');
      },
    },
    {
      id: 'about',
      label: 'About',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('HoldIt', 'Version 1.0.0');
      },
    },
    {
      id: 'signout',
      label: 'Sign Out',
      onPress: handleSignOut,
      destructive: true,
    },
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
    >
      <View style={[styles.section, { paddingHorizontal: space[4], gap: space[4] }]}>
        <ProfileCard />
      </View>

      <View style={[styles.section, { gap: space[2] }]}>
        <Text style={{ color: colors.textMuted, paddingHorizontal: space[4] }}>
          SETTINGS
        </Text>
        <View
          style={[
            styles.settingsList,
            {
              backgroundColor: colors.elevated,
              borderRadius: radius.lg,
              marginHorizontal: space[4],
              overflow: 'hidden',
            }
          ]}
        >
          {settings.map((item, index) => (
            <View key={item.id}>
              <Pressable
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.settingItem,
                  {
                    backgroundColor: pressed ? colors.surface : colors.elevated,
                    paddingHorizontal: space[4],
                    paddingVertical: space[4],
                  }
                ]}
              >
                <Text style={{ color: item.destructive ? colors.error : colors.text }}>
                  {item.label}
                </Text>
                <SymbolView
                  name="chevron.right"
                  size={14}
                  tintColor={colors.text}
                />
              </Pressable>
              {index < settings.length - 1 && (
                <View
                  style={[
                    styles.separator,
                    {
                      backgroundColor: colors.border,
                      marginLeft: space[4],
                    }
                  ]}
                />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 16,
  },
  settingsList: {
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});
