import { useMyTheme } from "@/contexts/MyThemeContext";
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

export type WishlistCardProps = {
   name: string;
   itemCount: number;
   onPress?: () => void;
   containerStyle?: StyleProp<ViewStyle>;
};

export default function WishlistCard({
   name,
   itemCount,
   onPress,
   containerStyle,
}: WishlistCardProps) {
   const { colors, spacing } = useMyTheme();

   return (
      <Pressable
         accessibilityRole="button"
         onPress={onPress}
         style={({ pressed }) => [
            styles.card,
            containerStyle,
            {
               backgroundColor: colors.inputBackground,
               borderColor: colors.inputBorder,
               padding: spacing.m,
               opacity: pressed ? 0.85 : 1,
            },
         ]}
      >
         <Text selectable style={[styles.title, { color: colors.text }]}>
            {name}
         </Text>
         <Text style={[styles.meta, { color: colors.textMuted }]}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
         </Text>
      </Pressable>
   );
}

const styles = StyleSheet.create({
   card: {
      width: "100%",
      borderRadius: 999,
      borderCurve: "continuous",
      borderWidth: 1,
      alignContent: "center",
      justifyContent: 'center',
   },
   title: {
      fontSize: 17,
      fontWeight: "600",
      letterSpacing: -0.2,
      textAlign: "center",
   },
   meta: {
      marginTop: 4,
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
   },
});
