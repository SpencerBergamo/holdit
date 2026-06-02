import PlatformIcon, { AvailableIcons } from "@/components/PlatformIcon";
import ProfileCard from "@/components/profile/ProfileCard";
import SettingsSection, {
   SettingsSectionRows,
} from "@/components/settings/SettingsSection";
import { useMyTheme } from "@/contexts/MyThemeContext";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, View } from "react-native";

export default function ProfileSettingsScreen() {
   const { colors, spacing } = useMyTheme();
   const [pushNotifications, setPushNotifications] = useState(true);
   const [emailDigest, setEmailDigest] = useState(false);
   const [friendActivity, setFriendActivity] = useState(true);
   const [giftReminders, setGiftReminders] = useState(true);

   const handleSignOut = useCallback(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
         Alert.alert("Unable to sign out", error.message);
      }
   }, []);

   const iconSize = 20;

   const accountRows = useMemo(
      () => [
         {
            key: "edit-profile",
            label: "Edit profile",
            icon: <PlatformIcon name={AvailableIcons.compose} size={iconSize} />,
            onPress: () => router.push("/(home)/(profile)/edit-profile"),
         },
         {
            key: "change-password",
            label: "Change password",
            icon: <PlatformIcon name={AvailableIcons.lock} size={iconSize} />,
            onPress: () => { },
         },
      ],
      [iconSize],
   );

   const preferencesRows = useMemo(
      () => [
         {
            key: "appearance",
            label: "Appearance",
            icon: <PlatformIcon name={AvailableIcons.appearance} size={iconSize} />,
            value: "Light",
            onPress: () => { },
         },
         {
            key: "language",
            label: "Language",
            icon: <PlatformIcon name={AvailableIcons.menu} size={iconSize} />,
            value: "English",
            onPress: () => { },
         },
      ],
      [iconSize],
   );

   const notificationRows = useMemo(
      () => [
         {
            key: "push",
            label: "Push notifications",
            icon: <PlatformIcon name={AvailableIcons.bell} size={iconSize} />,
            showChevron: false,
            trailing: (
               <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
               />
            ),
         },
         {
            key: "email-digest",
            label: "Email digest",
            icon: <PlatformIcon name={AvailableIcons.mail} size={iconSize} />,
            showChevron: false,
            trailing: (
               <Switch value={emailDigest} onValueChange={setEmailDigest} />
            ),
         },
         {
            key: "friend-activity",
            label: "Friend activity",
            icon: <PlatformIcon name={AvailableIcons.friends} size={iconSize} />,
            showChevron: false,
            trailing: (
               <Switch
                  value={friendActivity}
                  onValueChange={setFriendActivity}
               />
            ),
         },
         {
            key: "gift-reminders",
            label: "Gift reminders",
            icon: <PlatformIcon name={AvailableIcons.share} size={iconSize} />,
            showChevron: false,
            trailing: (
               <Switch
                  value={giftReminders}
                  onValueChange={setGiftReminders}
               />
            ),
         },
      ],
      [
         emailDigest,
         friendActivity,
         giftReminders,
         iconSize,
         pushNotifications,
      ],
   );

   const privacyRows = useMemo(
      () => [
         {
            key: "visibility",
            label: "Profile visibility",
            icon: <PlatformIcon name={AvailableIcons.eye} size={iconSize} />,
            value: "Friends only",
            onPress: () => { },
         },
         {
            key: "blocked",
            label: "Blocked users",
            icon: <PlatformIcon name={AvailableIcons.shield} size={iconSize} />,
            onPress: () => { },
         },
      ],
      [iconSize],
   );

   const supportRows = useMemo(
      () => [
         {
            key: "help",
            label: "Help center",
            icon: <PlatformIcon name={AvailableIcons.help} size={iconSize} />,
            onPress: () => { },
         },
         {
            key: "feedback",
            label: "Send feedback",
            icon: <PlatformIcon name={AvailableIcons.mail} size={iconSize} />,
            onPress: () => { },
         },
         {
            key: "about",
            label: "About HoldIt",
            icon: <PlatformIcon name={AvailableIcons.settings} size={iconSize} />,
            value: "1.0.0",
            showChevron: false,
         },
      ],
      [iconSize],
   );

   return (
      <ScrollView
         contentInsetAdjustmentBehavior="automatic"
         showsVerticalScrollIndicator={false}
         style={{ flex: 1, backgroundColor: colors.background }}
         contentContainerStyle={[
            styles.content,
            {
               paddingHorizontal: spacing.m,
               paddingTop: spacing.m,
               paddingBottom: spacing.xl,
               gap: spacing.l,
            },
         ]}
      >
         <ProfileCard />

         <SettingsSection title="Account">
            <SettingsSectionRows rows={accountRows} />
         </SettingsSection>

         <SettingsSection title="Preferences">
            <SettingsSectionRows rows={preferencesRows} />
         </SettingsSection>

         <SettingsSection title="Notifications">
            <SettingsSectionRows rows={notificationRows} />
         </SettingsSection>

         <SettingsSection title="Privacy">
            <SettingsSectionRows rows={privacyRows} />
         </SettingsSection>

         <SettingsSection title="Support">
            <SettingsSectionRows rows={supportRows} />
         </SettingsSection>

         <SettingsSection>
            <SettingsSectionRows
               rows={[
                  {
                     key: "sign-out",
                     label: "Sign out",
                     icon: <PlatformIcon name={AvailableIcons.logout} size={iconSize} />,
                     destructive: true,
                     showChevron: false,
                     onPress: handleSignOut,
                  },
               ]}
            />
         </SettingsSection>
      </ScrollView>
   );
}

const styles = StyleSheet.create({
   content: {
      flexGrow: 1,
   },
});
