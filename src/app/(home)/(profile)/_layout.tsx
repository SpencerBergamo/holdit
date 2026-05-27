import { Stack } from "expo-router/stack";

export default function ProfileLayout() {
   return (
      <Stack
         screenOptions={{
            headerShown: true,
            headerShadowVisible: false,
            headerBackButtonDisplayMode: "minimal",
            headerLargeTitle: false,
         }}
      >
         <Stack.Screen name="index" options={{ title: "Settings" }} />
         <Stack.Screen name="edit-profile" options={{ title: "Edit Profile" }} />
      </Stack>
   );
}
