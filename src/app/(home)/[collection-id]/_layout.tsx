import { Stack } from "expo-router/stack";

export default function CollectionLayout() {
   return (
      <Stack
         screenOptions={{
            headerShown: true,
            headerBackButtonDisplayMode: "minimal",
         }}
      >
         <Stack.Screen name="index" />

      </Stack>
   );
}
