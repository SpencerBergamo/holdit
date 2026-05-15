import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs minimizeBehavior='onScrollDown'>
      <NativeTabs.Trigger name="home">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="collections">
        <Icon sf="list.bullet" />
        <Label>Lists</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon sf="person.circle" />
        <Label>Account</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="camera" role="search">
        <Icon sf="camera" />
        <Label>Camera</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
