import PlatformIcon from "@/components/PlatformIcon";
import { useTheme } from "@/constants/theme";
import { Product } from "@/types/convex-types";
import { ContextMenu, Host, Button as SwiftButton } from "@expo/ui/swift-ui";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { usePaginatedQuery } from "convex/react";
import { Link, router, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { api } from "../../../../convex/_generated/api";

export default function HomeScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useTheme();

  const columnWidth = (screenWidth - 64) / 3; // 16px padding on each side + gaps between 3 columns
  const [searchQuery, setSearchQuery] = useState('');
  const measured = useRef<Set<string>>(new Set());
  const [heights, setHeights] = useState<Record<string, number>>({});

  const { results, isLoading, status, loadMore } = usePaginatedQuery(
    api.products.getUserProducts,
    {},
    {
      initialNumItems: 10,
    }
  );

  useEffect(() => {
    results.forEach((item) => {
      if (measured.current.has(item._id.toString())) return;

      measured.current.add(item._id.toString());

      // If no imageUrl, use square placeholder
      if (!item.imageUrl) {
        setHeights(prev => ({ ...prev, [item._id.toString()]: columnWidth }));
        return;
      }

      Image.getSize(item.imageUrl,
        (imgWidth, imgHeight) => {
          const aspectRatio = imgHeight / imgWidth;
          const scaledHeight = columnWidth * aspectRatio;

          setHeights(prev => ({ ...prev, [item._id.toString()]: scaledHeight }));
        },
        () => {
          // failed loads callback
          setHeights(prev => ({ ...prev, [item._id.toString()]: columnWidth }));
        });
    });
  }, [results, columnWidth]);

  const renderProduct: ListRenderItem<Product> = useCallback(({ item }) => {
    const height = heights[item._id.toString()] || columnWidth;

    return (
      <Link href={`/home/${item._id}`} asChild prefetch>
        <Pressable style={{ width: columnWidth, height }} >
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
              borderRadius={8}
            />
          ) : (
            <View style={[
              styles.placeholder,
              {
                width: '100%',
                height: '100%',
                backgroundColor: colors.border,
                gap: 8
              }
            ]}>
              <SymbolView name="photo" size={32} tintColor={colors.text} />
              <Text style={[styles.placeholderText, { color: colors.text }]} numberOfLines={3}>
                {item.name}
              </Text>
            </View>
          )}
        </Pressable>
      </Link>
    )
  }, [columnWidth, heights, colors]);

  return (
    <>
      <Stack.Screen options={{
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 12 }}>

            {/* Filter Button */}
            <Host>
              <ContextMenu>
                <ContextMenu.Items>
                  <SwiftButton systemImage="arrow.up.arrow.down">
                    Alphabetical
                  </SwiftButton>
                  <SwiftButton systemImage="clock">
                    Recntly Added
                  </SwiftButton>
                  <SwiftButton systemImage="dollarsign">
                    Price
                  </SwiftButton>
                </ContextMenu.Items>
                <ContextMenu.Trigger>
                  <PlatformIcon name="filter" />
                </ContextMenu.Trigger>
              </ContextMenu>
            </Host>

            <Host>
              <ContextMenu>
                <ContextMenu.Items>
                  <SwiftButton systemImage="list.bullet" onPress={() => router.push('/home/new-list')} >
                    New List
                  </SwiftButton>
                  <SwiftButton systemImage="square.and.pencil" onPress={() => router.push('/home/new-product')} >
                    New Product
                  </SwiftButton>
                </ContextMenu.Items>
                <ContextMenu.Trigger>
                  <PlatformIcon name="plus" />
                </ContextMenu.Trigger>
              </ContextMenu>
            </Host>
          </View>
        )
      }} />
      <FlashList
        data={results}
        keyExtractor={(item) => item._id.toString()}
        masonry
        numColumns={3}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 16 }}
        onEndReachedThreshold={0.5}
        onEndReached={() => loadMore(9)}
        ListHeaderComponent={() => (
          <></>
        )}
        ListEmptyComponent={() => (
          <></>
        )}
        renderItem={renderProduct}
        extraData={heights}
        // renderItem={({ item }) => (
        //   <Link href={`/home/${item.id}` as any} asChild key={item.id}>
        //     <Pressable>
        //       <CollectionCard
        //         name={item.name}
        //         description={item.description}
        //         isPublic={item.isPublic}
        //         parentStyles={{ marginBottom: 2 }}
        //       />
        //     </Pressable>
        //   </Link>
        // )}
        ListFooterComponent={() => (
          <></>
        )}
      />
    </>
  )

  // return (
  //   <ScrollView
  //     contentInsetAdjustmentBehavior="automatic"
  //     showsVerticalScrollIndicator={false}
  //     style={{ flex: 1, backgroundColor: colors.bg }}
  //     contentContainerStyle={{ paddingHorizontal: 16 }}
  //   >
  //     {filteredCollections.map((collection) => (
  //       <Link href={`/home/${collection.id}` as any} asChild key={collection.id}>
  //         <Pressable>
  //           <CollectionCard
  //             name={collection.name}
  //             description={collection.description}
  //             isPublic={collection.isPublic}
  //             parentStyles={{ marginBottom: 2 }}
  //           />
  //         </Pressable>
  //       </Link>
  //     ))}
  //   </ScrollView>
  // );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 4,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  headerButtonText: {
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 28,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profileIcon: {
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  newCollectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 24,
    gap: 8,
  },
  newCollectionIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  newCollectionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  collectionCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  collectionContent: {
    padding: 16,
    gap: 8,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  collectionName: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  privateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  privateBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  collectionDescription: {
    fontSize: 15,
    lineHeight: 20,
  },
  collectionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  placeholder: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
