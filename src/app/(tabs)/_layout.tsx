import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";


export default function NativeTabsAndroidLayout() {

    return (
        <Tabs>
            <Tabs.Screen name="home" options={{
                title: 'Home',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name="home-outline" size={24} color={color} />
                )
            }} />

            <Tabs.Screen name="collections" options={{
                title: 'Collections',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name="grid-outline" size={24} color={color} />
                )
            }} />

            <Tabs.Screen name="search" options={{
                title: 'Search',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name="search-outline" size={24} color={color} />
                )
            }} />
        </Tabs>
    )
}