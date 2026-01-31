import * as Haptics from 'expo-haptics';
import { useCallback } from "react";
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, Text } from "react-native";

const theme = {
    primary: { bg: '#007AFF', text: '#fff' },
    secondary: { bg: '#E5E5EA', text: '#000' },
    danger: { bg: '#FF3B30', text: '#fff' },
};

type Props = PressableProps & {
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    children: string;
}

export default function Button({
    variant = 'primary',
    children,
    loading = false,
    disabled = false,
    onPress,
    ...props
}: Props) {

    const handlePress = useCallback((e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
        if (loading || disabled) return;

        Haptics.selectionAsync();
        onPress?.(e);
    }, [loading, disabled, onPress]);

    const colors = theme[variant];
    const isInactive = loading || disabled;

    return (
        <Pressable
            {...props}
            onPress={handlePress}
            disabled={isInactive}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.bg },
                pressed && !isInactive && styles.pressed,
                isInactive && styles.inactive,
            ]}
        >

            {loading ? (
                <ActivityIndicator size="small" color={colors.text} />
            ) : (
                <Text style={styles.text}>{children}</Text>
            )}

        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inactive: {
        opacity: 0.5,
    },
    pressed: {
        opacity: 0.8,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});