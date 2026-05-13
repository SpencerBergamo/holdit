import { AppColors, darkColors, lightColors } from "./colors";
import { AppSpacing, spacing } from "./spacing";

export interface AppTheme {
   colors: AppColors;
   spacing: AppSpacing;
}

export const lightTheme: AppTheme = {
   colors: lightColors,
   spacing: spacing,
};

export const darkTheme: AppTheme = {
   colors: darkColors,
   spacing: spacing,
};

