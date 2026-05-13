import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { Alert, Text, View } from "react-native";

type ProductFormData = {
  name: string;
  description?: string;
  url?: string;
}

export function CollectionDetail() {
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();

  // TODO: Replace with actual data fetching / mutations
  const results: unknown[] = [];
  const isLoading = false;
  const loadMore = (_n: number) => {};

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<ProductFormData>({
    mode: 'onChange',
  })

  // TODO: Re-implement with new backend — pass URL to Gemini to extract product details
  const createProductFromURL = async (url: string) => {
    try {
      // TODO: Call backend to create product from URL
      console.warn('createProductFromURL not yet implemented');
    } catch (e) {
      console.error('Parse URL error:', e);
      Alert.alert('Unable to parse URL', 'Please try again');
    }
  }

  // TODO: Re-implement with new backend — pass photo to Gemini to find and store product
  const createProductFromImage = async (useCamera: boolean) => {
    try {
      const pickerOptions = {
        allowsMultipleSelection: false,
        base64: true,
        quality: 0.8,
      }

      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert('Permission Required', 'Media library permission is required to pick images.');
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (result.canceled || result.assets.length === 0) return;

      const { base64, mimeType } = result.assets[0];
      if (!base64 || !mimeType) throw new Error('No image data returned');

      // TODO: Send image to backend for product detection
      console.warn('createProductFromImage not yet implemented');
    } catch (e) {
      console.error('Find product error:', e);
      Alert.alert('Unable to find product', 'Please try again');
    }
  }

  // TODO: Re-implement with new backend — create product manually
  const onSubmit = async (data: ProductFormData) => {
    try {
      // TODO: Call backend to create product
      console.warn('onSubmit not yet implemented');
    } catch (e) {
      console.error('Create product error:', e);
      Alert.alert('Unable to create product', 'Please try again');
    }
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
      <Text>Collection Item {collectionId}</Text>
    </View>
  )
}