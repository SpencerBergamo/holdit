import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user, isGuest, signOut } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          isLargeScreen && styles.scrollContentLarge,
        ]}
      >
        <View style={[
          styles.content,
          isLargeScreen && styles.contentLarge,
        ]}>
        <Text style={styles.title}>Welcome to HoldIt</Text>
        
        {isGuest ? (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>You&apos;re using guest mode</Text>
            <Text style={styles.statusSubtext}>
              Sign in to unlock all features and sync your data
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgradeAccount}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Full Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Signed in as:</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Features:</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>• Camera access {isGuest && '(Limited)'}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>• Data sync {isGuest && '(Not available)'}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>• Cloud storage {isGuest && '(Not available)'}</Text>
          </View>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: Platform.OS === 'web' ? 32 : 24,
    paddingBottom: Platform.OS === 'web' ? 64 : 48,
    paddingTop: Platform.OS === 'web' ? 32 : 24,
  },
  scrollContentLarge: {
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 600,
  },
  contentLarge: {
    maxWidth: 800,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 32 : 28,
    fontWeight: 'bold',
    marginBottom: 24,
    ...Platform.select({
      web: {
        userSelect: 'none',
      },
    }),
  },
  statusContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  statusText: {
    fontSize: Platform.OS === 'web' ? 17 : 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'opacity 0.2s',
      },
    }),
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff3b30',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'opacity 0.2s',
      },
    }),
  },
  signOutButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 22 : 20,
    fontWeight: '600',
    marginBottom: 16,
    ...Platform.select({
      web: {
        userSelect: 'none',
      },
    }),
  },
  featureItem: {
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
  },
});
