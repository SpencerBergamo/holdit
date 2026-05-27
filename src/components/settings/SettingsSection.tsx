import { useMyTheme } from "@/contexts/MyThemeContext";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import SettingsRow, { SettingsRowProps } from "./SettingsRow";

type SettingsSectionProps = {
   title?: string;
   children: ReactNode;
};

export default function SettingsSection({ title, children }: SettingsSectionProps) {
   const { colors, spacing } = useMyTheme();

   return (
      <View style={[styles.section, { gap: spacing.s }]}>
         {title ? (
            <Text
               style={[
                  styles.title,
                  {
                     color: colors.textMuted,
                     paddingHorizontal: spacing.s,
                  },
               ]}
            >
               {title}
            </Text>
         ) : null}

         <View
            style={[
               styles.group,
               {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
               },
            ]}
         >
            {children}
         </View>
      </View>
   );
}

export type SettingsSectionRow = SettingsRowProps & { key: string };

export function SettingsSectionRows({ rows }: { rows: SettingsSectionRow[] }) {
   return (
      <>
         {rows.map((row, index) => {
            const { key, ...rowProps } = row;
            return (
               <SettingsRow
                  key={key}
                  {...rowProps}
                  isLast={index === rows.length - 1}
               />
            );
         })}
      </>
   );
}

const styles = StyleSheet.create({
   section: {
      width: "100%",
   },
   title: {
      fontSize: 13,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.4,
   },
   group: {
      borderRadius: 14,
      borderCurve: "continuous",
      borderWidth: 1,
      overflow: "hidden",
   },
});
