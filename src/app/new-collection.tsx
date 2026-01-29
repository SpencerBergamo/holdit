import { useTheme } from "@react-navigation/native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function NewCollectionScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();





    async function handleCreateCollection() {


    }



    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>

            <Text>New Collection</Text>

        </View>
    )
}