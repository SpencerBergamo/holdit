import PlatformIcon, { AvailableIcons } from '@/components/PlatformIcon';
import type { FabAction } from '@/components/common/FloatingActionButton';
import { router } from 'expo-router';
import { useMemo } from 'react';

/** FAB actions for the home wishlist screen. */
export function useHomeFabActions(): FabAction[] {
   return useMemo(
      () => [
         {
            id: 'profile',
            icon: <PlatformIcon name={AvailableIcons.profile} size={22} />,
            accessibilityLabel: 'Profile',
            onPress: () => router.push('/(home)/(profile)'),
         },
         {
            id: 'friends',
            icon: <PlatformIcon name={AvailableIcons.friends} size={22} />,
            accessibilityLabel: 'Friends',
            onPress: () => {},
         },
         {
            id: 'compose',
            icon: <PlatformIcon name={AvailableIcons.compose} size={22} />,
            accessibilityLabel: 'Compose',
            onPress: () => router.push('/(home)/compose'),
         },
         {
            id: 'camera',
            icon: <PlatformIcon name={AvailableIcons.camera} size={22} />,
            accessibilityLabel: 'Add item',
            onPress: () => router.push('/(home)/(camera)'),
         },
      ],
      [],
   );
}
