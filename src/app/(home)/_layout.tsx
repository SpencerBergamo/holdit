import PlatformIcon, { AvailableIcons } from "@/components/PlatformIcon";
import { router, Stack } from "expo-router";
import { TouchableOpacity, View } from "react-native";

function HomeHeaderActions() {
   return (
      <View style={{ flexDirection: "row", gap: 24, marginHorizontal: 12 }}>
         <TouchableOpacity
            onPress={() => router.push("/")}
            accessibilityRole="button"
            accessibilityLabel="Inbox"
         >
            <PlatformIcon name={AvailableIcons.tray} size={22} />
         </TouchableOpacity>
         <TouchableOpacity
            onPress={() => router.push("/")}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
         >
            <PlatformIcon name={AvailableIcons.bell} size={22} />
         </TouchableOpacity>
      </View>
   );
}

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
