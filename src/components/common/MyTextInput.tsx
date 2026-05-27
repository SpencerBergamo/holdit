import PlatformIcon, { AvailableIcons } from '@/components/PlatformIcon';
import { useMyTheme } from '@/contexts/MyThemeContext';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import Animated, {
   interpolateColor,
   useAnimatedStyle,
   useSharedValue,
   withTiming,
} from 'react-native-reanimated';

interface MyTextInputProps extends TextInputProps {
   /** Error message — when set, shows a red border + error text + haptic on first appearance. */
   error?: string;
   /** Style applied to the outermost wrapper (use for margins / layout). */
   containerStyle?: ViewStyle;
}

const ANIM_DURATION = 200;

const MyTextInput = React.forwardRef<TextInput, MyTextInputProps>(
   ({ error, secureTextEntry, containerStyle, style, ...rest }, ref) => {
      const theme = useMyTheme();
      const [isSecureHidden, setIsSecureHidden] = useState(true);
      const prevHadError = useRef(false);
      const errorProgress = useSharedValue(0);

      useEffect(() => {
         const hasError = !!error;

         if (hasError && !prevHadError.current) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
         }

         errorProgress.value = withTiming(hasError ? 1 : 0, { duration: ANIM_DURATION });
         prevHadError.current = hasError;
      }, [error, errorProgress]);

      const animatedBorderStyle = useAnimatedStyle(() => ({
         borderColor: interpolateColor(
            errorProgress.value,
            [0, 1],
            [theme.colors.inputBorder, theme.colors.error],
         ),
      }));

      return (
         <View style={containerStyle}>
            <Animated.View
               style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.colors.inputBackground },
                  animatedBorderStyle,
               ]}
            >
               <TextInput
                  ref={ref}
                  style={[
                     styles.input,
                     { color: theme.colors.inputText },
                     secureTextEntry && styles.inputWithToggle,
                     style,
                  ]}
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={secureTextEntry && isSecureHidden}
                  {...rest}
               />
               {secureTextEntry && (
                  <Pressable
                     style={styles.toggleButton}
                     onPress={() => setIsSecureHidden((prev) => !prev)}
                     hitSlop={8}
                     accessibilityRole="button"
                     accessibilityLabel={isSecureHidden ? 'Show password' : 'Hide password'}
                  >
                     <PlatformIcon
                        name={isSecureHidden ? AvailableIcons.eyeOff : AvailableIcons.eye}
                        size={20}
                     />
                  </Pressable>
               )}
            </Animated.View>
         </View>
      );
   },
);

MyTextInput.displayName = 'MyTextInput';

export default MyTextInput;

const styles = StyleSheet.create({
   inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 16,
      minHeight: 54,
   },
   input: {
      flex: 1,
      fontSize: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
   },
   inputWithToggle: {
      paddingRight: 48,
   },
   toggleButton: {
      position: 'absolute',
      right: 16,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
   },
});
