// Define your base tokens
export const baseColors = {
   white: '#FFFFFF',
   black: '#000000',
   gray100: '#F5F5F5',
   gray300: '#DDDDDD',
   gray500: '#808080',
   gray600: '#555555',
   gray700: '#333333',
   primary500: '#6200EE',
   red500: '#DC3545',
   red400: '#FF6B6B',
};

export const lightColors = {
   background: baseColors.white,
   text: baseColors.gray700,
   textMuted: baseColors.gray500,
   inputBackground: baseColors.gray100,
   inputText: baseColors.black,
   inputBorder: baseColors.gray300,
   primary: baseColors.primary500,
   error: baseColors.red500,
};

export const darkColors = {
   background: baseColors.black,
   text: baseColors.white,
   textMuted: baseColors.gray500,
   inputBackground: baseColors.gray700,
   inputText: baseColors.white,
   inputBorder: baseColors.gray600,
   primary: baseColors.primary500,
   error: baseColors.red400,
};

export type AppColors = typeof lightColors;