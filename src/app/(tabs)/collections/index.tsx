import CollectionCard from "@/components/CollectionCard";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import { Pressable } from "react-native";

export default function CollectionsScreen() {
  // TODO: Replace with actual data fetching
  const results: { _id: string; name: string; description?: string; isPublic: boolean }[] = [];
  const isLoading = false;
  const loadMore = (_n: number) => {};

  return (
    <FlashList
      data={results}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingHorizontal: 16 }}
      onEndReachedThreshold={0.5}
      onEndReached={() => loadMore(15)}
      ListHeaderComponent={() => (
        <></>
      )}
      ListEmptyComponent={() => (
        <></>
      )}
      renderItem={({ item, index }) => (
        <Link href={`/collections/${item._id}`} asChild prefetch>
          <Pressable>
            <CollectionCard
              name={item.name}
              description={item.description}
              isPublic={item.isPublic}
              parentStyles={{ marginBottom: 2 }}
            />
          </Pressable>
        </Link>
      )}
      ListFooterComponent={() => (
        <></>
      )}
    />
  );
}
