import MyTextInput from "@/components/common/MyTextInput";
import { useMyTheme } from "@/contexts/MyThemeContext";
import { ScrollView, StyleSheet, Text } from "react-native";

const MOCK_PROFILE = {
   fullName: "Spencer Bergamo",
   username: "sbergamo",
   email: "spencer@example.com",
   birthday: "March 15",
};

export default function EditProfileScreen() {
   const { colors, spacing } = useMyTheme();

   return (
      <ScrollView
         contentInsetAdjustmentBehavior="automatic"
         keyboardShouldPersistTaps="handled"
         showsVerticalScrollIndicator={false}
         style={{ flex: 1, backgroundColor: colors.background }}
         contentContainerStyle={{
            paddingHorizontal: spacing.m,
            paddingTop: spacing.m,
            paddingBottom: spacing.xl,
            gap: spacing.m,
         }}
      >
         <Text style={[styles.description, { color: colors.textMuted }]}>
            Update how you appear to friends on HoldIt.
         </Text>

         <MyTextInput
            placeholder="Full name"
            defaultValue={MOCK_PROFILE.fullName}
            autoCapitalize="words"
            editable={false}
         />
         <MyTextInput
            placeholder="Username"
            defaultValue={MOCK_PROFILE.username}
            autoCapitalize="none"
            editable={false}
         />
         <MyTextInput
            placeholder="Email"
            defaultValue={MOCK_PROFILE.email}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
         />
         <MyTextInput
            placeholder="Birthday"
            defaultValue={MOCK_PROFILE.birthday}
            editable={false}
         />
      </ScrollView>
   );
}

const styles = StyleSheet.create({
   description: {
      fontSize: 15,
      lineHeight: 21,
   },
});
