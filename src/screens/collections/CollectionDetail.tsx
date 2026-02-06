import { useAction, useMutation, usePaginatedQuery } from "convex/react";
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { Alert, Text, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

type ProductFormData = {
  name: string;
  description?: string;
  url?: string;
}

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_HTTP_URL;

export function CollectionDetail() {
  const { collectionId } = useLocalSearchParams<{ collectionId: Id<'collections'> }>();

  const newProductFromURL = useAction(api.gemini.newProductFromURL);
  const newProduct = useMutation(api.products.newProduct);
  const { isLoading, results, status, loadMore } = usePaginatedQuery(api.products.getUserProducts, {}, {
    initialNumItems: 10,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<ProductFormData>({
    mode: 'onChange',
  })

  // pass json/html to gemini to get product json object that can be added to database
  const createProductFromURL = async (url: string) => {
    try {
      await newProductFromURL({ url, collectionId });
    } catch (e) {
      console.error('Parse URL error:', e);
      Alert.alert('Unable to parse URL', 'Please try again');
    }
  }

  // pass user taken photo to gemini to find the product online, construct the json object and store in the database
  const createProductFromImage = async (useCamera: boolean) => {
    try {
      if (!convexUrl) throw new Error('Convex URL is not set');

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

      const response = await fetch(`${convexUrl}/find-product`, {
        method: 'POST',
        body: JSON.stringify({ base64, mimeType, collectionId }),
      });


      if (!response.ok) throw new Error('Failed to find product');
    } catch (e) {
      console.error('Find product error:', e);
      Alert.alert('Unable to find product', 'Please try again');
    }
  }

  // create a product manually and add to database
  const onSubmit = async (data: ProductFormData) => {
    try {
      const product = await newProduct({
        collectionId,
        name: data.name,
        description: data.description,
        url: data.url,
      });


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