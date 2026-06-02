import MyTextInput from "@/components/common/MyTextInput";
import PlatformIcon, { AvailableIcons } from "@/components/PlatformIcon";
import { useMyTheme } from "@/contexts/MyThemeContext";
import { supabase } from "@/utils/supabase";
import DateTimePicker, { DateTimePickerChangeEvent } from '@expo/ui/datetimepicker';
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useNavigation } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
   ActivityIndicator,
   Alert,
   Pressable,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type EditProfileForm = {
   displayName: string;
};

function getInitials(name: string) {
   return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
}

export default function EditProfileScreen() {
   const { colors, spacing } = useMyTheme();
   const navigation = useNavigation();

   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [userId, setUserId] = useState<string | null>(null);

   // Avatar
   const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
   const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);

   // Birthday
   const [birthday, setBirthday] = useState(new Date(2000, 0, 1));
   const [birthdayTouched, setBirthdayTouched] = useState(false);
   const [showPicker, setShowPicker] = useState(false);
   const originalBirthdayRef = useRef<string | null>(null);

   const {
      control,
      handleSubmit,
      reset,
      watch,
      formState: { isDirty },
   } = useForm<EditProfileForm>({
      mode: "onChange",
      defaultValues: { displayName: "" },
   });

   const displayName = watch("displayName");

   const birthdayChanged =
      birthdayTouched &&
      birthday.toISOString().slice(0, 10) !== (originalBirthdayRef.current ?? "");
   const hasChanges = isDirty || newAvatarUri !== null || birthdayChanged;
   const canSave = hasChanges && displayName.trim().length > 0 && !saving;

   useEffect(() => {
      async function fetchProfile() {
         const {
            data: { user },
         } = await supabase.auth.getUser();
         if (!user) return;
         setUserId(user.id);

         const { data } = await supabase
            .from("profiles")
            .select("display_name, avatar_url, birthday")
            .eq("id", user.id)
            .single();

         reset({ displayName: data?.display_name ?? "" });
         setAvatarUrl(data?.avatar_url ?? null);

         if (data?.birthday) {
            const parsed = new Date(data.birthday + "T00:00:00");
            setBirthday(parsed);
            originalBirthdayRef.current = parsed.toISOString().slice(0, 10);
         }

         setLoading(false);
      }
      fetchProfile();
   }, [reset]);

   const handlePickAvatar = useCallback(async () => {
      const permission =
         await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
         Alert.alert(
            "Photos access needed",
            "HoldIt needs access to your photo library to update your avatar.",
         );
         return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ["images"],
         quality: 0.85,
         allowsEditing: true,
         aspect: [1, 1],
      });

      if (!result.canceled && result.assets[0]?.uri) {
         setNewAvatarUri(result.assets[0].uri);
         void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
         );
      }
   }, []);

   const handleDateChange = useCallback(
      (_event: DateTimePickerChangeEvent, selectedDate?: Date) => {
         if (process.env.EXPO_OS === "android") {
            setShowPicker(false);
         }
         if (selectedDate) {
            setBirthday(selectedDate);
            setBirthdayTouched(true);
         }
      },
      [],
   );

   const onSave = useCallback(
      async (data: EditProfileForm) => {
         if (!userId) return;
         setSaving(true);

         try {
            let finalAvatarUrl = avatarUrl;

            if (newAvatarUri) {
               const response = await fetch(newAvatarUri);
               const arraybuffer = await response.arrayBuffer();
               const filePath = `${userId}/avatar.jpg`;

               const { error: uploadError } = await supabase.storage
                  .from("avatars")
                  .upload(filePath, arraybuffer, {
                     contentType: "image/jpeg",
                     upsert: true,
                  });

               if (uploadError) throw uploadError;

               const {
                  data: { publicUrl },
               } = supabase.storage.from("avatars").getPublicUrl(filePath);

               finalAvatarUrl = `${publicUrl}?t=${Date.now()}`;
            }

            const updates: Record<string, unknown> = {
               display_name: data.displayName.trim(),
               avatar_url: finalAvatarUrl,
            };

            if (birthdayTouched) {
               updates.birthday = birthday.toISOString().slice(0, 10);
            }

            const { error } = await supabase
               .from("profiles")
               .update(updates)
               .eq("id", userId);

            if (error) throw error;

            void Haptics.notificationAsync(
               Haptics.NotificationFeedbackType.Success,
            );
            router.back();
         } catch (e) {
            const message =
               e instanceof Error ? e.message : "Something went wrong.";
            Alert.alert("Unable to save", message);
         } finally {
            setSaving(false);
         }
      },
      [userId, avatarUrl, newAvatarUri, birthday, birthdayTouched],
   );

   useLayoutEffect(() => {
      navigation.setOptions({
         headerRight: () =>
            saving ? (
               <ActivityIndicator size="small" />
            ) : (
               <TouchableOpacity
                  onPress={() => {
                     if (!canSave) return;
                     void handleSubmit(onSave)();
                  }}
                  disabled={!canSave}
                  style={{ opacity: canSave ? 1 : 0.4, marginHorizontal: 12 }}
                  accessibilityRole="button"
                  accessibilityLabel="Save"
                  accessibilityState={{ disabled: !canSave }}
               >
                  <Text
                     style={{
                        fontSize: 17,
                        fontWeight: "600",
                        color: canSave ? colors.primary : colors.textMuted,
                     }}
                  >
                     Save
                  </Text>
               </TouchableOpacity>
            ),
      });
   }, [navigation, canSave, saving, colors, handleSubmit, onSave]);

   if (loading) {
      return (
         <View
            style={[styles.loading, { backgroundColor: colors.background }]}
         >
            <ActivityIndicator size="large" />
         </View>
      );
   }

   const displayedAvatar = newAvatarUri ?? avatarUrl;
   const initials = getInitials(displayName || "?");

   return (
      <KeyboardAwareScrollView
         bottomOffset={40}
         keyboardShouldPersistTaps="handled"
         contentInsetAdjustmentBehavior="automatic"
         showsVerticalScrollIndicator={false}
         style={{ flex: 1, backgroundColor: colors.background }}
         contentContainerStyle={{
            paddingHorizontal: spacing.m,
            paddingTop: spacing.m,
            paddingBottom: spacing.xl,
            gap: spacing.l,
         }}
      >
         {/* Avatar */}
         <View style={styles.avatarSection}>
            <Pressable onPress={handlePickAvatar} style={styles.avatarButton}>
               {displayedAvatar ? (
                  <Image
                     source={{ uri: displayedAvatar }}
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
               <View
                  style={[
                     styles.avatarBadge,
                     { backgroundColor: colors.primary, borderColor: colors.background },
                  ]}
               >
                  <PlatformIcon
                     name={AvailableIcons.camera}
                     size={12}
                     color="#FFFFFF"
                  />
               </View>
            </Pressable>
            <Text style={[styles.avatarHint, { color: colors.textMuted }]}>
               Tap to change photo
            </Text>
         </View>

         {/* Display Name */}
         <View style={{ gap: spacing.s }}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
               Display name
            </Text>
            <Controller
               control={control}
               name="displayName"
               rules={{
                  required: "Display name is required",
                  validate: (v) =>
                     v.trim().length > 0 || "Display name is required",
               }}
               render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
               }) => (
                  <MyTextInput
                     placeholder="Your name"
                     value={value}
                     onChangeText={onChange}
                     onBlur={onBlur}
                     autoCapitalize="words"
                     returnKeyType="done"
                     error={error?.message}
                  />
               )}
            />
         </View>

         {/* Birthday */}
         <View style={{ gap: spacing.s }}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
               Birthday
            </Text>
            <Pressable
               onPress={() => setShowPicker((prev) => !prev)}
               style={[
                  styles.dateButton,
                  {
                     backgroundColor: colors.inputBackground,
                     borderColor: colors.inputBorder,
                  },
               ]}
            >
               <PlatformIcon name={AvailableIcons.gift} size={18} color={colors.textMuted} />
               <Text style={[styles.dateText, { color: colors.text }]}>
                  {birthday.toLocaleDateString("en-US", {
                     month: "long",
                     day: "numeric",
                     year: "numeric",
                  })}
               </Text>
            </Pressable>

            {showPicker && (
               <DateTimePicker
                  value={birthday}
                  accentColor={colors.primary}
                  mode="date"
                  display="spinner"
                  onValueChange={handleDateChange}
                  maximumDate={new Date()}
                  style={{ height: 200 }}
               />
            )}
         </View>
      </KeyboardAwareScrollView>
   );
}

const styles = StyleSheet.create({
   loading: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
   },
   avatarSection: {
      alignItems: "center",
      gap: 8,
   },
   avatarButton: {
      position: "relative",
   },
   avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderCurve: "continuous",
      borderWidth: 2,
   },
   avatarPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
   },
   avatarInitials: {
      fontSize: 32,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: -0.5,
   },
   avatarBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      borderCurve: "continuous",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
   },
   avatarHint: {
      fontSize: 13,
      fontWeight: "500",
   },
   fieldLabel: {
      fontSize: 15,
      fontWeight: "600",
   },
   dateButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderRadius: 16,
      borderCurve: "continuous",
      minHeight: 54,
      paddingHorizontal: 20,
   },
   dateText: {
      fontSize: 16,
   },
});
