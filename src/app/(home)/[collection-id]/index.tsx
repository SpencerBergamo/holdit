import ProductCard from '@/components/saves/product-card';
import PlatformIcon, { AvailableIcons } from '@/components/PlatformIcon';
import { useFabActions, useHomeFab } from '@/contexts/HomeFabContext';
import { useMyTheme } from '@/contexts/MyThemeContext';
import { useCollectionFabActions } from '@/hooks/use-collection-fab-actions';
import { useCollection } from '@/hooks/use-collection';
import { useCollectionSaves } from '@/hooks/use-collection-saves';
import type { Save } from '@/types/save';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
   ActivityIndicator,
   Pressable,
   RefreshControl,
   StyleSheet,
   Text,
   TouchableOpacity,
   useWindowDimensions,
   View,
} from 'react-native';

const GRID_COLUMNS = 3;
const GRID_GAP = 10;

export default function CollectionScreen() {
   const { colors, spacing } = useMyTheme();
   const { onFabScroll } = useHomeFab();
   const fabActions = useCollectionFabActions();
   useFabActions(fabActions);
   const { width: windowWidth } = useWindowDimensions();
   const params = useLocalSearchParams<{ 'collection-id': string }>();
   const collectionId = params['collection-id'];

   const {
      collection,
      isLoading: isCollectionLoading,
      error: collectionError,
   } = useCollection(collectionId);
   const {
      saves,
      isLoading: isSavesLoading,
      isRefreshing,
      error: savesError,
      refresh,
   } = useCollectionSaves(collectionId);

   const horizontalPadding = spacing.m;
   const columnWidth = useMemo(() => {
      const contentWidth = windowWidth - horizontalPadding * 2;
      return Math.floor(contentWidth / GRID_COLUMNS - GRID_GAP);
   }, [horizontalPadding, windowWidth]);

   const isLoading = isCollectionLoading || isSavesLoading;
   const error = collectionError ?? savesError;

   const listContentStyle = useMemo(
      () => ({
         paddingHorizontal: horizontalPadding,
         paddingTop: spacing.s,
         paddingBottom: spacing.xl * 3,
      }),
      [horizontalPadding, spacing.s, spacing.xl],
   );

   const renderSave: ListRenderItem<Save> = useCallback(
      ({ item }) => (
         <View style={styles.gridCell}>
            <ProductCard
               snapshot={item.product_snapshot}
               width={columnWidth}
               onPress={() => {
                  // ProductDetailScreen — later
               }}
            />
         </View>
      ),
      [columnWidth],
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
                  Couldn&apos;t load this collection
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

      return (
         <View style={styles.emptyState}>
            <Text selectable style={[styles.emptyTitle, { color: colors.text }]}>
               No items yet
            </Text>
            <Text
               selectable
               style={[styles.emptyMessage, { color: colors.textMuted }]}
            >
               Add a product with the camera button below.
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
   ]);

   return (
      <>
         <Stack.Screen
            options={{
               title: collection?.name ?? 'Collection',
               headerLargeTitle: true,
               headerLargeTitleShadowVisible: false,
               headerShadowVisible: false,
               headerTransparent: true,
               headerBackButtonDisplayMode: "minimal",
               headerLeft: () => (
                  <TouchableOpacity onPress={() => router.back()}>
                     <PlatformIcon name={AvailableIcons.back} size={24} />
                  </TouchableOpacity>
               )
            }}
         />

         <FlashList
            data={saves}
            keyExtractor={(item) => item.id}
            renderItem={renderSave}
            numColumns={GRID_COLUMNS}
            refreshControl={
               <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => void refresh()}
                  tintColor={colors.primary}
               />
            }
            onScroll={onFabScroll}
            scrollEventThrottle={16}
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={listContentStyle}
            ListEmptyComponent={listEmpty}
            style={{ flex: 1, backgroundColor: colors.background }}
         />
      </>
   );
}

const styles = StyleSheet.create({
   gridCell: {
      flex: 1,
      padding: GRID_GAP / 2,
   },
   emptyState: {
      paddingVertical: 48,
      paddingHorizontal: 24,
      alignItems: 'center',
   },
   emptyTitle: {
      fontSize: 17,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
   },
   emptyMessage: {
      fontSize: 15,
      lineHeight: 21,
      textAlign: 'center',
   },
   retryButton: {
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 999,
   },
   retryLabel: {
      fontSize: 15,
      fontWeight: '600',
   },
});
