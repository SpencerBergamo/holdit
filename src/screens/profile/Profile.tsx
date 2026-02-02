import { useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { Text, View } from "react-native";

export function Profile() {
  const { user } = useUser();


  if (!user) return null;

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: user.imageUrl }} style={{ width: 100, height: 100 }} />
      <Text>{user.fullName}</Text>
    </View>
  )
}