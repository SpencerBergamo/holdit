import { Stack } from "expo-router";

export default function HomeLayout() {
   return (
         <Stack
            screenOptions={{
               headerShown: true,
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
                  headerTransparent: true,
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

            <Stack.Screen
               name="[collection-id]"
               options={{ headerShown: false }}
            />

            <Stack.Screen
               name="compose"
               options={{
                  headerShown: true,
                  headerTitle: "",
                  headerLargeTitle: false,
                  presentation: "modal",
                  headerTransparent: true,
               }}
            />

            <Stack.Screen
               name="new-collection"
               options={{
                  headerShown: true,
                  headerTitle: "New Collection",
                  headerLargeTitle: false,
                  presentation: "modal",
                  headerTransparent: true,
               }}
            />

            <Stack.Screen
               name="new-product"
               options={{
                  headerShown: true,
                  headerTitle: "New Product",
                  headerLargeTitle: false,
                  presentation: "modal",
                  headerTransparent: true,
               }}
            />

         </Stack>
   );
}
