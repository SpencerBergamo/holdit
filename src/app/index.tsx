import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type Collection = {
  id: number;
  name: string;
  created_at: string;
  is_public: boolean;
};

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const { user, isGuest, signOut } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleUpgradeAccount = () => {
    router.push('/upgrade-account');
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/sign-in');
          },
        },
      ]
    );
  };

  const handleNewCollection = useCallback(async (collectionName: string) => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to create a collection');
      return;
    }

    try {
      Alert.alert('Success', `Collection "${collectionName}" created successfully!`);
    } catch (error) {
      console.error('Unexpected error creating collection:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  }, [user]);

  const renderCollectionItem = ({ item }: { item: Collection }) => (
    <TouchableOpacity
      style={[styles.collectionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        // TODO: Navigate to collection detail
        console.log('Collection selected:', item.id);
      }}
    >
      <Text style={[styles.collectionName, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.collectionMeta, { color: colors.text + '80' }]}>
        {new Date(item.created_at).toLocaleDateString()} • {item.is_public ? 'Public' : 'Private'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Collections</Text>
        <Button
          accessibilityLabel='new-collection'
          title="+ New"
          onPress={() => {
            Alert.prompt(
              "New Collection",
              "Pick a name for your new collection to save your items to.",
              (value) => {
                if (value && value.trim()) {
                  handleNewCollection(value.trim());
                }
              }
            )
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <Text style={{ color: colors.text }}>Loading...</Text>
        </View>
      ) : collections.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={[styles.emptyText, { color: colors.text + '80' }]}>
            No collections yet. Create one to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={collections}
          renderItem={renderCollectionItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
  },
  collectionItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  collectionMeta: {
    fontSize: 14,
  },
});
