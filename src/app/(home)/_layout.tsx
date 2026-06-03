import PlatformIcon, { AvailableIcons } from "@/components/PlatformIcon";
import { HomeFabProvider } from "@/contexts/HomeFabContext";
import { router, Stack } from "expo-router";
import { TouchableOpacity, View } from "react-native";

function HomeHeaderActions() {
   return (
      <View style={{ flexDirection: "row", gap: 18, marginHorizontal: 12 }}>
         <TouchableOpacity
            onPress={() => { }}
            accessibilityRole="button"
            accessibilityLabel="Inbox"
         >
            <PlatformIcon name={AvailableIcons.tray} size={22} />
         </TouchableOpacity>
         <TouchableOpacity
            onPress={() => router.push("/(home)/(profile)")}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
         >
            <PlatformIcon name={AvailableIcons.profile} size={22} />
         </TouchableOpacity>
      </View>
   );
}

export default function HomeLayout() {
   return (
      <HomeFabProvider>
         <Stack
            screenOptions={{
               headerShown: true,
               headerShadowVisible: false,
               headerBackButtonDisplayMode: "minimal",
               headerLargeTitleShadowVisible: false,
               headerLargeTitle: true,
            }}
         >
            <Stack.Screen
               name="index"
               options={{
                  title: "HoldIt",
                  headerRight: () => <HomeHeaderActions />,
               }}
            />

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
         </Stack>
      </HomeFabProvider>
   );
}
