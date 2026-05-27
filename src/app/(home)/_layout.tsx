import { Stack } from "expo-router/stack";

export default function HomeLayout() {
   return (
      <Stack
         screenOptions={{
            headerShown: false,
            headerShadowVisible: false,
            headerBackButtonDisplayMode: "minimal",
            headerLargeTitleShadowVisible: false,
            headerLargeTitle: true,
         }}
      >
         <Stack.Screen name="index" />
         <Stack.Screen name="profile" />
         <Stack.Screen name="lists" />
         <Stack.Screen name="camera" />
      </Stack>
   );
}
