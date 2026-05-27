import PlatformIcon from "@/components/PlatformIcon";
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
   SharedValue,
   useAnimatedStyle,
   useSharedValue,
   withSpring,
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
   bottomOffset?: number;
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
   bottomOffset = 24,
   style,
}: FloatingActionButtonProps) {
   const { colors } = useMyTheme();
   const insets = useSafeAreaInsets();
   const [open, setOpen] = useState(false);
   const progress = useSharedValue(0);

   const setExpanded = useCallback(
      (nextOpen: boolean) => {
         setOpen(nextOpen);
         progress.value = withSpring(nextOpen ? 1 : 0, SPRING_CONFIG);
         onToggle?.(nextOpen);
      },
      [onToggle, progress],
   );

   const toggle = useCallback(() => {
      triggerToggleHaptic();
      setExpanded(!open);
   }, [open, setExpanded]);

   const close = useCallback(() => {
      if (open) {
         setExpanded(false);
      }
   }, [open, setExpanded]);

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
      opacity: progress.value * 0.2,
   }));

   return (
      <View pointerEvents="box-none" style={[styles.overlay, style]}>
         {open ? (
            <AnimatedPressable
               accessibilityRole="button"
               accessibilityLabel="Close menu"
               onPress={close}
               style={[styles.backdrop, backdropStyle]}
            />
         ) : null}

         <View
            pointerEvents="box-none"
            style={[
               styles.fabCluster,
               {
                  bottom: bottomOffset + insets.bottom,
                  height: MAIN_SIZE + ARC_RADIUS,
               },
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
                  <PlatformIcon name="plus" size={26} color="#FFFFFF" />
               </AnimatedPressable>
            </View>
         </View>
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
