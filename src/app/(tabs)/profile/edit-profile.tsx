import { useTheme } from '@/constants/theme';
import { ContextMenu, Host, Button as SwiftButton } from '@expo/ui/swift-ui';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, space, radius, type } = useTheme();
  // TODO: Replace with Supabase user data
  const user = { firstName: '', lastName: '', username: '', imageUrl: '' };
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const usernameRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
    },
  });

  const pickImageFromLibrary = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadProfileImage(result.assets[0]);
    }
  }, []);

  const pickImageFromCamera = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadProfileImage(result.assets[0]);
    }
  }, []);

  const uploadProfileImage = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!user || !asset.base64) return;

    setUploadingImage(true);
    try {
      // TODO: Implement profile image upload with Supabase storage
      setProfileImage(asset.uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      console.error('Image upload error:', err);
      const errorMessage = err?.errors?.[0]?.longMessage || err?.message || 'Please try again';
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Unable to upload image', errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = useCallback(async (data: FormData) => {
    if (!user) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // TODO: Implement profile update with Supabase
      console.log('Update profile:', data);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.error('Update error:', err);
      const errorMessage = err?.errors?.[0]?.longMessage || err?.message || 'Please try again';
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Unable to update profile', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  if (!user) return null;

  const currentImage = profileImage || user.imageUrl;

  return (
    <>
      <Stack.Screen options={{
        headerLeft: () => (
          <Pressable
            style={{ paddingHorizontal: space[4] }}
            onPress={() => router.back()}>
            <Text>Cancel</Text>
          </Pressable>
        ),
        headerRight: () => (
          <Button
            title="Save"
            color={colors.primary}
            disabled={!isDirty || loading}
            onPress={handleSubmit(onSubmit)}
          />
        ),
      }} />
      <KeyboardAwareScrollView
        contentInsetAdjustmentBehavior='automatic'
        bottomOffset={40}
        contentContainerStyle={{ paddingHorizontal: space[4], paddingBottom: insets.bottom + space[6] }}
      >
        {/* Profile Photo */}
        <View style={[styles.photoSection, { alignItems: 'center', paddingVertical: space[5] }]}>
          <Host style={{ alignItems: 'center' }}>
            <ContextMenu>
              <ContextMenu.Items>
                <SwiftButton systemImage="photo" onPress={pickImageFromLibrary}>
                  Choose from Library
                </SwiftButton>
                <SwiftButton systemImage="camera" onPress={pickImageFromCamera}>
                  Take Photo
                </SwiftButton>
              </ContextMenu.Items>
              <ContextMenu.Trigger>
                <Pressable
                  style={({ pressed }) => [
                    styles.photoContainer,
                    { opacity: pressed ? 0.8 : 1 }
                  ]}
                  onLongPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  {uploadingImage && (
                    <View style={[styles.photoOverlay, { backgroundColor: colors.overlay }]}>
                      <ActivityIndicator color="#fff" size="large" />
                    </View>
                  )}
                  <Image
                    source={{ uri: currentImage }}
                    style={[
                      styles.photo,
                      {
                        borderRadius: radius.full,
                        borderWidth: 3,
                        borderColor: colors.border,
                      }
                    ]}
                  />
                  <View
                    style={[
                      styles.photoBadge,
                      {
                        backgroundColor: colors.primary,
                        borderRadius: radius.full,
                        borderWidth: 2,
                        borderColor: colors.bg,
                      }
                    ]}
                  >
                    <SymbolView name="camera" size={16} tintColor={colors.bg} />
                  </View>
                </Pressable>
              </ContextMenu.Trigger>
            </ContextMenu>
          </Host>
          <Text style={{ color: colors.textMuted, marginTop: space[2] }}>
            Tap and hold to change photo
          </Text>
        </View>

        <View style={{ gap: space[3] }}>
          <Text style={{ color: colors.textMuted }}>
            INFORMATION
          </Text>

          {/* Compact Name Fields */}
          <View style={[styles.row, { gap: space[2] }]}>
            <View style={[styles.inputContainer, { flex: 1, gap: space[1] }]}>
              <Text style={{ color: colors.textSubtle }}>First Name</Text>
              <Controller
                control={control}
                name="firstName"
                rules={{
                  required: 'Required',
                  minLength: { value: 2, message: 'Too short' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="First"
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!loading}
                    returnKeyType="next"
                    onSubmitEditing={() => usernameRef.current?.focus()}
                    style={[
                      styles.input,
                      {
                        borderColor: errors.firstName ? colors.error : colors.border,
                        color: colors.text,
                        backgroundColor: colors.elevated,
                        borderRadius: radius.md,
                        paddingHorizontal: space[3],
                        paddingVertical: space[2],
                      }
                    ]}
                  />
                )}
              />
              {errors.firstName && (
                <Text style={{ color: colors.error, fontSize: 10 }}>
                  {errors.firstName.message}
                </Text>
              )}
            </View>

            <View style={[styles.inputContainer, { flex: 1, gap: space[1] }]}>
              <Text style={{ color: colors.textSubtle }}>Last Name</Text>
              <Controller
                control={control}
                name="lastName"
                rules={{
                  required: 'Required',
                  minLength: { value: 2, message: 'Too short' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Last"
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!loading}
                    returnKeyType="next"
                    onSubmitEditing={() => usernameRef.current?.focus()}
                    style={[
                      styles.input,
                      {
                        borderColor: errors.lastName ? colors.error : colors.border,
                        color: colors.text,
                        backgroundColor: colors.elevated,
                        borderRadius: radius.md,
                        paddingHorizontal: space[3],
                        paddingVertical: space[2],
                      }
                    ]}
                  />
                )}
              />
              {errors.lastName && (
                <Text style={{ color: colors.error, fontSize: 10 }}>
                  {errors.lastName.message}
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.inputContainer, { gap: space[1] }]}>
            <Text style={{ color: colors.textSubtle }}>Username</Text>
            <Controller
              control={control}
              name="username"
              rules={{
                required: 'Required',
                minLength: { value: 3, message: 'Min 3 characters' },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Letters, numbers, and underscores only',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={usernameRef}
                  placeholder="username"
                  placeholderTextColor={colors.textMuted}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  style={[
                    styles.input,
                    {
                      borderColor: errors.username ? colors.error : colors.border,
                      color: colors.text,
                      backgroundColor: colors.elevated,
                      borderRadius: radius.md,
                      paddingHorizontal: space[3],
                      paddingVertical: space[2],
                    }
                  ]}
                />
              )}
            />
            {errors.username && (
              <Text style={{ color: colors.error, fontSize: 10 }}>
                {errors.username.message}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.buttonContainer, { gap: space[3] }]}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.full,
                paddingVertical: space[4],
                opacity: (!isDirty || loading) ? 0.5 : pressed ? 0.8 : 1,
              }
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff' }}>Save Changes</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                borderRadius: radius.full,
                paddingVertical: space[4],
                opacity: loading ? 0.5 : pressed ? 0.8 : 1,
              }
            ]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={{ color: colors.textMuted }}>Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  photoSection: {
    marginBottom: 8,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  photoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  inputContainer: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
