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
   Pressable,
   StyleSheet,
   Text,
   View
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
   const cameraRef = useRef<CameraView>(null);
   const insets = useSafeAreaInsets();

   // Shutter button scale pulse
   const shutterScale = useSharedValue(1);
   const shutterStyle = useAnimatedStyle(() => ({
      transform: [{ scale: shutterScale.value }],
   }));

   // ── Permission gate ────────────────────────────────────────────────────────

   if (!permission) return <View style={styles.screen} />;

   if (!permission.granted) {
      return (
         <View style={[styles.screen, styles.permissionContainer]}>
            <SymbolView name="camera" size={48} tintColor="white" />
            <Text style={styles.permissionTitle}>Camera access needed</Text>
            <Text style={styles.permissionBody}>
               HoldIt needs the camera to capture product photos.
            </Text>
            <Pressable
               onPress={requestPermission}
               style={styles.permissionBtn}
               accessibilityRole="button"
            >
               <Text style={styles.permissionBtnText}>Allow Camera</Text>
            </Pressable>
         </View>
      );
   }

   // ── Capture ────────────────────────────────────────────────────────────────

   const handleCapture = async () => {
      if (!cameraRef.current) return;

      shutterScale.value = withSequence(
         withTiming(0.88, { duration: 80 }),
         withTiming(1, { duration: 120 }),
      );

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Flash the screen white briefly like a shutter
      setFlashVisible(true);
      setTimeout(() => setFlashVisible(false), 250);

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo) {
         setCaptured({ uri: photo.uri });
      }
   };

   const handleFlipCamera = () => {
      void Haptics.selectionAsync();
      setFacing((f) => (f === "back" ? "front" : "back"));
   };

   const handleDiscard = () => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCaptured(null);
   };

   const handleSave = () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // TODO: wire up to wishlist/product creation
      router.back();
   };

   // ── Review mode ────────────────────────────────────────────────────────────

   if (captured) {
      return (
         <View style={styles.screen}>
            {/* Frozen photo fill */}
            <Image
               source={{ uri: captured.uri }}
               style={StyleSheet.absoluteFill}
               contentFit="cover"
            />

            {/* Top controls */}
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

            {/* Bottom controls */}
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

               {/* Save CTA */}
               <Pressable
                  onPress={handleSave}
                  accessibilityRole="button"
                  accessibilityLabel="Add to wishlist"
                  style={({ pressed }) => [
                     styles.saveBtn,
                     { opacity: pressed ? 0.85 : 1 },
                  ]}
               >
                  <Text style={styles.saveBtnText}>Add to wishlist</Text>
               </Pressable>

               <GlassButton
                  icon={AvailableIcons.checkmark}
                  label="Save to camera roll"
                  onPress={() => { }}
               />
            </Animated.View>
         </View>
      );
   }

   // ── Viewfinder mode ────────────────────────────────────────────────────────

   return (
      <View style={styles.screen}>
         {Device.isDevice ? (
            <CameraView
               ref={cameraRef}
               style={StyleSheet.absoluteFill}
               facing={facing}
               mirror={facing === "front"}
            />
         ) : (
            <View style={{ flex: 1, backgroundColor: "grey" }} />
         )}

         <ShutterFlash visible={flashVisible} />

         {/* Top controls */}
         <View style={[styles.topControls, { top: insets.top + 12 }]}>
            <GlassButton
               icon={AvailableIcons.close}
               label="Close camera"
               onPress={() => router.back()}
            />
         </View>

         {/* Bottom controls */}
         <View
            style={[
               styles.bottomControls,
               { paddingBottom: insets.bottom + 24 },
            ]}
         >
            {/* Flip camera */}
            <GlassButton
               icon={AvailableIcons.flip}
               label="Flip camera"
               onPress={handleFlipCamera}
            />

            {/* Shutter */}
            <Animated.View style={shutterStyle}>
               <Pressable
                  onPress={handleCapture}
                  accessibilityRole="button"
                  accessibilityLabel="Take photo"
                  style={styles.shutter}
               >
                  <View style={styles.shutterInner} />
               </Pressable>
            </Animated.View>

            {/* Spacer to keep shutter centered */}
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
   // ── Permission ─────────────────────────────────────────────────────────
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
   // ── Viewfinder ─────────────────────────────────────────────────────────
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
   // ── Review ─────────────────────────────────────────────────────────────
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
