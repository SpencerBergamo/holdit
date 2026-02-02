import { Stack } from "expo-router";

export default function HomeLayout() {

  return (
    <Stack screenOptions={{
      headerShadowVisible: false,
      headerBackButtonDisplayMode: 'minimal',
      headerLargeTitleShadowVisible: false,
    }}>
      <Stack.Screen name="index" options={{
        headerTitle: 'Home',
        headerLargeTitle: true,
        headerSearchBarOptions: {
          placeholder: 'Search Products',
        },

      }} />

      <Stack.Screen name="[collectionId]" options={{
        title: '',
        headerShadowVisible: false,
        headerTransparent: true,
      }} />
    </Stack>
  )
} 
