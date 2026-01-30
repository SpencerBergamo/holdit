// theme.ts
import { useColorScheme } from 'react-native';

const palette = {
    blue: {
        50: '#E6F0FF',
        100: '#CCE0FF',
        200: '#99C2FF',
        300: '#66A3FF',
        400: '#3385FF',
        500: '#0066FF', // primary
        600: '#0052CC',
        700: '#003D99',
        800: '#002966',
        900: '#001433',
    },
    neutral: {
        0: '#FFFFFF',
        50: '#F7F7F8',
        100: '#EFEFF1',
        200: '#DCDCE0',
        300: '#B9B9C0',
        400: '#8E8E98',
        500: '#6E6E78',
        600: '#4A4A52',
        700: '#2C2C34',
        800: '#1C1C21',
        900: '#111114',
        950: '#000000',
    },
    red: '#FF453A',
    green: '#30D158',
    yellow: '#FFD60A',
};

export const useTheme = () => {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';

    return {
        isDark,
        colors: {
            // backgrounds
            bg: isDark ? palette.neutral[900] : palette.neutral[0],
            surface: isDark ? palette.neutral[800] : palette.neutral[50],
            elevated: isDark ? palette.neutral[700] : palette.neutral[0],

            // text
            text: isDark ? palette.neutral[0] : palette.neutral[900],
            textMuted: isDark ? palette.neutral[400] : palette.neutral[500],
            textSubtle: isDark ? palette.neutral[500] : palette.neutral[400],

            // primary (blue)
            primary: palette.blue[500],
            primaryLight: isDark ? palette.blue[400] : palette.blue[300],
            primaryDark: isDark ? palette.blue[600] : palette.blue[600],

            // utility
            border: isDark ? palette.neutral[700] : palette.neutral[200],
            overlay: isDark ? '#00000080' : '#00000040',
            error: palette.red,
            success: isDark ? '#32D74B' : palette.green,
            warning: isDark ? '#FF9F0A' : '#FF9500',
        },
        space: [0, 4, 8, 12, 16, 24, 32, 48, 64],
        radius: {
            sm: 6,
            md: 10,
            lg: 16,
            full: 9999,
        },
        type: {
            title: {
                fontSize: 28,
                fontWeight: '700',
                lineHeight: 34,
                letterSpacing: -0.5,
            },
            headline: {
                fontSize: 20,
                fontWeight: '600',
                lineHeight: 26,
            },
            body: {
                fontSize: 16,
                fontWeight: '400',
                lineHeight: 22,
            },
            bodyStrong: {
                fontSize: 16,
                fontWeight: '600',
                lineHeight: 22,
            },
            label: {
                fontSize: 14,
                fontWeight: '500',
                lineHeight: 20,
            },
            caption: {
                fontSize: 12,
                fontWeight: '400',
                lineHeight: 16,
            },
        },
        shadow: {
            sm: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.3 : 0.05,
                shadowRadius: 2,
                elevation: 2,
            },
            md: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.4 : 0.08,
                shadowRadius: 8,
                elevation: 4,
            },
        },
    };
};

export type Theme = ReturnType<typeof useTheme>;