import { useTheme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  Alert,
  Button,
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
  // const { colors } = useTheme();
  const { colors } = useTheme();

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
            // router.replace('/sign-in');

          },
        },
      ]
    );
  };

  const handleNewCollection = useCallback(async (collectionName: string) => {

  }, []);

  const renderCollectionItem = ({ item }: { item: Collection }) => (
    <TouchableOpacity
      style={[styles.collectionItem, { borderColor: colors.border }]}
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
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
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
