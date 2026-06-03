import FloatingActionButton, {
   type FabAction,
} from '@/components/common/FloatingActionButton';
import { FAB_SPRING, useFabScrollHide } from '@/hooks/use-fab-scroll-hide';
import { useFocusEffect, useSegments } from 'expo-router';
import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
   type ReactNode,
} from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { StyleSheet } from 'react-native';
import Animated, {
   useAnimatedStyle,
   useSharedValue,
   withSequence,
   withSpring,
} from 'react-native-reanimated';

export type FabRegistration = {
   actions: FabAction[];
};

type HomeFabContextValue = {
   onFabScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
   showFab: () => void;
   registerFab: (registration: FabRegistration | null) => void;
};

const HomeFabContext = createContext<HomeFabContextValue | undefined>(undefined);

const HIDDEN_SEGMENT_NAMES = new Set(['compose', '(camera)', '(profile)']);

function isFabRouteAllowed(segments: string[]) {
   if (!segments.includes('(home)')) {
      return false;
   }

   return !segments.some((segment) => HIDDEN_SEGMENT_NAMES.has(segment));
}

export function HomeFabProvider({ children }: { children: ReactNode }) {
   const segments = useSegments();
   const routeAllowed = isFabRouteAllowed(segments);
   const [registration, setRegistration] = useState<FabRegistration | null>(null);
   const { fabTranslateY, showFab, onFabScroll } = useFabScrollHide();
   const transitionScale = useSharedValue(1);

   const registerFab = useCallback((next: FabRegistration | null) => {
      setRegistration(next);
   }, []);

   const fabActions = registration?.actions ?? [];
   const actionKey = fabActions.map((action) => action.id).join(',');

   const visible =
      routeAllowed && fabActions.length > 0;

   useEffect(() => {
      if (!visible || !actionKey) {
         return;
      }

      transitionScale.value = withSequence(
         withSpring(0.9, FAB_SPRING),
         withSpring(1, FAB_SPRING),
      );
   }, [actionKey, transitionScale, visible]);

   const contextValue = useMemo(
      () => ({
         onFabScroll,
         showFab,
         registerFab,
      }),
      [onFabScroll, registerFab, showFab],
   );

   const fabAnimatedStyle = useAnimatedStyle(() => ({
      opacity: visible ? 1 : 0,
   }));

   return (
      <HomeFabContext.Provider value={contextValue}>
         {children}
         <Animated.View
            pointerEvents={visible ? 'box-none' : 'none'}
            style={[styles.fabHost, fabAnimatedStyle]}
         >
            <FloatingActionButton
               key={actionKey}
               actions={fabActions}
               scrollTranslateY={fabTranslateY}
               transitionScale={transitionScale}
               onMainPress={showFab}
            />
         </Animated.View>
      </HomeFabContext.Provider>
   );
}

const styles = StyleSheet.create({
   fabHost: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 10,
   },
});

export function useHomeFab() {
   const context = useContext(HomeFabContext);

   if (!context) {
      throw new Error('useHomeFab must be used within a HomeFabProvider');
   }

   return context;
}

/**
 * Registers FAB actions while this screen is focused. Clears on blur.
 * Call from any screen inside `(home)` that should show the FAB.
 */
export function useFabActions(actions: FabAction[]) {
   const { registerFab } = useHomeFab();

   useFocusEffect(
      useCallback(() => {
         registerFab({ actions });
         return () => registerFab(null);
      }, [actions, registerFab]),
   );
}
