import { Stack } from "expo-router/stack";

export default function ProfileLayout() {
   return (
      <Stack
         screenOptions={{
            headerShown: true,
            headerShadowVisible: true,
            headerBackButtonDisplayMode: "minimal",
            headerLargeTitle: false,
         }}
      >
         <Stack.Screen name="index"
            options={{
               title: "Settings",
               headerTransparent: true,
            }} />

         <Stack.Screen name="edit-profile"
            options={{
               title: "Edit Profile",
               headerTransparent: true,
            }} />

      </Stack>
   );
}
