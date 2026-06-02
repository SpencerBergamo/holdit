import FloatingActionButton, {
   FabAction,
} from "@/components/common/FloatingActionButton";
import PlatformIcon, { AvailableIcons } from "@/components/PlatformIcon";
import WishlistCard from "@/components/WishlistCard";
import { useMyTheme } from "@/contexts/MyThemeContext";
import { useMyCollections } from "@/hooks/use-my-collections";
import { useSearch } from "@/hooks/use-search";
import type { CollectionWithSaveCount } from "@/types/collection";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { router } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import {
   ActivityIndicator,
   Pressable,
   RefreshControl,
   StyleSheet,
   Text,
   View,
} from "react-native";
import { useSharedValue, withSpring } from "react-native-reanimated";

/** FAB travel distance when fully hidden (px). */
const FAB_HIDE_OFFSET = 80;
/** Scroll delta (px) before we treat the gesture as down/up. */
const FAB_SCROLL_DIRECTION_THRESHOLD = 2;
/** At or above this offset, the FAB is shown again. */
const FAB_TOP_REVEAL_OFFSET = 4;
/** Within this distance of the list end, the FAB is shown again. */
const FAB_BOTTOM_REVEAL_OFFSET = 24;

const FAB_SPRING = {
   damping: 24,
   stiffness: 280,
   mass: 0.75,
   overshootClamping: true,
};

export default function HomeScreen() {
   const { colors, spacing } = useMyTheme();
   const {
      collections,
      isLoading,
      isRefreshing,
      error,
      refresh,
   } = useMyCollections();
   const fabTranslateY = useSharedValue(0);
   const lastScrollY = useRef(0);
   const isFabHidden = useRef(false);

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

   const hideFab = useCallback(() => {
      if (isFabHidden.current) {
         return;
      }
      isFabHidden.current = true;
      fabTranslateY.value = withSpring(FAB_HIDE_OFFSET, FAB_SPRING);
   }, [fabTranslateY]);

   const showFab = useCallback(() => {
      if (!isFabHidden.current) {
         return;
      }
      isFabHidden.current = false;
      fabTranslateY.value = withSpring(0, FAB_SPRING);
   }, [fabTranslateY]);

   const onFabScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
         const { contentOffset, contentSize, layoutMeasurement } =
            event.nativeEvent;
         const scrollY = Math.max(0, contentOffset.y);
         const viewportHeight = layoutMeasurement.height;
         const distanceFromBottom =
            contentSize.height - viewportHeight - scrollY;
         const isNearTop = scrollY <= FAB_TOP_REVEAL_OFFSET;
         const isNearBottom = distanceFromBottom <= FAB_BOTTOM_REVEAL_OFFSET;

         if (isNearTop || isNearBottom) {
            showFab();
            lastScrollY.current = scrollY;
            return;
         }

         const delta = scrollY - lastScrollY.current;

         if (delta > FAB_SCROLL_DIRECTION_THRESHOLD) {
            hideFab();
         }

         lastScrollY.current = scrollY;
      },
      [hideFab, showFab],
   );

   const fabActions = useMemo<FabAction[]>(
      () => [
         // {
         //    id: "profile",
         //    icon: <PlatformIcon name={AvailableIcons.profile} size={22} />,
         //    accessibilityLabel: "Profile",
         //    onPress: () => router.push("/(home)/(profile)"),
         // },
         // {
         //    id: "friends",
         //    icon: <PlatformIcon name={AvailableIcons.friends} size={22} />,
         //    accessibilityLabel: "Friends",
         //    onPress: () => { },
         // },
         {
            id: "compose",
            icon: <PlatformIcon name={AvailableIcons.compose} size={22} />,
            accessibilityLabel: "Compose",
            onPress: () => router.push("/(home)/compose"),
         },
         {
            id: "add-item",
            icon: <PlatformIcon name={AvailableIcons.camera} size={22} />,
            accessibilityLabel: "Add item",
            onPress: () => router.push("/(home)/(camera)"),
         },
      ],
      [],
   );

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
      <>
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

         <FloatingActionButton
            actions={fabActions}
            scrollTranslateY={fabTranslateY}
            onMainPress={showFab}
         />
      </>
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
