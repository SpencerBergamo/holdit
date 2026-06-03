import FloatingActionButton, {
   type FabAction,
} from '@/components/common/FloatingActionButton';
import PlatformIcon, { AvailableIcons } from '@/components/PlatformIcon';
import { FAB_SPRING, useFabScrollHide } from '@/hooks/use-fab-scroll-hide';
import { router, useSegments } from 'expo-router';
import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   type ReactNode,
} from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import Animated, {
   useAnimatedStyle,
   useSharedValue,
   withSequence,
   withSpring,
} from 'react-native-reanimated';

type HomeFabContextValue = {
   onFabScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
   showFab: () => void;
};

const HomeFabContext = createContext<HomeFabContextValue | undefined>(undefined);

const HIDDEN_SEGMENT_NAMES = new Set(['compose', '(camera)', '(profile)']);

/** Top-level `(home)` routes — not a collection id segment. */
const HOME_LEVEL_STATIC_ROUTES = new Set([
   'index',
   'compose',
   '(camera)',
   '(profile)',
]);

/** Any screen under `(home)/[collection-id]/…` (index, settings, etc.). */
function isInsideCollectionStack(segments: string[]) {
   const homeIndex = segments.indexOf('(home)');
   if (homeIndex === -1) {
      return false;
   }

   const collectionSegment = segments[homeIndex + 1];
   if (!collectionSegment) {
      return false;
   }

   return (
      !HOME_LEVEL_STATIC_ROUTES.has(collectionSegment) &&
      !HIDDEN_SEGMENT_NAMES.has(collectionSegment)
   );
}

function isHomeIndexRoute(segments: string[]) {
   const last = segments[segments.length - 1];
   return last === '(home)' || (last === 'index' && !isInsideCollectionStack(segments));
}

function useHomeFabVisible(segments: string[]) {
   if (!segments.includes('(home)')) {
      return false;
   }

   if (segments.some((segment) => HIDDEN_SEGMENT_NAMES.has(segment))) {
      return false;
   }

   return isHomeIndexRoute(segments) || isInsideCollectionStack(segments);
}

export function HomeFabProvider({ children }: { children: ReactNode }) {
   const segments = useSegments();
   const visible = useHomeFabVisible(segments);
   const onCollectionScreen = isInsideCollectionStack(segments);
   const { fabTranslateY, showFab, onFabScroll } = useFabScrollHide();
   const transitionScale = useSharedValue(1);

   useEffect(() => {
      if (!onCollectionScreen) {
         return;
      }
      transitionScale.value = withSequence(
         withSpring(0.9, FAB_SPRING),
         withSpring(1, FAB_SPRING),
      );
   }, [onCollectionScreen, transitionScale]);

   const fabActions = useMemo<FabAction[]>(
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
            id: 'add-item',
            icon: <PlatformIcon name={AvailableIcons.camera} size={22} />,
            accessibilityLabel: 'Add item',
            onPress: () => router.push('/(home)/(camera)'),
         },
      ],
      [],
   );

   const contextValue = useMemo(
      () => ({
         onFabScroll,
         showFab,
      }),
      [onFabScroll, showFab],
   );

   const fabAnimatedStyle = useAnimatedStyle(() => ({
      opacity: visible ? 1 : 0,
      transform: [{ scale: transitionScale.value }],
   }));

   return (
      <HomeFabContext.Provider value={contextValue}>
         {children}
         <Animated.View
            pointerEvents={visible ? 'box-none' : 'none'}
            style={[fabAnimatedStyle, { zIndex: 10 }]}
         >
            <FloatingActionButton
               actions={fabActions}
               scrollTranslateY={fabTranslateY}
               onMainPress={showFab}
            />
         </Animated.View>
      </HomeFabContext.Provider>
   );
}

export function useHomeFab() {
   const context = useContext(HomeFabContext);

   if (!context) {
      throw new Error('useHomeFab must be used within a HomeFabProvider');
   }

   return context;
}
