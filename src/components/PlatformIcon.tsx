
import { useTheme } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { SFSymbol, SymbolView } from 'expo-symbols';
import { Platform } from 'react-native';

type IconName = { ios: SFSymbol; android: string }

interface PlatformIconProps {
    name: IconName[keyof IconName];
    size?: number;
    color?: string;
}

const iconMap: Record<string, { ios: SFSymbol; android: keyof typeof MaterialIcons.glyphMap }> = {
    profile: { ios: 'person.circle', android: 'person' },
    eye: { ios: 'eye', android: 'visibility' },
    eyeOff: { ios: 'eye.slash', android: 'visibility-off' },
    menu: { ios: 'info.circle', android: 'menu' },
    download: { ios: 'square.and.arrow.down', android: 'download' },
    share: { ios: 'square.and.arrow.up', android: 'share' },
    plus: { ios: 'plus', android: 'add' },
    compose: { ios: 'square.and.pencil', android: 'create' },
    home: { ios: 'house', android: 'home' },
    homeFill: { ios: 'house.fill', android: 'home' },
    search: { ios: 'magnifyingglass', android: 'search' },
    filter: { ios: 'line.3.horizontal.decrease', android: 'filter' },
    camera: { ios: 'camera', android: 'photo-camera' },
    close: { ios: 'xmark', android: 'close' },
}

export default function PlatformIcon({ name, size = 24 }: PlatformIconProps) {
    const { colors } = useTheme();
    const mapped = iconMap[name];

    if (Platform.OS === 'ios') {
        return (
            <SymbolView
                name={mapped.ios}
                size={size}
                tintColor={colors.text}
            />
        );
    }

    return (
        <MaterialIcons
            name={mapped.android}
            size={size}
            color={colors.text}
        />
    );
}