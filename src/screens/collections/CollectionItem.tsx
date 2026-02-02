import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";


export function CollectionItem() {
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
      <Text>Collection Item {collectionId}</Text>
    </View>
  )
}