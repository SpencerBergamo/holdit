import { Stack } from "expo-router";


export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{
        headerTitle: "Profile",
        headerLargeTitle: true,
        headerTransparent: true,
      }} />

      <Stack.Screen name="edit-profile" options={{
        headerTitle: 'Edit Profile',
        presentation: 'formSheet',
        headerShown: true,
        headerTransparent: true,
      }} />
    </Stack>
  )
}
