import PlatformIcon, { AvailableIcons } from '@/components/PlatformIcon';
import type { FabAction } from '@/components/common/FloatingActionButton';
import { router } from 'expo-router';
import { useMemo } from 'react';

/** FAB actions for the collection saves grid. */
export function useCollectionFabActions(): FabAction[] {
   return useMemo(
      () => [
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
