import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function WelcomeScreen() {

  return (
    <>
      <Stack.Screen options={{
        headerShown: true,
        headerLargeTitle: true,
        title: 'Welcome',
      }} />
      <View>
        <Text>Welcome</Text>
      </View>
    </>
  )
}
