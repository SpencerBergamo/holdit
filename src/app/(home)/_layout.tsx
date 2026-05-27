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

         <Stack.Screen
            name="(profile)"
            options={{
               headerShown: false,
               presentation: "modal",
            }}
         />

         <Stack.Screen
            name="(camera)"
            options={{
               headerShown: false,
               presentation: "fullScreenModal",
               animation: "fade",
            }}
         />
      </Stack>
   );
}
