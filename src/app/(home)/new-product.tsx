import MyTextInput from "@/components/common/MyTextInput";
import PlatformIcon, { AvailableIcons } from "@/components/PlatformIcon";
import { useMyTheme } from "@/contexts/MyThemeContext";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
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

type ProductFormData = {
   productUrl: string;
   productNotes: string;
};

const PRODUCT_CAPTURE_ERROR =
   "Add a product link or photo to save this item.";

const CLIPBOARD_PLACEHOLDER_MAX_LENGTH = 48;

function truncateClipboardPreview(text: string): string {
   const normalized = text.trim().replace(/\s+/g, " ");
   if (normalized.length <= CLIPBOARD_PLACEHOLDER_MAX_LENGTH) {
      return normalized;
   }
   return `${normalized.slice(0, CLIPBOARD_PLACEHOLDER_MAX_LENGTH)}…`;
}

function normalizeUrl(value: string): string {
   const trimmed = value.trim();
   if (!trimmed) {
      return "";
   }
   return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidProductUrl(value: string): boolean {
   const trimmed = value.trim();
   if (!trimmed) {
      return true;
   }
   try {
      const url = new URL(normalizeUrl(trimmed));
      return url.protocol === "http:" || url.protocol === "https:";
   } catch {
      return false;
   }
}

function hasProductCapture(url: string, photoUri: string | null): boolean {
   return url.trim().length > 0 || photoUri !== null;
}

function isProductFormComplete(
   url: string,
   photoUri: string | null,
): boolean {
   if (!hasProductCapture(url, photoUri)) {
      return false;
   }
   if (url.trim() && !isValidProductUrl(url)) {
      return false;
   }
   return true;
}

export default function NewProductScreen() {
   const { colors, spacing } = useMyTheme();
   const navigation = useNavigation();
   const params = useLocalSearchParams<{ "collection-id"?: string }>();
   const collectionId = params["collection-id"];

   const [photoUri, setPhotoUri] = useState<string | null>(null);
   const [captureError, setCaptureError] = useState<string | undefined>();
   const [pickingPhoto, setPickingPhoto] = useState(false);
   const [saving, setSaving] = useState(false);
   const [clipboardText, setClipboardText] = useState("");

   const {
      control,
      handleSubmit,
      watch,
      setValue,
      formState: { errors },
   } = useForm<ProductFormData>({
      mode: "onChange",
      defaultValues: {
         productUrl: "",
         productNotes: "",
      },
   });

   const productUrl = watch("productUrl");

   useFocusEffect(
      useCallback(() => {
         let cancelled = false;

         void Clipboard.getStringAsync().then((text) => {
            if (!cancelled) {
               if (isValidProductUrl(text)) {
                  let trimmed = text.replace(/^https?:\/\//i, "").trim();
                  setClipboardText(trimmed);
               }
            }
         });

         return () => {
            cancelled = true;
         };
      }, []),
   );

   const urlPlaceholder = useMemo(() => {
      if (!clipboardText) {
         return "https://…";
      }
      return truncateClipboardPreview(clipboardText);
   }, [clipboardText]);

   const canSave = useMemo(
      () => isProductFormComplete(productUrl, photoUri),
      [photoUri, productUrl],
   );

   const clearCaptureError = useCallback(() => {
      setCaptureError(undefined);
   }, []);

   const pickFromGallery = useCallback(async () => {
      setPickingPhoto(true);
      try {
         const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
         if (!permission.granted) {
            Alert.alert(
               "Photos access needed",
               "HoldIt needs access to your photo library to attach a product image.",
            );
            return;
         }

         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.85,
            allowsEditing: true,
         });

         if (!result.canceled && result.assets[0]?.uri) {
            setPhotoUri(result.assets[0].uri);
            clearCaptureError();
            void Haptics.notificationAsync(
               Haptics.NotificationFeedbackType.Success,
            );
         }
      } finally {
         setPickingPhoto(false);
      }
   }, [clearCaptureError]);

   const pickFromCamera = useCallback(async () => {
      setPickingPhoto(true);
      try {
         const permission = await ImagePicker.requestCameraPermissionsAsync();
         if (!permission.granted) {
            Alert.alert(
               "Camera access needed",
               "HoldIt needs access to your camera to capture a product image.",
            );
            return;
         }

         const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.85,
            allowsEditing: true,
         });

         if (!result.canceled && result.assets[0]?.uri) {
            setPhotoUri(result.assets[0].uri);
            clearCaptureError();
            void Haptics.notificationAsync(
               Haptics.NotificationFeedbackType.Success,
            );
         }
      } finally {
         setPickingPhoto(false);
      }
   }, [clearCaptureError]);

   const promptPhotoSource = useCallback(() => {
      if (pickingPhoto) {
         return;
      }

      Alert.alert(
         "Add a photo",
         "Choose where to get your product image.",
         [
            { text: "Gallery", onPress: () => void pickFromGallery() },
            { text: "Camera", onPress: () => void pickFromCamera() },
            { text: "Cancel", style: "cancel" },
         ],
      );
   }, [pickFromCamera, pickFromGallery, pickingPhoto]);

   const handleRemovePhoto = useCallback(() => {
      void Haptics.selectionAsync();
      setPhotoUri(null);
   }, []);

   const handlePasteUrl = useCallback(() => {
      if (!clipboardText) {
         return;
      }
      setValue("productUrl", clipboardText, { shouldValidate: true });
      clearCaptureError();
      void Haptics.selectionAsync();
   }, [clearCaptureError, clipboardText, setValue]);

   const onSave = useCallback(
      async (data: ProductFormData) => {
         if (!isProductFormComplete(data.productUrl, photoUri)) {
            setCaptureError(PRODUCT_CAPTURE_ERROR);
            return;
         }

         setSaving(true);
         try {
            // TODO: create Save from URL and/or photo capture for collectionId
            void collectionId;
            void data.productNotes;

            void Haptics.notificationAsync(
               Haptics.NotificationFeedbackType.Success,
            );
            router.back();
         } catch (e) {
            const message =
               e instanceof Error ? e.message : "Unable to save product.";
            Alert.alert("Unable to save", message);
         } finally {
            setSaving(false);
         }
      },
      [collectionId, photoUri],
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
         <Stack.Screen options={{ headerTitle: "New Product" }} />

         <KeyboardAwareScrollView
            bottomOffset={40}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{
               paddingHorizontal: spacing.m,
               paddingBottom: spacing.xl,
               gap: spacing.l,
            }}
         >
            {/* 1. Photo */}
            <View style={{ gap: spacing.s }}>
               <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Product photo
               </Text>
               {photoUri ? (
                  <View style={styles.photoPreviewWrap}>
                     <Image
                        source={{ uri: photoUri }}
                        style={styles.photoPreview}
                        contentFit="cover"
                     />
                     <View style={styles.photoActions}>
                        <Pressable
                           onPress={promptPhotoSource}
                           disabled={pickingPhoto}
                           style={[
                              styles.photoActionBtn,
                              { backgroundColor: colors.inputBackground },
                           ]}
                           accessibilityRole="button"
                           accessibilityLabel="Replace photo"
                        >
                           <Text
                              style={[
                                 styles.photoActionLabel,
                                 { color: colors.text },
                              ]}
                           >
                              Replace
                           </Text>
                        </Pressable>
                        <Pressable
                           onPress={handleRemovePhoto}
                           style={[
                              styles.photoActionBtn,
                              { backgroundColor: colors.inputBackground },
                           ]}
                           accessibilityRole="button"
                           accessibilityLabel="Remove photo"
                        >
                           <Text
                              style={[
                                 styles.photoActionLabel,
                                 { color: colors.error },
                              ]}
                           >
                              Remove
                           </Text>
                        </Pressable>
                     </View>
                  </View>
               ) : (
                  <Pressable
                     onPress={promptPhotoSource}
                     disabled={pickingPhoto}
                     style={({ pressed }) => [
                        styles.photoPicker,
                        {
                           borderColor: captureError
                              ? colors.error
                              : colors.inputBorder,
                           backgroundColor: colors.inputBackground,
                           opacity: pressed || pickingPhoto ? 0.85 : 1,
                        },
                     ]}
                     accessibilityRole="button"
                     accessibilityLabel="Add product photo"
                  >
                     <PlatformIcon
                        name={AvailableIcons.photo}
                        size={28}
                        color={colors.textMuted}
                     />
                     <Text
                        style={[styles.photoPickerTitle, { color: colors.text }]}
                     >
                        Add a photo
                     </Text>
                     <Text
                        style={[
                           styles.photoPickerHint,
                           { color: colors.textMuted },
                        ]}
                     >
                        Gallery or camera
                     </Text>
                  </Pressable>
               )}
               {captureError ? (
                  <Text
                     selectable
                     style={[styles.captureError, { color: colors.error }]}
                  >
                     {captureError}
                  </Text>
               ) : null}
            </View>

            {/* 2. URL */}
            <View style={{ gap: spacing.s }}>
               <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Product link
               </Text>
               <Text style={[styles.lead, { color: colors.textMuted }]}>
                  Paste a link or type one in. HoldIt will pull in the details.
               </Text>
               <Controller
                  control={control}
                  name="productUrl"
                  rules={{
                     validate: (value) =>
                        isValidProductUrl(value) || "Enter a valid product URL",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                     <>
                        <MyTextInput
                           placeholder={urlPlaceholder}
                           value={value}
                           onChangeText={(text) => {
                              onChange(text);
                              clearCaptureError();
                           }}
                           onBlur={onBlur}
                           autoCapitalize="none"
                           autoCorrect={false}
                           keyboardType="url"
                           textContentType="URL"
                           returnKeyType="done"
                           error={errors.productUrl?.message}
                        />
                        {clipboardText && value.trim() !== clipboardText ? (
                           <Pressable
                              onPress={handlePasteUrl}
                              style={styles.acceptPasteButton}
                              accessibilityRole="button"
                              accessibilityLabel="Paste from Clipboard"
                           >
                              <PlatformIcon name={AvailableIcons.clipboard} size={18} color={colors.primary} />
                              <Text
                                 style={[
                                    styles.acceptPasteLabel,
                                    { color: colors.primary },
                                 ]}
                              >
                                 Paste from Clipboard
                              </Text>
                           </Pressable>
                        ) : null}
                     </>
                  )}
               />
            </View>

            {/* 3. Notes */}
            <Controller
               control={control}
               name="productNotes"
               render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ gap: spacing.s }}>
                     <Text style={[styles.fieldLabel, { color: colors.text }]}>
                        Notes
                     </Text>
                     <Text style={[styles.lead, { color: colors.textMuted }]}>
                        Retailer preference, size, timing, or anything else
                        helpful.
                     </Text>
                     <MyTextInput
                        placeholder="Optional details…"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        style={styles.multilineInput}
                     />
                  </View>
               )}
            />
         </KeyboardAwareScrollView>
      </>
   );
}

const styles = StyleSheet.create({
   fieldLabel: {
      fontSize: 15,
      fontWeight: "600",
   },
   lead: {
      fontSize: 15,
      lineHeight: 21,
   },
   acceptPasteButton: {
      flexDirection: "row",
      gap: 6,
      alignSelf: "center",
      paddingVertical: 4,
   },
   acceptPasteLabel: {
      fontSize: 15,
      fontWeight: "500",
   },
   multilineInput: {
      minHeight: 96,
      textAlignVertical: "top",
   },
   photoPicker: {
      borderWidth: 1,
      borderRadius: 16,
      borderStyle: "dashed",
      paddingVertical: 28,
      alignItems: "center",
      gap: 6,
   },
   photoPickerTitle: {
      fontSize: 16,
      fontWeight: "600",
   },
   photoPickerHint: {
      fontSize: 14,
   },
   photoPreviewWrap: {
      gap: 12,
   },
   photoPreview: {
      width: "100%",
      aspectRatio: 4 / 3,
      borderRadius: 16,
   },
   photoActions: {
      flexDirection: "row",
      gap: 12,
   },
   photoActionBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
   },
   photoActionLabel: {
      fontSize: 15,
      fontWeight: "600",
   },
   captureError: {
      fontSize: 13,
      paddingHorizontal: 4,
   },
});
