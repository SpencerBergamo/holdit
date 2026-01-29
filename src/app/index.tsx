import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {
  Alert,
  StyleSheet,
  View
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const { user, isGuest, signOut } = useAuth();

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>

    </View>
  );
}

const styles = StyleSheet.create({
});
