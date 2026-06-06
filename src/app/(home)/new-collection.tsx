import MyTextInput from "@/components/common/MyTextInput";
import PlatformIcon, { AvailableIcons } from "@/components/PlatformIcon";
import { useMyTheme } from "@/contexts/MyThemeContext";
import { createCollection } from "@/lib/collections";
import * as Haptics from "expo-haptics";
import { router, Stack, useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
   ActivityIndicator,
   Alert,
   StyleSheet,
   Switch,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type CollectionFormData = {
   collectionName: string;
   collectionDescription: string;
   /** Maps to `collections.visible_to_friends` — public means friend-visible. */
   collectionVisibleToFriends: boolean;
};

function isCollectionFormComplete(name: string): boolean {
   return name.trim().length > 0;
}

export default function NewCollectionScreen() {
   const { colors, spacing } = useMyTheme();
   const navigation = useNavigation();
   const [saving, setSaving] = useState(false);

   const {
      control,
      handleSubmit,
      watch,
      setError,
      trigger,
      formState: { errors },
   } = useForm<CollectionFormData>({
      mode: "onChange",
      defaultValues: {
         collectionName: "",
         collectionDescription: "",
         collectionVisibleToFriends: false,
      },
   });

   const collectionName = watch("collectionName");

   const canSave = useMemo(
      () => isCollectionFormComplete(collectionName),
      [collectionName],
   );

   const onSave = useCallback(
      async (data: CollectionFormData) => {
         if (!isCollectionFormComplete(data.collectionName)) {
            setError("collectionName", {
               type: "manual",
               message: "Collection name is required",
            });
            await trigger("collectionName");
            return;
         }

         setSaving(true);
         try {
            await createCollection({
               name: data.collectionName,
               description: data.collectionDescription.trim() || null,
               visible_to_friends: data.collectionVisibleToFriends,
            });

            void Haptics.notificationAsync(
               Haptics.NotificationFeedbackType.Success,
            );
            router.back();
         } catch (e) {
            const message =
               e instanceof Error ? e.message : "Unable to create collection.";
            Alert.alert("Unable to save", message);
         } finally {
            setSaving(false);
         }
      },
      [setError, trigger],
   );

   useLayoutEffect(() => {
      navigation.setOptions({
         headerLeft: () => (
            <TouchableOpacity
               onPress={() => router.back()}
               accessibilityRole="button"
               accessibilityLabel="Close"
            >
               <PlatformIcon name={AvailableIcons.close} size={24} />
            </TouchableOpacity>
         ),
         headerRight: () =>
            saving ? (
               <ActivityIndicator size="small" />
            ) : (
               <TouchableOpacity
                  onPress={() => {
                     if (!canSave) {
                        return;
                     }
                     void handleSubmit(onSave)();
                  }}
                  disabled={!canSave}
                  style={{ opacity: canSave ? 1 : 0.4 }}
                  accessibilityRole="button"
                  accessibilityLabel="Save"
                  accessibilityState={{ disabled: !canSave }}
               >
                  <Text
                     style={{
                        fontSize: 17,
                        fontWeight: "600",
                        color: canSave ? colors.primary : colors.textMuted,
                        marginHorizontal: 12,
                     }}
                  >
                     Save
                  </Text>
               </TouchableOpacity>
            ),
      });
   }, [
      navigation,
      canSave,
      saving,
      colors.primary,
      colors.textMuted,
      handleSubmit,
      onSave,
   ]);

   return (
      <>
         <Stack.Screen options={{ headerTitle: "New Collection" }} />

         <KeyboardAwareScrollView
            bottomOffset={40}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{
               paddingHorizontal: spacing.m,
               paddingBottom: spacing.xl,
               gap: spacing.m,
            }}
         >
            <Text style={[styles.lead, { color: colors.textMuted }]}>
               Name your collection and choose who can see it.
            </Text>

            <Controller
               control={control}
               name="collectionName"
               rules={{
                  required: "Collection name is required",
                  validate: (value) =>
                     value.trim().length > 0 || "Collection name is required",
               }}
               render={({ field: { onChange, onBlur, value } }) => (
                  <MyTextInput
                     autoFocus
                     placeholder="Collection name"
                     value={value}
                     onChangeText={onChange}
                     onBlur={onBlur}
                     autoCapitalize="words"
                     returnKeyType="done"
                     autoCorrect
                     error={errors.collectionName?.message}
                  />
               )}
            />

            <Controller
               control={control}
               name="collectionDescription"
               render={({ field: { onChange, onBlur, value } }) => (
                  <MyTextInput
                     placeholder="Description (optional)"
                     value={value}
                     onChangeText={onChange}
                     onBlur={onBlur}
                     multiline
                     style={styles.multilineInput}
                     error={errors.collectionDescription?.message}
                  />
               )}
            />

            <Controller
               control={control}
               name="collectionVisibleToFriends"
               render={({ field: { value, onChange } }) => (
                  <View
                     style={[
                        styles.visibilityRow,
                        {
                           backgroundColor: colors.inputBackground,
                           padding: spacing.m,
                        },
                     ]}
                  >
                     <View style={styles.visibilityCopy}>
                        <Text
                           style={[styles.fieldLabel, { color: colors.text }]}
                        >
                           Public collection
                        </Text>
                        <Text
                           style={[
                              styles.visibilityHint,
                              { color: colors.textMuted },
                           ]}
                        >
                           {value
                              ? "Mutual friends can view this on your profile."
                              : "Private — only you can see this collection."}
                        </Text>
                     </View>
                     <Switch
                        value={value}
                        onValueChange={onChange}
                        accessibilityRole="switch"
                        accessibilityLabel="Public collection"
                        accessibilityHint={
                           value
                              ? "Collection is visible to friends. Double tap to make private."
                              : "Collection is private. Double tap to make public."
                        }
                     />
                  </View>
               )}
            />
         </KeyboardAwareScrollView>
      </>
   );
}

const styles = StyleSheet.create({
   lead: {
      fontSize: 15,
      lineHeight: 21,
   },
   fieldLabel: {
      fontSize: 15,
      fontWeight: "600",
   },
   multilineInput: {
      minHeight: 96,
      textAlignVertical: "top",
   },
   visibilityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 16,
   },
   visibilityCopy: {
      flex: 1,
      gap: 4,
   },
   visibilityHint: {
      fontSize: 14,
      lineHeight: 20,
   },
});
