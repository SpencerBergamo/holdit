import { Stack } from 'expo-router';
import { ScrollView } from 'react-native';

export default function SearchIndex() {
  return (
    <>
      <Stack.Screen options={{
        title: 'Search',
        headerSearchBarOptions: {
          placeholder: 'Search',
          autoFocus: true,
        },
      }} />
      <ScrollView>{/* Screen content */}</ScrollView>
    </>
  );
}
