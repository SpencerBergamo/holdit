import PlatformIcon, { AvailableIcons } from "@/components/PlatformIcon";
import { BlurView } from "expo-blur";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as Device from "expo-device";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
   ActivityIndicator,
   Alert,
   Image as RNImage,
   Linking,
   Pressable,
   StyleSheet,
   Text,
   View,
} from "react-native";
import Animated, {
   FadeIn,
   FadeInDown,
   FadeInUp,
   FadeOut,
   FadeOutDown,
   FadeOutUp,
   useAnimatedStyle,
   useSharedValue,
   withSequence,
   withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const devMockCaptureUri = __DEV__
   ? RNImage.resolveAssetSource(
      require("../../../../assets/images/splash-icon.png"),
   ).uri
   : "";

const isSimulator = !Device.isDevice;

// ─── Glass button helper ────────────────────────────────────────────────────

function GlassButton({
   icon,
   label,
   size = 24,
   onPress,
}: {
   icon: AvailableIcons;
   label: string;
   size?: number;
   onPress: () => void;
}) {
   const Container = isLiquidGlassAvailable() ? GlassView : BlurViewFallback;

   return (
      <Container style={styles.glassBtn}>
         <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={styles.glassBtnInner}
            hitSlop={8}
         >
            <PlatformIcon name={icon} />
         </Pressable>
      </Container>
   );
}

function BlurViewFallback({
   style,
   children,
}: {
   style?: object;
   children: React.ReactNode;
}) {
   return (
      <BlurView
         tint="systemUltraThinMaterial"
         intensity={80}
         style={[{ overflow: "hidden" }, style]}
      >
         {children}
      </BlurView>
   );
}

// ─── Shutter flash overlay ───────────────────────────────────────────────────

function ShutterFlash({ visible }: { visible: boolean }) {
   if (!visible) return null;
   return (
      <Animated.View
         entering={FadeIn.duration(30)}
         exiting={FadeOut.duration(180)}
         style={StyleSheet.absoluteFill}
         pointerEvents="none"
      >
         <View style={[StyleSheet.absoluteFill, { backgroundColor: "white" }]} />
      </Animated.View>
   );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

type CapturedPhoto = {
   uri: string;
};

export default function CameraScreen() {
   const [permission, requestPermission] = useCameraPermissions();
   const [facing, setFacing] = useState<CameraType>("back");
   const [captured, setCaptured] = useState<CapturedPhoto | null>(null);
   const [flashVisible, setFlashVisible] = useState(false);
   const [capturing, setCapturing] = useState(false);
   const cameraRef = useRef<CameraView>(null);
   const insets = useSafeAreaInsets();

   const shutterScale = useSharedValue(1);
   const shutterStyle = useAnimatedStyle(() => ({
      transform: [{ scale: shutterScale.value }],
   }));

   const openSettings = () => {
      void Linking.openSettings();
   };

   const promptSettings = () => {
      Alert.alert(
         "Camera is turned off",
         "Allow camera access in Settings so HoldIt can capture products for your wishlists.",
         [
            { text: "Not now", style: "cancel" },
            { text: "Open Settings", onPress: openSettings },
         ],
      );
   };

   // ── Permission gate ───────────────────────────────────────────────────────

   if (!permission) {
      return (
         <View style={[styles.screen, styles.centered]}>
            <ActivityIndicator size="large" color="#fff" />
         </View>
      );
   }

   if (!permission.granted) {
      const canAskAgain = permission.canAskAgain !== false;
      return (
         <View style={[styles.screen, styles.permissionContainer]}>
            <SymbolView name="camera" size={48} tintColor="white" />
            <Text style={styles.permissionTitle}>Camera access needed</Text>
            <Text style={styles.permissionBody}>
               HoldIt uses the camera to snap items you want on your wishlists. We
               only upload a photo when you save it to a list.
            </Text>
            {canAskAgain ? (
               <Pressable
                  onPress={requestPermission}
                  style={styles.permissionBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Allow camera access"
               >
                  <Text style={styles.permissionBtnText}>Continue</Text>
               </Pressable>
            ) : (
               <Pressable
                  onPress={promptSettings}
                  style={styles.permissionBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Open Settings to allow camera"
               >
                  <Text style={styles.permissionBtnText}>Open Settings</Text>
               </Pressable>
            )}
            <Pressable
               onPress={() => router.back()}
               style={styles.permissionSecondary}
               accessibilityRole="button"
               accessibilityLabel="Close"
            >
               <Text style={styles.permissionSecondaryText}>Not now</Text>
            </Pressable>
         </View>
      );
   }

   // ── Capture ────────────────────────────────────────────────────────────────

   const handleCapture = async () => {
      if (capturing) {
         return;
      }

      if (isSimulator && __DEV__) {
         void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
         setFlashVisible(true);
         setTimeout(() => setFlashVisible(false), 250);
         setCaptured({ uri: devMockCaptureUri });
         return;
      }

      if (isSimulator) {
         Alert.alert(
            "Camera not available",
            "Use a physical device to take photos. Simulators don’t provide a live camera.",
         );
         return;
      }

      if (!cameraRef.current) {
         return;
      }

      setCapturing(true);
      shutterScale.value = withSequence(
         withTiming(0.88, { duration: 80 }),
         withTiming(1, { duration: 120 }),
      );

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setFlashVisible(true);
      setTimeout(() => setFlashVisible(false), 250);

      try {
         const photo = await cameraRef.current.takePictureAsync({
            quality: 0.85,
         });
         if (photo?.uri) {
            setCaptured({ uri: photo.uri });
         } else {
            Alert.alert(
               "Couldn’t take photo",
               "Something went wrong. Try again or close and reopen the camera.",
            );
         }
      } catch {
         Alert.alert(
            "Couldn’t take photo",
            "The camera may still be starting. Try again in a moment.",
         );
      } finally {
         setCapturing(false);
      }
   };

   const handleFlipCamera = () => {
      if (isSimulator) {
         return;
      }
      void Haptics.selectionAsync();
      setFacing((f) => (f === "back" ? "front" : "back"));
   };

   const handleDiscard = () => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCaptured(null);
   };

   const handleContinueToCollection = () => {
      if (!captured?.uri) {
         return;
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({
         pathname: "/(home)/(camera)/choose-collection",
         params: { photoUri: captured.uri },
      });
   };

   // ── Review mode ────────────────────────────────────────────────────────────

   if (captured) {
      return (
         <View style={styles.screen}>
            <Image
               source={{ uri: captured.uri }}
               style={StyleSheet.absoluteFill}
               contentFit="cover"
            />

            <Animated.View
               entering={FadeInDown.duration(280).springify()}
               exiting={FadeOutUp.duration(200)}
               style={[styles.reviewTop, { top: insets.top + 12 }]}
            >
               <GlassButton
                  icon={AvailableIcons.close}
                  label="Discard photo"
                  onPress={handleDiscard}
               />
            </Animated.View>

            <Animated.View
               entering={FadeInUp.duration(280).springify()}
               exiting={FadeOutDown.duration(200)}
               style={[
                  styles.reviewBottom,
                  { paddingBottom: insets.bottom + 24 },
               ]}
            >
               <GlassButton
                  icon={AvailableIcons.replay}
                  label="Retake photo"
                  onPress={handleDiscard}
               />

               <Pressable
                  onPress={handleContinueToCollection}
                  accessibilityRole="button"
                  accessibilityLabel="Choose wishlist to save this photo"
                  style={({ pressed }) => [
                     styles.saveBtn,
                     { opacity: pressed ? 0.85 : 1 },
                  ]}
               >
                  <Text style={styles.saveBtnText}>Choose wishlist</Text>
               </Pressable>

               <View style={styles.glassBtn} />
            </Animated.View>
         </View>
      );
   }

   // ── Viewfinder mode ────────────────────────────────────────────────────────

   return (
      <View style={styles.screen}>
         {!isSimulator ? (
            <CameraView
               ref={cameraRef}
               style={StyleSheet.absoluteFill}
               facing={facing}
               mirror={facing === "front"}
            />
         ) : (
            <View style={[StyleSheet.absoluteFill, styles.simulatorBackdrop]}>
               <Text style={styles.simulatorTitle}>No live preview here</Text>
               <Text style={styles.simulatorBody}>
                  {__DEV__
                     ? "Simulators don’t have a camera. Use “Take photo” below with a mock image to test saving, or run on a device."
                     : "Use a physical device to capture products. Simulators don’t provide a camera."}
               </Text>
               {__DEV__ ? (
                  <View style={styles.devPill}>
                     <Text style={styles.devPillText}>Development build</Text>
                  </View>
               ) : null}
            </View>
         )}

         <ShutterFlash visible={flashVisible} />

         <View style={[styles.topControls, { top: insets.top + 12 }]}>
            <GlassButton
               icon={AvailableIcons.close}
               label="Close camera"
               onPress={() => router.back()}
            />
         </View>

         <View
            style={[
               styles.bottomControls,
               { paddingBottom: insets.bottom + 24 },
            ]}
         >
            <View style={isSimulator ? { opacity: 0.35 } : undefined}>
               <GlassButton
                  icon={AvailableIcons.flip}
                  label="Flip camera"
                  onPress={handleFlipCamera}
               />
            </View>

            <Animated.View style={[shutterStyle, capturing && { opacity: 0.6 }]}>
               <Pressable
                  onPress={() => void handleCapture()}
                  disabled={capturing}
                  accessibilityRole="button"
                  accessibilityLabel={
                     isSimulator && __DEV__
                        ? "Use mock photo (development)"
                        : "Take photo"
                  }
                  style={styles.shutter}
               >
                  <View style={styles.shutterInner} />
               </Pressable>
            </Animated.View>

            <View style={styles.glassBtn} />
         </View>
      </View>
   );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const SHUTTER_SIZE = 72;
const SHUTTER_INNER_SIZE = 60;
const GLASS_BTN_SIZE = 48;

const styles = StyleSheet.create({
   screen: {
      flex: 1,
      backgroundColor: "#000",
   },
   centered: {
      alignItems: "center",
      justifyContent: "center",
   },
   simulatorBackdrop: {
      backgroundColor: "#1a1a1a",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
      gap: 12,
   },
   simulatorTitle: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
   },
   simulatorBody: {
      color: "rgba(255,255,255,0.75)",
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
   },
   devPill: {
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(255,193,7,0.25)",
   },
   devPillText: {
      color: "#ffc107",
      fontSize: 13,
      fontWeight: "600",
   },
   permissionContainer: {
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingHorizontal: 32,
   },
   permissionTitle: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "700",
      textAlign: "center",
      marginTop: 8,
   },
   permissionBody: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 15,
      lineHeight: 21,
      textAlign: "center",
   },
   permissionBtn: {
      marginTop: 8,
      paddingVertical: 14,
      paddingHorizontal: 32,
      backgroundColor: "#fff",
      borderRadius: 999,
   },
   permissionBtnText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#000",
   },
   permissionSecondary: {
      marginTop: 16,
      paddingVertical: 10,
      paddingHorizontal: 16,
   },
   permissionSecondaryText: {
      color: "rgba(255,255,255,0.85)",
      fontSize: 16,
      fontWeight: "500",
   },
   topControls: {
      position: "absolute",
      left: 16,
   },
   bottomControls: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 32,
   },
   shutter: {
      width: SHUTTER_SIZE,
      height: SHUTTER_SIZE,
      borderRadius: SHUTTER_SIZE / 2,
      borderWidth: 3,
      borderColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
   },
   shutterInner: {
      width: SHUTTER_INNER_SIZE,
      height: SHUTTER_INNER_SIZE,
      borderRadius: SHUTTER_INNER_SIZE / 2,
      backgroundColor: "#fff",
   },
   glassBtn: {
      width: GLASS_BTN_SIZE,
      height: GLASS_BTN_SIZE,
      borderRadius: GLASS_BTN_SIZE / 2,
      overflow: "hidden",
   },
   glassBtnInner: {
      width: GLASS_BTN_SIZE,
      height: GLASS_BTN_SIZE,
      alignItems: "center",
      justifyContent: "center",
   },
   reviewTop: {
      position: "absolute",
      left: 16,
   },
   reviewBottom: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 32,
   },
   saveBtn: {
      flex: 1,
      marginHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 999,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
   },
   saveBtnText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#000",
   },
});
