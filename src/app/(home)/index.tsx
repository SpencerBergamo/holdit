import PlatformIcon, { AvailableIcons } from "@/components/PlatformIcon";
import WishlistCard from "@/components/WishlistCard";
import { useFabActions } from "@/contexts/HomeFabContext";
import { useMyTheme } from "@/contexts/MyThemeContext";
import { useFabScrollHide } from "@/hooks/use-fab-scroll-hide";
import { useMyCollections } from "@/hooks/use-my-collections";
import { useSearch } from "@/hooks/use-search";
import type { CollectionWithSaveCount } from "@/types/collection";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import {
   ActivityIndicator,
   Pressable,
   RefreshControl,
   StyleSheet,
   Text,
   View,
} from "react-native";

export default function HomeScreen() {
   const { colors, spacing } = useMyTheme();
   const { onFabScroll } = useFabScrollHide();

   useFabActions(useMemo(() => [
      {
         id: 'profile',
         icon: <PlatformIcon name={AvailableIcons.profile} size={22} />,
         accessibilityLabel: 'Profile',
         onPress: () => router.push('/(home)/(profile)'),
      },
      {
         id: 'friends',
         icon: <PlatformIcon name={AvailableIcons.friends} size={22} />,
         accessibilityLabel: 'Friends',
         onPress: () => { },
      },
      {
         id: 'compose',
         icon: <PlatformIcon name={AvailableIcons.compose} size={22} />,
         accessibilityLabel: 'Compose',
         onPress: () => router.push('/(home)/compose'),
      },
      {
         id: 'camera',
         icon: <PlatformIcon name={AvailableIcons.camera} size={22} />,
         accessibilityLabel: 'Add item',
         onPress: () => router.push('/(home)/(camera)'),
      },
   ], []));

   const {
      collections,
      isLoading,
      isRefreshing,
      error,
      refresh,
   } = useMyCollections();

   const search = useSearch({
      placeholder: "Search wishlists",
      hideWhenScrolling: false,
      placement: "stacked",
   });

   const horizontalPadding = spacing.m;

   const filteredCollections = useMemo(() => {
      const query = search.trim().toLowerCase();
      if (!query) {
         return collections;
      }
      return collections.filter((item) =>
         item.name.toLowerCase().includes(query),
      );
   }, [collections, search]);

   const listContentStyle = useMemo(
      () => ({
         paddingHorizontal: horizontalPadding,
         paddingTop: spacing.s,
         paddingBottom: spacing.xl * 3,
      }),
      [horizontalPadding, spacing.s, spacing.xl],
   );

   const renderCollection: ListRenderItem<CollectionWithSaveCount> =
      useCallback(
         ({ item }) => (
            <WishlistCard
               name={item.name}
               itemCount={item.save_count}
               containerStyle={{ marginBottom: spacing.s }}
               onPress={() =>
                  router.push({
                     pathname: "/(home)/[collection-id]",
                     params: { "collection-id": item.id },
                  })
               }
            />
         ),
         [spacing.s],
      );

   const listEmpty = useMemo(() => {
      if (isLoading) {
         return (
            <View style={styles.emptyState}>
               <ActivityIndicator size="large" color={colors.primary} />
            </View>
         );
      }

      if (error) {
         return (
            <View style={styles.emptyState}>
               <Text selectable style={[styles.emptyTitle, { color: colors.text }]}>
                  Couldn&apos;t load collections
               </Text>
               <Text
                  selectable
                  style={[styles.emptyMessage, { color: colors.textMuted }]}
               >
                  {error}
               </Text>
               <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Try again"
                  onPress={() => void refresh()}
                  style={({ pressed }) => [
                     styles.retryButton,
                     {
                        backgroundColor: colors.primary,
                        opacity: pressed ? 0.85 : 1,
                     },
                  ]}
               >
                  <Text style={[styles.retryLabel, { color: colors.background }]}>
                     Try again
                  </Text>
               </Pressable>
            </View>
         );
      }

      if (search.trim()) {
         return (
            <View style={styles.emptyState}>
               <Text selectable style={[styles.emptyTitle, { color: colors.text }]}>
                  No wishlists found
               </Text>
               <Text
                  selectable
                  style={[styles.emptyMessage, { color: colors.textMuted }]}
               >
                  {`Try a different search for "${search.trim()}"`}
               </Text>
            </View>
         );
      }

      return (
         <View style={styles.emptyState}>
            <Text selectable style={[styles.emptyTitle, { color: colors.text }]}>
               No collections yet
            </Text>
            <Text
               selectable
               style={[styles.emptyMessage, { color: colors.textMuted }]}
            >
               Tap compose to create your first collection.
            </Text>
         </View>
      );
   }, [
      colors.background,
      colors.primary,
      colors.text,
      colors.textMuted,
      error,
      isLoading,
      refresh,
      search,
   ]);

   return (
      <FlashList
         data={filteredCollections}
         keyExtractor={(item) => item.id}
         renderItem={renderCollection}
         refreshControl={
            <RefreshControl
               refreshing={isRefreshing}
               onRefresh={() => void refresh()}
               tintColor={colors.primary}
            />
         }
         onScroll={onFabScroll}
         scrollEventThrottle={16}
         scrollEnabled={true}
         bounces={true}
         alwaysBounceVertical={true}
         overScrollMode={"auto"}
         contentInsetAdjustmentBehavior="automatic"
         showsVerticalScrollIndicator={false}
         contentContainerStyle={listContentStyle}
         ListEmptyComponent={listEmpty}
         style={{ flex: 1, backgroundColor: colors.background }}
      />
   );
}

const styles = StyleSheet.create({
   emptyState: {
      paddingVertical: 48,
      paddingHorizontal: 24,
      alignItems: "center",
   },
   emptyTitle: {
      fontSize: 17,
      fontWeight: "600",
      marginBottom: 8,
      textAlign: "center",
   },
   emptyMessage: {
      fontSize: 15,
      lineHeight: 21,
      textAlign: "center",
   },
   retryButton: {
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 999,
   },
   retryLabel: {
      fontSize: 15,
      fontWeight: "600",
   },
});
