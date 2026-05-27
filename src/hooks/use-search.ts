import { useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import type { NativeSyntheticEvent, TextInputFocusEventData } from "react-native";

type HeaderSearchBarOptions = {
   placeholder?: string;
   hideWhenScrolling?: boolean;
   placement?: "automatic" | "inline" | "stacked";
   autoCapitalize?: "none" | "sentences" | "words" | "characters";
   onChangeText?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
   onSearchButtonPress?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
   onCancelButtonPress?: () => void;
};

export function useSearch(options: HeaderSearchBarOptions = {}) {
   const [search, setSearch] = useState("");
   const navigation = useNavigation();

   const {
      placeholder = "Search wishlists",
      hideWhenScrolling = false,
      placement = "stacked",
      autoCapitalize = "none",
      onChangeText,
      onSearchButtonPress,
      onCancelButtonPress,
   } = options;

   useLayoutEffect(() => {
      navigation.setOptions({
         headerShown: true,
         headerLargeTitle: true,
         headerSearchBarOptions: {
            placeholder,
            hideWhenScrolling,
            placement,
            autoCapitalize,
            onChangeText(event: NativeSyntheticEvent<TextInputFocusEventData>) {
               setSearch(event.nativeEvent.text);
               onChangeText?.(event);
            },
            onSearchButtonPress(event: NativeSyntheticEvent<TextInputFocusEventData>) {
               setSearch(event.nativeEvent.text);
               onSearchButtonPress?.(event);
            },
            onCancelButtonPress() {
               setSearch("");
               onCancelButtonPress?.();
            },
         },
      });
   }, [
      navigation,
      placeholder,
      hideWhenScrolling,
      placement,
      autoCapitalize,
      onChangeText,
      onSearchButtonPress,
      onCancelButtonPress,
   ]);

   return search;
}
