import PlatformIcon from "@/components/PlatformIcon";
import { Stack } from "expo-router";
import { Pressable, Text } from "react-native";


export default function HomeLayout() {

  return (
    <Stack>

      <Stack.Screen name="index" options={{
        headerTitle: 'HoldIt',
        headerTitleAlign: 'left',
        headerLargeTitle: true,
        headerTransparent: true,
        headerSearchBarOptions: {
          hideWhenScrolling: true,
          placeholder: 'Search Products',
        },
        headerRight: ({ tintColor }) => (
          <Pressable
            onPress={() => { }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 12,
              gap: 8,
            }}>
            <PlatformIcon name="plus" size={24} color={tintColor} />
            <Text style={{ color: tintColor }}>New Item</Text>
          </Pressable>
        )
      }} />
    </Stack>
  )
}