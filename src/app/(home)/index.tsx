import FloatingActionButton, {
   FabAction,
} from "@/components/common/FloatingActionButton";
import PlatformIcon, { AvailableIcons } from "@/components/PlatformIcon";
import WishlistCard from "@/components/WishlistCard";
import { useMyTheme } from "@/contexts/MyThemeContext";
import { useSearch } from "@/hooks/use-search";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { router } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { StyleSheet, Text, View } from "react-native";
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

type Wishlist = {
   id: string;
   private: boolean;
   name: string;
   itemCount: number;
};

const WISHLIST_DATA: Wishlist[] = [
   { id: "1", private: true, name: "Birthday ideas", itemCount: 12 },
   { id: "2", private: false, name: "Kitchen upgrades", itemCount: 5 },
   { id: "3", private: true, name: "Books to read", itemCount: 8 },
   { id: "4", private: false, name: "Holiday gifts", itemCount: 14 },
   { id: "5", private: false, name: "Running gear", itemCount: 3 },
   { id: "6", private: true, name: "Desk setup", itemCount: 7 },
   { id: "7", private: false, name: "Camping essentials", itemCount: 9 },
   { id: "8", private: true, name: "Gift ideas for Mom", itemCount: 11 },
   { id: "9", private: false, name: "Holiday gifts", itemCount: 14 },
   { id: "10", private: false, name: "Running gear", itemCount: 3 },
   { id: "11", private: true, name: "Desk setup", itemCount: 7 },
   { id: "12", private: false, name: "Camping essentials", itemCount: 9 },
   { id: "13", private: true, name: "Gift ideas for Mom", itemCount: 11 },
   { id: "14", private: false, name: "Holiday gifts", itemCount: 14 },
   { id: "15", private: false, name: "Running gear", itemCount: 3 },
];

export default function HomeScreen() {
   const { colors, spacing } = useMyTheme();
   const fabTranslateY = useSharedValue(0);
   const lastScrollY = useRef(0);
   const isFabHidden = useRef(false);

   const search = useSearch({
      placeholder: "Search wishlists",
      hideWhenScrolling: false,
      placement: "stacked",
   });

   const horizontalPadding = spacing.m;

   const filteredWishlists = useMemo(() => {
      const query = search.trim().toLowerCase();
      if (!query) {
         return WISHLIST_DATA;
      }
      return WISHLIST_DATA.filter((item) =>
         item.name.toLowerCase().includes(query),
      );
   }, [search]);

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
         {
            id: "profile",
            icon: <PlatformIcon name={AvailableIcons.profile} size={22} />,
            accessibilityLabel: "Profile",
            onPress: () => router.push("/(home)/(profile)"),
         },
         {
            id: "friends",
            icon: <PlatformIcon name={AvailableIcons.friends} size={22} />,
            accessibilityLabel: "Friends",
            onPress: () => { },
         },
         {
            id: "compose",
            icon: <PlatformIcon name={AvailableIcons.compose} size={22} />,
            accessibilityLabel: "Compose",
            onPress: () => { },
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

   const renderWishlist: ListRenderItem<Wishlist> = useCallback(
      ({ item }) => (
         <WishlistCard
            name={item.name}
            itemCount={item.itemCount}
            containerStyle={{ marginBottom: spacing.s }}
         />
      ),
      [spacing.s],
   );

   const listEmpty = useMemo(() => {
      if (!search.trim()) {
         return null;
      }
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
   }, [colors.text, colors.textMuted, search]);

   return (
      <>
         <FlashList
            data={filteredWishlists}
            keyExtractor={(item) => item.id}
            renderItem={renderWishlist}
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
});
