import { Stack } from "expo-router";

export default function HomeLayout() {

  return (
    <Stack screenOptions={{
      headerShadowVisible: false,
      headerBackButtonDisplayMode: 'minimal',
      headerLargeTitleShadowVisible: false,
    }}>
      <Stack.Screen name="index" options={{
        headerTitle: 'HoldIt',
        headerLargeTitle: true,
        headerSearchBarOptions: {
          placeholder: 'Search Products',
        },

      }} />

      <Stack.Screen name="new-list" options={{
        headerTitle: 'Create New Collection',
        presentation: 'formSheet',
        headerTransparent: true,
      }} />

      <Stack.Screen name="new-product" options={{
        headerTitle: 'Create New Product',
        presentation: 'formSheet',
        headerTransparent: true,
      }} />

      <Stack.Screen name="[collectionId]" options={{
        title: '',
        headerShadowVisible: false,
        headerTransparent: true,
      }} />
    </Stack>
  )
} 
