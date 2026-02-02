import CollectionCard from "@/components/CollectionCard";
import { testCollections } from "@/constants/test-data";
import { useTheme } from "@/constants/theme";
import { Link, useNavigation, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";

export default function HomeScreen() {
  const { colors, shadow } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCollections = testCollections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <FlatList
      data={filteredCollections}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingHorizontal: 16 }}
      renderItem={({ item }) => (
        <Link href={`/home/${item.id}` as any} asChild key={item.id}>
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
    />
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
});
