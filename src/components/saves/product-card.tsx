import { useMyTheme } from '@/contexts/MyThemeContext';
import type { ProductSnapshot } from '@/types/save';
import { formatPrice } from '@/utils/format-price';
import { Image } from 'expo-image';
import {
   Pressable,
   StyleProp,
   StyleSheet,
   Text,
   View,
   ViewStyle,
} from 'react-native';

export type ProductCardProps = {
   snapshot: ProductSnapshot;
   onPress?: () => void;
   width: number;
   style?: StyleProp<ViewStyle>;
};

export default function ProductCard({
   snapshot,
   onPress,
   width,
   style,
}: ProductCardProps) {
   const { colors } = useMyTheme();
   const imageUri = snapshot.images[0] ?? null;
   const title = snapshot.title?.trim() || 'Untitled item';
   const priceLabel = formatPrice(snapshot.price_cents, snapshot.currency);

   return (
      <Pressable
         accessibilityRole="button"
         accessibilityLabel={title}
         onPress={onPress}
         style={({ pressed }) => [
            styles.card,
            {
               width,
               opacity: pressed ? 0.88 : 1,
            },
            style,
         ]}
      >
         <View
            style={[
               styles.imageFrame,
               {
                  width,
                  height: width,
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
               },
            ]}
         >
            {imageUri ? (
               <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
               />
            ) : (
               <View style={styles.imagePlaceholder}>
                  <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
                     No image
                  </Text>
               </View>
            )}
         </View>

         <Text
            selectable
            numberOfLines={2}
            style={[
               styles.title,
               {
                  color: colors.text,
                  marginTop: 4,
               },
            ]}
         >
            {title}
         </Text>

         <Text
            numberOfLines={1}
            style={[
               styles.price,
               {
                  color: priceLabel ? colors.text : colors.textMuted,
                  marginTop: 4,
               },
            ]}
         >
            {priceLabel ?? 'Price unavailable'}
         </Text>
      </Pressable>
   );
}

const styles = StyleSheet.create({
   card: {
      alignItems: 'stretch',
   },
   imageFrame: {
      borderRadius: 12,
      borderCurve: 'continuous',
      borderWidth: 1,
      overflow: 'hidden',
   },
   image: {
      width: '100%',
      height: '100%',
   },
   imagePlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
   },
   placeholderText: {
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
   },
   title: {
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 17,
   },
   price: {
      fontSize: 12,
      fontWeight: '500',
   },
});
