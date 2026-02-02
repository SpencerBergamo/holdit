import CollectionCard from "@/components/CollectionCard";
import { FlashList } from "@shopify/flash-list";
import { usePaginatedQuery } from "convex/react";
import { Link } from "expo-router";
import { Pressable } from "react-native";
import { api } from "../../../convex/_generated/api";

export function Collections() {
  const { results, isLoading, status, loadMore } = usePaginatedQuery(api.collections.getUserCollections, {}, { initialNumItems: 15 });

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
  )
}