import { Stack } from "expo-router";

export default function CollectionsLayout() {

  return (
    <Stack screenOptions={{
      headerBackButtonDisplayMode: 'minimal',
      headerShadowVisible: false
    }}>
      <Stack.Screen name="index" options={{
        headerTitle: 'Collections',
        headerLargeTitle: true,
      }} />

      <Stack.Screen name="[collectionId]" options={{
        title: '',
      }} />
    </Stack>
  )
}