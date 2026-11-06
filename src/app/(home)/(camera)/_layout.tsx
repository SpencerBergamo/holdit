import { Stack } from "expo-router/stack";


export default function CameraLayout() {
   return (
      <Stack>
         <Stack.Screen name="index" options={{
            headerShown: false,
            presentation: "fullScreenModal",
            animation: "fade",
         }} />
         <Stack.Screen
            name="choose-collection"
            options={{
               headerShown: true,
               headerTitle: "Choose wishlist",
               presentation: "card",
               animation: "slide_from_right",
            }}
         />
      </Stack>
   );
}