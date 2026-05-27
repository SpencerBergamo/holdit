import MyTextInput from "@/components/common/MyTextInput";
import PlatformIcon, { AvailableIcons } from "@/components/PlatformIcon";
import { useMyTheme } from "@/contexts/MyThemeContext";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
   Alert,
   Pressable,
   StyleSheet,
   Switch,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type ComposeMode = "collection" | "product";

type ComposeFormData = {
   collectionName: string;
   collectionDescription: string;
   /** Maps to `collections.visible_to_friends` — public means friend-visible. */
   collectionVisibleToFriends: boolean;
   productUrl: string;
   productNotes: string;
};

const PRODUCT_CAPTURE_ERROR =
   "Add a product link or photo to save this item.";

/** Soft red for clear affordance (lighter than `colors.error`). */
const CLEAR_LINK_COLOR = "#FF6B6B";

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

/** Product saves need a URL or photo; notes alone are not enough. */
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

function isCollectionFormComplete(name: string): boolean {
   return name.trim().length > 0;
}

function isComposeFormComplete(
   mode: ComposeMode,
   data: ComposeFormData,
   photoUri: string | null,
): boolean {
   if (mode === "collection") {
      return isCollectionFormComplete(data.collectionName);
   }
   return isProductFormComplete(data.productUrl, photoUri);
}

type SegmentedOption<T extends string> = { id: T; label: string };

function SegmentedPicker<T extends string>({
   options,
   selected,
   onSelect,
   accessibilityLabel,
}: {
   options: readonly SegmentedOption<T>[];
   selected: T;
   onSelect: (id: T) => void;
   accessibilityLabel: string;
}) {
   const { colors } = useMyTheme();

   return (
      <View
         style={[
            styles.segmentedPicker,
            {
               backgroundColor: colors.inputBackground,
               padding: 4,
            },
         ]}
         accessibilityRole="tablist"
         accessibilityLabel={accessibilityLabel}
      >
         {options.map((option) => {
            const isSelected = selected === option.id;
            return (
               <Pressable
                  key={option.id}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                     if (isSelected) {
                        return;
                     }
                     void Haptics.selectionAsync();
                     onSelect(option.id);
                  }}
                  style={[
                     styles.segmentedOption,
                     isSelected && {
                        backgroundColor: colors.background,
                        shadowColor: colors.text,
                        shadowOpacity: 0.08,
                        shadowRadius: 4,
                        shadowOffset: { width: 0, height: 1 },
                        elevation: 2,
                     },
                  ]}
               >
                  <Text
                     style={[
                        styles.segmentedOptionLabel,
                        {
                           color: isSelected ? colors.text : colors.textMuted,
                           fontWeight: isSelected ? "600" : "500",
                        },
                     ]}
                  >
                     {option.label}
                  </Text>
               </Pressable>
            );
         })}
      </View>
   );
}

const COMPOSE_MODE_OPTIONS = [
   { id: "collection" as const, label: "Collection" },
   { id: "product" as const, label: "Product" },
] as const;

export default function ComposeScreen() {
   const { colors, spacing } = useMyTheme();
   const navigation = useNavigation();
   const [mode, setMode] = useState<ComposeMode>("product");
   const [photoUri, setPhotoUri] = useState<string | null>(null);
   const [captureError, setCaptureError] = useState<string | undefined>();
   const [pickingPhoto, setPickingPhoto] = useState(false);
   const urlRef = useRef<TextInput>(null);

   const {
      control,
      handleSubmit,
      watch,
      setValue,
      clearErrors,
      setError,
      trigger,
      formState: { errors },
   } = useForm<ComposeFormData>({
      mode: "onChange",
      defaultValues: {
         collectionName: "",
         collectionDescription: "",
         collectionVisibleToFriends: false,
         productUrl: "",
         productNotes: "",
      },
   });

   const collectionName = watch("collectionName");
   const productUrl = watch("productUrl");

   const canSave = useMemo(
      () =>
         isComposeFormComplete(
            mode,
            {
               collectionName,
               collectionDescription: "",
               collectionVisibleToFriends: false,
               productUrl,
               productNotes: "",
            },
            photoUri,
         ),
      [mode, collectionName, productUrl, photoUri],
   );

   const clearCaptureError = useCallback(() => {
      setCaptureError(undefined);
   }, []);

   const handlePickPhoto = useCallback(async () => {
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

   const handleRemovePhoto = useCallback(() => {
      void Haptics.selectionAsync();
      setPhotoUri(null);
   }, []);

   const handlePasteUrl = useCallback(async () => {
      const clipboard = await Clipboard.getStringAsync();
      if (!clipboard.trim()) {
         return;
      }
      setValue("productUrl", clipboard.trim(), { shouldValidate: true });
      clearCaptureError();
      void Haptics.selectionAsync();
   }, [clearCaptureError, setValue]);

   const handleClearUrl = useCallback(() => {
      setValue("productUrl", "", { shouldValidate: true });
      clearCaptureError();
      void Haptics.selectionAsync();
      urlRef.current?.focus();
   }, [clearCaptureError, setValue]);

   const hasProductUrl = productUrl.trim().length > 0;

   const onSave = useCallback(
      async (data: ComposeFormData) => {
         if (!isComposeFormComplete(mode, data, photoUri)) {
            if (mode === "collection") {
               setError("collectionName", {
                  type: "manual",
                  message: "Collection name is required",
               });
               await trigger("collectionName");
               return;
            }
            setCaptureError(PRODUCT_CAPTURE_ERROR);
            return;
         }

         void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
         );

         if (mode === "collection") {
            // TODO: create collection via API
            router.back();
            return;
         }

         // TODO: create Save from URL and/or photo capture
         router.back();
      },
      [mode, photoUri, setError, trigger],
   );

   const handleModeChange = useCallback(
      (nextMode: ComposeMode) => {
         setMode(nextMode);
         setCaptureError(undefined);
         clearErrors();
      },
      [clearErrors],
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
         headerRight: () => (
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
               <PlatformIcon
                  name={AvailableIcons.checkmark}
                  size={24}
                  color={canSave ? colors.primary : colors.textMuted}
               />
            </TouchableOpacity>
         ),
      });
   }, [
      navigation,
      canSave,
      colors.primary,
      colors.textMuted,
      handleSubmit,
      onSave,
   ]);

   return (
      <>
         <Stack.Screen options={{ headerTitle: "" }} />

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
            <SegmentedPicker
               options={COMPOSE_MODE_OPTIONS}
               selected={mode}
               onSelect={handleModeChange}
               accessibilityLabel="Compose type"
            />

            {mode === "collection" ? (
               <>
                  <Text style={[styles.lead, { color: colors.textMuted }]}>
                     Name your collection and choose who can see it.
                  </Text>

                  <Controller
                     control={control}
                     name="collectionName"
                     rules={{
                        required: "Collection name is required",
                        validate: (value) =>
                           value.trim().length > 0 ||
                           "Collection name is required",
                     }}
                     render={({ field: { onChange, onBlur, value } }) => (
                        <MyTextInput
                           autoFocus
                           placeholder="Collection name"
                           value={value}
                           onChangeText={onChange}
                           onBlur={onBlur}
                           autoCapitalize="sentences"
                           returnKeyType="next"
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
                                 style={[
                                    styles.fieldLabel,
                                    { color: colors.text },
                                 ]}
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
               </>
            ) : (
               <>

                  {/* Product photo */}
                  <View style={{ gap: spacing.s }}>
                     {/* <Text style={[styles.fieldLabel, { color: colors.text }]}>
                        Product photo
                     </Text> */}
                     {photoUri ? (
                        <View style={styles.photoPreviewWrap}>
                           <Image
                              source={{ uri: photoUri }}
                              style={styles.photoPreview}
                              contentFit="cover"
                           />
                           <View style={styles.photoActions}>
                              <Pressable
                                 onPress={() => void handlePickPhoto()}
                                 disabled={pickingPhoto}
                                 style={[
                                    styles.photoActionBtn,
                                    {
                                       backgroundColor: colors.inputBackground,
                                    },
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
                                    {
                                       backgroundColor: colors.inputBackground,
                                    },
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
                           onPress={() => void handlePickPhoto()}
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
                           accessibilityLabel="Upload product photo"
                        >
                           <PlatformIcon
                              name={AvailableIcons.photo}
                              size={28}
                              color={colors.textMuted}
                           />
                           <Text
                              style={[
                                 styles.photoPickerTitle,
                                 { color: colors.text },
                              ]}
                           >
                              Upload a photo
                           </Text>
                           <Text
                              style={[
                                 styles.photoPickerHint,
                                 { color: colors.textMuted },
                              ]}
                           >
                              From your library
                           </Text>
                        </Pressable>
                     )}
                     {captureError ? (
                        <Text
                           style={[styles.captureError, { color: colors.error }]}
                        >
                           {captureError}
                        </Text>
                     ) : null}
                  </View>

                  {/* Product link */}
                  <Text style={[styles.lead, { color: colors.textMuted }]}>
                     Paste a product link or add a photo. HoldIt will pull in
                     the details.
                  </Text>

                  <View style={{ gap: spacing.s }}>
                     <Controller
                        control={control}
                        name="productUrl"
                        rules={{
                           validate: (value) =>
                              isValidProductUrl(value) ||
                              "Enter a valid product URL",
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                           <MyTextInput
                              ref={urlRef}
                              placeholder="https://…"
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
                        )}
                     />
                     <Pressable
                        onPress={() =>
                           hasProductUrl
                              ? handleClearUrl()
                              : void handlePasteUrl()
                        }
                        style={styles.inlineAction}
                        accessibilityRole="button"
                        accessibilityLabel={
                           hasProductUrl
                              ? "Clear product link"
                              : "Paste from clipboard"
                        }
                     >
                        <PlatformIcon
                           name={
                              hasProductUrl
                                 ? AvailableIcons.close
                                 : AvailableIcons.link
                           }
                           size={18}
                           color={
                              hasProductUrl
                                 ? CLEAR_LINK_COLOR
                                 : colors.primary
                           }
                        />
                        <Text
                           style={[
                              styles.inlineActionLabel,
                              {
                                 color: hasProductUrl
                                    ? CLEAR_LINK_COLOR
                                    : colors.primary,
                              },
                           ]}
                        >
                           {hasProductUrl
                              ? "Clear"
                              : "Paste from clipboard"}
                        </Text>
                     </Pressable>
                  </View>

                  <Controller
                     control={control}
                     name="productNotes"
                     render={({ field: { onChange, onBlur, value } }) => (
                        <View style={{ gap: spacing.s }}>
                           <Text
                              style={[styles.fieldLabel, { color: colors.text }]}
                           >
                              Notes
                           </Text>
                           <Text>
                              Additional details to help find what you're looking for.
                           </Text>
                           <MyTextInput
                              placeholder="Retailer preference, size, timing…"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              multiline
                              style={styles.multilineInput}
                           />
                        </View>
                     )}
                  />
               </>
            )}
         </KeyboardAwareScrollView>
      </>
   );
}

const styles = StyleSheet.create({
   segmentedPicker: {
      flexDirection: "row",
      borderRadius: 12,
   },
   segmentedOption: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
   },
   segmentedOptionLabel: {
      fontSize: 15,
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
   inlineAction: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      alignSelf: "stretch",
      paddingVertical: 4,
   },
   inlineActionLabel: {
      fontSize: 15,
      fontWeight: "500",
   },
   orRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
   },
   orLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
   },
   orLabel: {
      fontSize: 13,
      fontWeight: "500",
      textTransform: "lowercase",
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
