import { useMyTheme } from "@/contexts/MyThemeContext";
import { ReactNode } from "react";
import {
   Pressable,
   StyleSheet,
   Text,
   View,
} from "react-native";

export type SettingsRowProps = {
   label: string;
   icon?: ReactNode;
   value?: string;
   trailing?: ReactNode;
   showChevron?: boolean;
   destructive?: boolean;
   isLast?: boolean;
   onPress?: () => void;
};

export default function SettingsRow({
   label,
   icon,
   value,
   trailing,
   showChevron = true,
   destructive = false,
   isLast = false,
   onPress,
}: SettingsRowProps) {
   const { colors, spacing } = useMyTheme();
   const labelColor = destructive ? colors.error : colors.text;
   const isInteractive = Boolean(onPress);

   const content = (
      <View
         style={[
            styles.row,
            {
               paddingHorizontal: spacing.m,
               paddingVertical: spacing.m - 2,
               borderBottomWidth: isLast ? 0 : 1,
               borderBottomColor: colors.inputBorder,
            },
         ]}
      >
         {icon ? <View style={styles.icon}>{icon}</View> : null}

         <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
            {label}
         </Text>

         <View style={styles.trailing}>
            {value ? (
               <Text
                  style={[styles.value, { color: colors.textMuted }]}
                  numberOfLines={1}
               >
                  {value}
               </Text>
            ) : null}
            {trailing}
            {showChevron && !trailing && isInteractive ? (
               <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
            ) : null}
         </View>
      </View>
   );

   if (!isInteractive) {
      return content;
   }

   return (
      <Pressable
         accessibilityRole="button"
         onPress={onPress}
         style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
         {content}
      </Pressable>
   );
}

const styles = StyleSheet.create({
   row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
   },
   icon: {
      width: 28,
      alignItems: "center",
   },
   label: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
   },
   trailing: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexShrink: 1,
      maxWidth: "50%",
   },
   value: {
      fontSize: 15,
      fontWeight: "400",
   },
   chevron: {
      fontSize: 22,
      fontWeight: "400",
      lineHeight: 22,
   },
});
