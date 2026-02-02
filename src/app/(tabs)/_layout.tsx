import { useTheme } from '@/constants/theme';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <NativeTabs
      minimizeBehavior='onScrollDown'
    >
      <NativeTabs.Trigger name="home"  >
        <Label>Home</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="collections" >
        <Label>Lists</Label>
        <Icon sf="list.bullet" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile"  >
        <Icon sf="person.circle" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="camera" role="search">
        <Icon sf="camera" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}