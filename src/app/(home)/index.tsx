import WishlistCard from "@/components/WishlistCard";
import { useMyTheme } from "@/contexts/MyThemeContext";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Wishlist = {
   id: string;
   name: string;
   itemCount: number;
};

const WISHLIST_DATA: Wishlist[] = [
   { id: "1", name: "Birthday ideas", itemCount: 12 },
   { id: "2", name: "Kitchen upgrades", itemCount: 5 },
   { id: "3", name: "Books to read", itemCount: 8 },
   // { id: "4", name: "Holiday gifts", itemCount: 14 },
   // { id: "5", name: "Running gear", itemCount: 3 },
];

export default function HomeScreen() {
   const { colors, spacing } = useMyTheme();
   const [search, setSearch] = useState("");

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

   const listContentStyle = useMemo(
      () => ({
         paddingHorizontal: horizontalPadding,
         paddingTop: spacing.s,
         paddingBottom: spacing.xl,
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
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
               No wishlists found
            </Text>
            <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
               {`Try a different search for "${search.trim()}"`}
            </Text>
         </View>
      );
   }, [colors.text, colors.textMuted, search]);

   return (
      <View
         style={{
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
         }}
      >
         <FlashList
            data={filteredWishlists}
            keyExtractor={(item) => item.id}
            renderItem={renderWishlist}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
               listContentStyle,
               { justifyContent: "center", flexGrow: 0, width: "100%" }
            ]}
            ListEmptyComponent={listEmpty}
            style={{
               backgroundColor: colors.background,
               flex: 0,
               alignSelf: "stretch",
               width: "100%",
            }}
            ListFooterComponent={() => (
               <View></View>
            )}
         />
      </View>
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
