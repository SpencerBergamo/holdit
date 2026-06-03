import PlatformIcon, { AvailableIcons } from "@/components/PlatformIcon";
import { useMyTheme } from "@/contexts/MyThemeContext";
import * as Haptics from "expo-haptics";
import { ReactNode, useCallback, useMemo, useState } from "react";
import {
   Pressable,
   StyleProp,
   StyleSheet,
   View,
   ViewStyle,
} from "react-native";
import Animated, {
   Easing,
   runOnJS,
   SharedValue,
   useAnimatedReaction,
   useAnimatedStyle,
   useSharedValue,
   withSpring,
   withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MAIN_SIZE = 56;
const ACTION_SIZE = 48;
const ARC_RADIUS = 92;
const ARC_START_ANGLE = (5 * Math.PI) / 6;
const ARC_END_ANGLE = Math.PI / 6;

const SPRING_CONFIG = {
   damping: 26,
   stiffness: 190,
   mass: 0.9,
   overshootClamping: true,
};

const BACKDROP_MAX_OPACITY = 0.14;

const BACKDROP_OPEN_TIMING = {
   duration: 240,
   easing: Easing.out(Easing.cubic),
};

const BACKDROP_CLOSE_TIMING = {
   duration: 340,
   easing: Easing.inOut(Easing.quad),
};

function triggerToggleHaptic() {
   void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function triggerActionHaptic() {
   void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export type FabAction = {
   id: string;
   icon: ReactNode;
   onPress: () => void;
   accessibilityLabel: string;
};

export type FloatingActionButtonProps = {
   actions: FabAction[];
   onToggle?: (open: boolean) => void;
   /** Called when the main FAB is pressed (e.g. to reveal after scroll-hide). */
   onMainPress?: () => void;
   bottomOffset?: number;
   /** Vertical offset driven by list scroll position in the parent screen. */
   scrollTranslateY?: SharedValue<number>;
   /** Brief scale pulse when actions change (parent-driven). */
   transitionScale?: SharedValue<number>;
   style?: StyleProp<ViewStyle>;
};

function getActionAngle(index: number, count: number) {
   if (count <= 1) {
      return Math.PI / 2;
   }
   const step = (ARC_START_ANGLE - ARC_END_ANGLE) / (count - 1);
   return ARC_START_ANGLE - step * index;
}

type FabActionButtonProps = {
   action: FabAction;
   index: number;
   count: number;
   progress: SharedValue<number>;
   onPress: () => void;
   actionBackgroundColor: string;
   actionBorderColor: string;
};

function FabActionButton({
   action,
   index,
   count,
   progress,
   onPress,
   actionBackgroundColor,
   actionBorderColor,
}: FabActionButtonProps) {
   const angle = useMemo(() => getActionAngle(index, count), [index, count]);

   const animatedStyle = useAnimatedStyle(() => {
      const radius = ARC_RADIUS * progress.value;
      return {
         opacity: progress.value,
         transform: [
            { translateX: radius * Math.cos(angle) },
            { translateY: -radius * Math.sin(angle) },
            { scale: 0.4 + progress.value * 0.6 },
         ],
      };
   });

   return (
      <AnimatedPressable
         accessibilityRole="button"
         accessibilityLabel={action.accessibilityLabel}
         onPress={onPress}
         style={[
            styles.actionButton,
            {
               backgroundColor: actionBackgroundColor,
               borderColor: actionBorderColor,
            },
            animatedStyle,
         ]}
      >
         {action.icon}
      </AnimatedPressable>
   );
}

export default function FloatingActionButton({
   actions,
   onToggle,
   onMainPress,
   bottomOffset = 24,
   scrollTranslateY,
   transitionScale,
   style,
}: FloatingActionButtonProps) {
   const { colors } = useMyTheme();
   const insets = useSafeAreaInsets();
   const [open, setOpen] = useState(false);
   const [backdropInteractive, setBackdropInteractive] = useState(false);
   const progress = useSharedValue(0);
   const backdropProgress = useSharedValue(0);

   const setExpanded = useCallback(
      (nextOpen: boolean) => {
         setOpen(nextOpen);

         if (nextOpen) {
            setBackdropInteractive(true);
            backdropProgress.value = withTiming(1, BACKDROP_OPEN_TIMING);
         } else {
            backdropProgress.value = withTiming(0, BACKDROP_CLOSE_TIMING, (finished) => {
               if (finished) {
                  runOnJS(setBackdropInteractive)(false);
               }
            });
         }

         progress.value = withSpring(nextOpen ? 1 : 0, SPRING_CONFIG);
         onToggle?.(nextOpen);
      },
      [backdropProgress, onToggle, progress],
   );

   const toggle = useCallback(() => {
      onMainPress?.();
      triggerToggleHaptic();
      setExpanded(!open);
   }, [onMainPress, open, setExpanded]);

   const close = useCallback(() => {
      if (open) {
         setExpanded(false);
      }
   }, [open, setExpanded]);

   useAnimatedReaction(
      () => scrollTranslateY?.value ?? 0,
      (current, previous) => {
         if (!scrollTranslateY) {
            return;
         }
         if (current > 8 && (previous ?? 0) <= 8) {
            runOnJS(close)();
         }
      },
      [scrollTranslateY],
   );

   const handleActionPress = useCallback(
      (action: FabAction) => {
         triggerActionHaptic();
         setExpanded(false);
         action.onPress();
      },
      [setExpanded],
   );

   const mainButtonStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${progress.value * 45}deg` }],
   }));

   const backdropStyle = useAnimatedStyle(() => ({
      opacity: backdropProgress.value * backdropProgress.value * BACKDROP_MAX_OPACITY,
   }));

   const clusterScrollStyle = useAnimatedStyle(() => {
      const transform: (
         | { scale: number }
         | { translateY: number }
      )[] = [];

      if (transitionScale) {
         transform.push({ scale: transitionScale.value });
      }

      if (scrollTranslateY) {
         transform.push({ translateY: scrollTranslateY.value });
      }

      if (transform.length === 0) {
         return {};
      }

      return { transform };
   }, [scrollTranslateY, transitionScale]);

   return (
      <View pointerEvents="box-none" style={[styles.overlay, style]}>
         <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            onPress={close}
            pointerEvents={backdropInteractive ? 'auto' : 'none'}
            style={[styles.backdrop, backdropStyle]}
         />

         <Animated.View
            pointerEvents="box-none"
            style={[
               styles.fabCluster,
               {
                  bottom: bottomOffset + insets.bottom,
                  height: MAIN_SIZE + ARC_RADIUS,
               },
               clusterScrollStyle,
            ]}
         >
            <View
               pointerEvents="box-none"
               style={[styles.mainAnchor, { width: MAIN_SIZE, height: MAIN_SIZE }]}
            >
               {actions.map((action, index) => (
                  <FabActionButton
                     key={action.id}
                     action={action}
                     index={index}
                     count={actions.length}
                     progress={progress}
                     onPress={() => handleActionPress(action)}
                     actionBackgroundColor={colors.background}
                     actionBorderColor={colors.inputBorder}
                  />
               ))}

               <AnimatedPressable
                  accessibilityRole="button"
                  accessibilityLabel={open ? "Close actions" : "Open actions"}
                  accessibilityState={{ expanded: open }}
                  onPress={toggle}
                  style={[
                     styles.mainButton,
                     mainButtonStyle,
                     {
                        backgroundColor: colors.primary,
                        boxShadow: "0 4px 12px rgba(98, 0, 238, 0.35)",
                     },
                  ]}
               >
                  <PlatformIcon name={AvailableIcons.plus} size={26} color="#FFFFFF" />
               </AnimatedPressable>
            </View>
         </Animated.View>
      </View>
   );
}

const styles = StyleSheet.create({
   overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 10,
   },
   backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#000000",
   },
   fabCluster: {
      position: "absolute",
      left: 0,
      right: 0,
      alignItems: "center",
      justifyContent: "flex-end",
   },
   mainAnchor: {
      alignItems: "center",
      justifyContent: "center",
   },
   mainButton: {
      width: MAIN_SIZE,
      height: MAIN_SIZE,
      borderRadius: MAIN_SIZE / 2,
      borderCurve: "continuous",
      alignItems: "center",
      justifyContent: "center",
   },
   actionButton: {
      position: "absolute",
      width: ACTION_SIZE,
      height: ACTION_SIZE,
      borderRadius: ACTION_SIZE / 2,
      borderCurve: "continuous",
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
   },
});
