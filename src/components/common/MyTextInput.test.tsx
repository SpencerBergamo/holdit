import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React, { createRef } from 'react';
import { TextInput } from 'react-native';
import MyTextInput from './MyTextInput';

// ── Mocks ─────────────────────────────────────────────────────

jest.mock('react-native-reanimated', () => {
   const { View } = require('react-native');
   return {
      __esModule: true,
      default: {
         View,
         createAnimatedComponent: (c: unknown) => c,
      },
      useSharedValue: jest.fn((init: number) => ({ value: init })),
      useAnimatedStyle: jest.fn((fn: () => object) => fn()),
      withTiming: jest.fn((toValue: number) => toValue),
      interpolateColor: jest.fn(
         (_p: number, _i: number[], output: string[]) => output[0],
      ),
   };
});

jest.mock('expo-haptics', () => ({
   notificationAsync: jest.fn(),
   NotificationFeedbackType: { Error: 'error', Success: 'success', Warning: 'warning' },
}));

jest.mock('@/contexts/MyThemeContext', () => ({
   useMyTheme: () => ({
      colors: {
         inputBackground: '#F5F5F5',
         inputText: '#000000',
         inputBorder: '#DDDDDD',
         textMuted: '#808080',
         error: '#DC3545',
      },
      spacing: { s: 8, m: 16, l: 24, xl: 32 },
   }),
}));

jest.mock('@/components/PlatformIcon', () => {
   const React = require('react');
   const { Text } = require('react-native');
   return function MockPlatformIcon(props: { name: string }) {
      return React.createElement(Text, { testID: 'platform-icon' }, props.name);
   };
});

describe('MyTextInput', () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   // ── Rendering ──────────────────────────────────────────────

   it('renders with placeholder text', () => {
      const { getByPlaceholderText } = render(
         <MyTextInput placeholder="Email" />,
      );
      expect(getByPlaceholderText('Email')).toBeTruthy();
   });

   it('forwards value and calls onChangeText', () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue } = render(
         <MyTextInput value="hello" onChangeText={onChangeText} />,
      );

      expect(getByDisplayValue('hello')).toBeTruthy();
      fireEvent.changeText(getByDisplayValue('hello'), 'world');
      expect(onChangeText).toHaveBeenCalledWith('world');
   });

   it('forwards ref to underlying TextInput', () => {
      const ref = createRef<TextInput>();
      render(<MyTextInput ref={ref} placeholder="Test" />);
      expect(ref.current).not.toBeNull();
   });

   // ── Password toggle ───────────────────────────────────────

   it('does not render toggle when secureTextEntry is not set', () => {
      const { queryByRole } = render(<MyTextInput placeholder="Email" />);
      expect(queryByRole('button')).toBeNull();
   });

   it('renders toggle when secureTextEntry is set', () => {
      const { getByRole } = render(
         <MyTextInput placeholder="Password" secureTextEntry />,
      );
      expect(getByRole('button')).toBeTruthy();
   });

   it('toggles password visibility on press', () => {
      const { getByPlaceholderText, getByLabelText } = render(
         <MyTextInput placeholder="Password" secureTextEntry />,
      );

      // Initially hidden
      expect(getByPlaceholderText('Password').props.secureTextEntry).toBe(true);

      // Press toggle → visible
      fireEvent.press(getByLabelText('Show password'));
      expect(getByPlaceholderText('Password').props.secureTextEntry).toBe(false);

      // Press again → hidden
      fireEvent.press(getByLabelText('Hide password'));
      expect(getByPlaceholderText('Password').props.secureTextEntry).toBe(true);
   });

   // ── Haptic feedback ───────────────────────────────────────

   it('triggers haptic when error first appears', () => {
      const { rerender } = render(<MyTextInput placeholder="Email" />);
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();

      rerender(<MyTextInput placeholder="Email" error="Required" />);
      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
         Haptics.NotificationFeedbackType.Error,
      );
   });

   it('does not re-trigger haptic when error message changes', () => {
      const { rerender } = render(
         <MyTextInput placeholder="Email" error="Required" />,
      );
      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();

      rerender(<MyTextInput placeholder="Email" error="Invalid format" />);
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
   });

   it('re-triggers haptic when error clears then reappears', () => {
      const { rerender } = render(
         <MyTextInput placeholder="Email" error="Required" />,
      );
      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();

      // Clear error
      rerender(<MyTextInput placeholder="Email" />);
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();

      // Error reappears
      rerender(<MyTextInput placeholder="Email" error="Required" />);
      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
   });

   it('does not trigger haptic when rendered without error', () => {
      render(<MyTextInput placeholder="Email" />);
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
   });
});
