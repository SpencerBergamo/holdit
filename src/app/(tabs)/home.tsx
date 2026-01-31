import Button from '@/components/common/Button';
import { useTheme } from '@/constants/theme';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Collection = {
    id: number;
    name: string;
    created_at: string;
    is_public: boolean;
};

export default function HomeScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { signOut } = useAuth();



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
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                <Button variant="primary" onPress={() => console.log('Test Button')}> Test Button
                </Button>
            </SafeAreaView>






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
