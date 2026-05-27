import { useMyTheme } from "@/contexts/MyThemeContext";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

export type SettingsProfile = {
   fullName: string;
   username: string;
   email: string;
   birthday: string;
   memberSince: string;
   imageUrl?: string;
};

type SettingsProfileCardProps = {
   profile: SettingsProfile;
};

function getInitials(fullName: string) {
   return fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
}

export default function SettingsProfileCard({ profile }: SettingsProfileCardProps) {
   const { colors, spacing } = useMyTheme();
   const initials = getInitials(profile.fullName);

   return (
      <View
         style={[
            styles.card,
            {
               backgroundColor: colors.inputBackground,
               borderColor: colors.inputBorder,
               padding: spacing.m,
               gap: spacing.m,
            },
         ]}
      >
         {profile.imageUrl ? (
            <Image
               source={{ uri: profile.imageUrl }}
               style={[
                  styles.avatar,
                  { borderColor: colors.inputBorder },
               ]}
            />
         ) : (
            <View
               style={[
                  styles.avatar,
                  styles.avatarPlaceholder,
                  {
                     backgroundColor: colors.primary,
                     borderColor: colors.inputBorder,
                  },
               ]}
            >
               <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
         )}

         <View style={styles.info}>
            <Text selectable style={[styles.name, { color: colors.text }]}>
               {profile.fullName}
            </Text>
            <Text style={[styles.username, { color: colors.textMuted }]}>
               @{profile.username}
            </Text>

            <View style={[styles.metaList, { gap: spacing.s }]}>
               <ProfileMetaRow label="Birthday" value={profile.birthday} />
               <ProfileMetaRow label="Email" value={profile.email} />
               <ProfileMetaRow label="Member since" value={profile.memberSince} />
            </View>
         </View>
      </View>
   );
}

function ProfileMetaRow({ label, value }: { label: string; value: string }) {
   const { colors } = useMyTheme();

   return (
      <View style={styles.metaRow}>
         <Text style={[styles.metaLabel, { color: colors.textMuted }]}>{label}</Text>
         <Text selectable style={[styles.metaValue, { color: colors.text }]}>
            {value}
         </Text>
      </View>
   );
}

const styles = StyleSheet.create({
   card: {
      borderRadius: 16,
      borderCurve: "continuous",
      borderWidth: 1,
      alignItems: "center",
   },
   avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderCurve: "continuous",
      borderWidth: 2,
   },
   avatarPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
   },
   avatarInitials: {
      fontSize: 28,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: -0.5,
   },
   info: {
      width: "100%",
      alignItems: "center",
      gap: 4,
   },
   name: {
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: -0.3,
      textAlign: "center",
   },
   username: {
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 8,
   },
   metaList: {
      width: "100%",
      marginTop: 4,
   },
   metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
   },
   metaLabel: {
      fontSize: 14,
      fontWeight: "500",
      flexShrink: 0,
   },
   metaValue: {
      fontSize: 14,
      fontWeight: "500",
      flex: 1,
      textAlign: "right",
   },
});
