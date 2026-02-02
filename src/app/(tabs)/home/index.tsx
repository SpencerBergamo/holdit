import CollectionCard from "@/components/CollectionCard";
import { useTheme } from "@/constants/theme";
import { useNavigation, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

type Collection = {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  itemCount?: number;
};

export default function HomeScreen() {
  const { colors, shadow } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const testCollections: Collection[] = [
    { id: '1', name: 'Wishlist', description: 'Things I want to buy', isPublic: true, itemCount: 12 },
    { id: '2', name: 'Birthday', description: 'Gift ideas for my birthday', isPublic: true, itemCount: 8 },
    { id: '3', name: 'Kitchen', description: 'All the products I need for my kitchen', isPublic: true, itemCount: 15 },
    { id: '4', name: 'Bathroom', description: 'All the products I need for my bathroom', isPublic: false, itemCount: 6 },
    { id: '5', name: 'Living Room', description: 'All the products I need for my living room', isPublic: true, itemCount: 20 },
    { id: '6', name: 'Bedroom', description: 'All the products I need for my bedroom', isPublic: false, itemCount: 10 },
    { id: '7', name: 'Wishlist', description: 'Things I want to buy', isPublic: true, itemCount: 12 },
    { id: '8', name: 'Birthday', description: 'Gift ideas for my birthday', isPublic: true, itemCount: 8 },
    { id: '9', name: 'Kitchen', description: 'All the products I need for my kitchen', isPublic: true, itemCount: 15 },
    { id: '10', name: 'Bathroom', description: 'All the products I need for my bathroom', isPublic: false, itemCount: 6 },
    { id: '11', name: 'Living Room', description: 'All the products I need for my living room', isPublic: true, itemCount: 20 },
    { id: '12', name: 'Bedroom', description: 'All the products I need for my bedroom', isPublic: false, itemCount: 10 },
    { id: '13', name: 'Wishlist', description: 'Things I want to buy', isPublic: true, itemCount: 12 },
    { id: '14', name: 'Birthday', description: 'Gift ideas for my birthday', isPublic: true, itemCount: 8 },
    { id: '15', name: 'Kitchen', description: 'All the products I need for my kitchen', isPublic: true, itemCount: 15 },
    { id: '16', name: 'Bathroom', description: 'All the products I need for my bathroom', isPublic: false, itemCount: 6 },
    { id: '17', name: 'Living Room', description: 'All the products I need for my living room', isPublic: true, itemCount: 20 },
    { id: '18', name: 'Bedroom', description: 'All the products I need for my bedroom', isPublic: false, itemCount: 10 },
  ];

  const filteredCollections = testCollections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {filteredCollections.map((collection) => (
        <CollectionCard
          key={collection.id}
          name={collection.name}
          description={collection.description}
          isPublic={collection.isPublic}
          parentStyles={{ marginBottom: 2 }}
        />
      ))}
    </ScrollView>
  );

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
