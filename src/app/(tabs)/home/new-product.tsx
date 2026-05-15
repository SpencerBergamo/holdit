import * as ImagePicker from 'expo-image-picker';
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

interface FormData {
  name: string;
  description?: string;
  url?: string;
}

export default function NewProductScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm<FormData>({
    mode: 'onChange',
  });

  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Media library permission is required to pick images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) { }
  };

  const pickImageFromCamera = async () => {
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

    if (!result.canceled && result.assets[0]) { }
  };

  return (
    <></>
  );
}
