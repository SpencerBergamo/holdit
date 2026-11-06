import { createSaveWithPhotoCapture } from "@/lib/save-from-capture";
import { useMyTheme } from "@/contexts/MyThemeContext";
import { useMyCollections } from "@/hooks/use-my-collections";
import type { CollectionWithSaveCount } from "@/types/collection";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
   ActivityIndicator,
   Alert,
   Pressable,
   RefreshControl,
   StyleSheet,
   Text,
   View,
} from "react-native";

export default function ChooseCollectionForCaptureScreen() {
   const { colors, spacing } = useMyTheme();
   const params = useLocalSearchParams<{ photoUri?: string }>();
   const photoUri = params.photoUri;

   const [savingCollectionId, setSavingCollectionId] = useState<string | null>(
      null,
   );

   const {
      collections,
      isLoading,
      isRefreshing,
      error,
      refresh,
   } = useMyCollections();

   useFocusEffect(
      useCallback(() => {
         if (!photoUri?.trim()) {
            router.back();
         }
      }, [photoUri]),
   );

   const handlePick = useCallback(
      async (collection: CollectionWithSaveCount) => {
         if (!photoUri?.trim() || savingCollectionId) {
            return;
         }

         setSavingCollectionId(collection.id);
         try {
            await createSaveWithPhotoCapture({
               localUri: photoUri,
               collectionId: collection.id,
            });
            void Haptics.notificationAsync(
               Haptics.NotificationFeedbackType.Success,
            );
            router.dismissAll();
         } catch (e) {
            const message =
               e instanceof Error ? e.message : "Could not save to that list.";
            Alert.alert("Unable to save", message);
         } finally {
            setSavingCollectionId(null);
         }
      },
      [photoUri, savingCollectionId],
   );

   const listContentStyle = useMemo(
      () => ({
         paddingHorizontal: spacing.m,
         paddingTop: spacing.s,
         paddingBottom: spacing.xl,
      }),
      [spacing.m, spacing.s, spacing.xl],
   );

   const renderCollection: ListRenderItem<CollectionWithSaveCount> = useCallback(
      ({ item }) => {
         const busy = savingCollectionId === item.id;
         return (
            <Pressable
               accessibilityRole="button"
               accessibilityLabel={`Save to ${item.name}`}
               disabled={busy || savingCollectionId !== null}
               onPress={() => void handlePick(item)}
               style={({ pressed }) => [
                  styles.row,
                  {
                     borderColor: colors.inputBorder,
                     backgroundColor: colors.inputBackground,
                     opacity: pressed || busy ? 0.85 : 1,
                  },
               ]}
            >
               <View style={{ flex: 1 }}>
                  <Text
                     style={[styles.rowTitle, { color: colors.text }]}
                     numberOfLines={2}
                  >
                     {item.name}
                  </Text>
                  {item.description ? (
                     <Text
                        style={[styles.rowMeta, { color: colors.textMuted }]}
                        numberOfLines={2}
                     >
                        {item.description}
                     </Text>
                  ) : null}
                  <Text style={[styles.rowMeta, { color: colors.textMuted }]}>
                     {item.save_count}{" "}
                     {item.save_count === 1 ? "item" : "items"}
                  </Text>
               </View>
               {busy ? (
                  <ActivityIndicator color={colors.primary} />
               ) : null}
            </Pressable>
         );
      },
      [
         colors.inputBackground,
         colors.inputBorder,
         colors.primary,
         colors.text,
         colors.textMuted,
         handlePick,
         savingCollectionId,
      ],
   );

   const listEmpty = useMemo(() => {
      if (isLoading) {
         return (
            <View style={styles.empty}>
               <ActivityIndicator size="large" color={colors.primary} />
            </View>
         );
      }
      if (error) {
         return (
            <View style={styles.empty}>
               <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Couldn&apos;t load wishlists
               </Text>
               <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                  {error}
               </Text>
               <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Try again"
                  onPress={() => void refresh()}
                  style={[styles.retry, { backgroundColor: colors.primary }]}
               >
                  <Text style={[styles.retryLabel, { color: colors.background }]}>
                     Try again
                  </Text>
               </Pressable>
            </View>
         );
      }
      return (
         <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
               No collections yet
            </Text>
            <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
               Create a wishlist first, then you can drop this photo in.
            </Text>
            <Pressable
               accessibilityRole="button"
               accessibilityLabel="Create collection"
               onPress={() => router.push("/(home)/new-collection")}
               style={[styles.retry, { backgroundColor: colors.primary }]}
            >
               <Text style={[styles.retryLabel, { color: colors.background }]}>
                  New collection
               </Text>
            </Pressable>
         </View>
      );
   }, [colors, error, isLoading, refresh]);

   if (!photoUri?.trim()) {
      return null;
   }

   return (
      <>
         <Stack.Screen
            options={{
               headerTitle: "Choose wishlist",
               headerBackButtonDisplayMode: "minimal",
            }}
         />
         <FlashList
            data={collections}
            keyExtractor={(item) => item.id}
            renderItem={renderCollection}
            refreshControl={
               <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => void refresh()}
                  tintColor={colors.primary}
               />
            }
            contentContainerStyle={listContentStyle}
            ListEmptyComponent={listEmpty}
            style={{ flex: 1, backgroundColor: colors.background }}
         />
      </>
   );
}

const styles = StyleSheet.create({
   row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 10,
   },
   rowTitle: {
      fontSize: 17,
      fontWeight: "600",
   },
   rowMeta: {
      fontSize: 14,
      marginTop: 4,
      lineHeight: 20,
   },
   empty: {
      paddingVertical: 48,
      paddingHorizontal: 24,
      alignItems: "center",
   },
   emptyTitle: {
      fontSize: 17,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 8,
   },
   emptyBody: {
      fontSize: 15,
      lineHeight: 21,
      textAlign: "center",
      marginBottom: 20,
   },
   retry: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 999,
   },
   retryLabel: {
      fontSize: 15,
      fontWeight: "600",
   },
});
