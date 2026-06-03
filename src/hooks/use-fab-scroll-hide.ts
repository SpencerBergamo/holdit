import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useCallback, useRef } from 'react';
import { useSharedValue, withSpring } from 'react-native-reanimated';

/** FAB travel distance when fully hidden (px). */
export const FAB_HIDE_OFFSET = 80;
/** Scroll delta (px) before we treat the gesture as down/up. */
export const FAB_SCROLL_DIRECTION_THRESHOLD = 2;
/** At or above this offset, the FAB is shown again. */
export const FAB_TOP_REVEAL_OFFSET = 4;
/** Within this distance of the list end, the FAB is shown again. */
export const FAB_BOTTOM_REVEAL_OFFSET = 24;

export const FAB_SPRING = {
  damping: 24,
  stiffness: 280,
  mass: 0.75,
  overshootClamping: true,
} as const;

export function useFabScrollHide() {
  const fabTranslateY = useSharedValue(0);
  const lastScrollY = useRef(0);
  const isFabHidden = useRef(false);

  const hideFab = useCallback(() => {
    if (isFabHidden.current) {
      return;
    }
    isFabHidden.current = true;
    fabTranslateY.value = withSpring(FAB_HIDE_OFFSET, FAB_SPRING);
  }, [fabTranslateY]);

  const showFab = useCallback(() => {
    if (!isFabHidden.current) {
      return;
    }
    isFabHidden.current = false;
    fabTranslateY.value = withSpring(0, FAB_SPRING);
  }, [fabTranslateY]);

  const onFabScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const scrollY = Math.max(0, contentOffset.y);
      const viewportHeight = layoutMeasurement.height;
      const distanceFromBottom =
        contentSize.height - viewportHeight - scrollY;
      const isNearTop = scrollY <= FAB_TOP_REVEAL_OFFSET;
      const isNearBottom = distanceFromBottom <= FAB_BOTTOM_REVEAL_OFFSET;

      if (isNearTop || isNearBottom) {
        showFab();
        lastScrollY.current = scrollY;
        return;
      }

      const delta = scrollY - lastScrollY.current;

      if (delta > FAB_SCROLL_DIRECTION_THRESHOLD) {
        hideFab();
      }

      lastScrollY.current = scrollY;
    },
    [hideFab, showFab],
  );

  return {
    fabTranslateY,
    hideFab,
    showFab,
    onFabScroll,
  };
}
