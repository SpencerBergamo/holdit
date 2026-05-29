import { useTheme } from '@/constants/theme';
import type { Collection } from '@/types/collection';
import { MaterialIcons } from '@expo/vector-icons';
import { SymbolView } from 'expo-symbols';
import { Platform, StyleProp, Text, View, ViewStyle } from 'react-native';

type Props = Pick<Collection, 'name' | 'description' | 'visible_to_friends'> & {
  parentStyles?: StyleProp<ViewStyle>;
};

export default function CollectionCard({
  name,
  description,
  visible_to_friends,
  parentStyles,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={[
      parentStyles,
      {
        flexDirection: 'column',
        gap: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxHeight: 120,
      }
    ]}>

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
        }}>
          {name}
        </Text>

        {!visible_to_friends && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            paddingHorizontal: 8,
            backgroundColor: colors.surface,
          }}>
            {Platform.OS === 'ios'
              ? (
                <SymbolView name="lock" size={16} colors={colors.text} />
              ) : (
                <MaterialIcons name="lock" size={16} color={colors.text} />

              )}

            <Text style={{
              fontSize: 12,
              fontWeight: '500',
              color: colors.textMuted,
            }}>
              Private
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      <Text style={{
        fontSize: 14,
        fontWeight: '400',
        color: colors.textMuted,
      }}>
        {description}
      </Text>

    </View>
  );
}
