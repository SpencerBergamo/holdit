// Define your base tokens
export const baseColors = {
   white: '#FFFFFF',
   black: '#000000',
   gray100: '#F5F5F5',
   gray500: '#808080',
   gray700: '#333333',
   primary500: '#6200EE',
};

export const lightColors = {
   background: baseColors.white,
   text: baseColors.gray700,
   textMuted: baseColors.gray500,
   inputBackground: baseColors.gray100,
   inputText: baseColors.black,
   primary: baseColors.primary500,
   // ...
};

export const darkColors = {
   background: baseColors.black,
   text: baseColors.white,
   textMuted: baseColors.gray500,
   inputBackground: baseColors.gray700,
   inputText: baseColors.white,
   primary: baseColors.primary500,
   // ...
};

export type AppColors = typeof lightColors;