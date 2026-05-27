
import { useTheme } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { SFSymbol, SymbolView } from 'expo-symbols';
import { Platform } from 'react-native';

type IconName = { ios: SFSymbol; android: string }

interface PlatformIconProps {
    name: AvailableIcons;
    size?: number;
    color?: string;
}

export const enum AvailableIcons {
    profile = 'profile',
    eye = 'eye',
    eyeOff = 'eyeOff',
    menu = 'menu',
    download = 'download',
    share = 'share',
    plus = 'plus',
    compose = 'compose',
    home = 'home',
    homeFill = 'homeFill',
    search = 'search',
    filter = 'filter',
    camera = 'camera',
    close = 'close',
    settings = 'settings',
    appearance = 'appearance',
    bell = 'bell',
    moon = 'moon',
    lock = 'lock',
    shield = 'shield',
    help = 'help',
    mail = 'mail',
    logout = 'logout',
    friends = 'friends',
    replay = 'replay',
    checkmark = 'checkmark',
    flip = 'flip',
    tray = 'tray',
    link = 'link',
    photo = 'photo',
}

const iconMap: Record<AvailableIcons, { ios: SFSymbol; android: keyof typeof MaterialIcons.glyphMap }> = {
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
    settings: { ios: 'gearshape', android: 'settings' },
    appearance: { ios: 'paintbrush', android: 'palette' },
    bell: { ios: 'bell', android: 'notifications' },
    moon: { ios: 'moon', android: 'dark-mode' },
    lock: { ios: 'lock', android: 'lock' },
    shield: { ios: 'hand.raised', android: 'security' },
    help: { ios: 'questionmark.circle', android: 'help-outline' },
    mail: { ios: 'envelope', android: 'mail' },
    logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout' },
    friends: { ios: 'person.badge.plus', android: 'people' },
    replay: { ios: 'arrow.counterclockwise', android: 'replay' },
    checkmark: { ios: 'checkmark', android: 'check' },
    flip: { ios: 'arrow.triangle.2.circlepath', android: 'flip' },
    tray: { ios: 'tray', android: 'inbox' },
    link: { ios: 'link', android: 'link' },
    photo: { ios: 'photo.on.rectangle.angled', android: 'photo-library' },
}


export default function PlatformIcon({ name, size = 24, color }: PlatformIconProps) {
    const { colors } = useTheme();
    const mapped = iconMap[name];
    const iconColor = color ?? colors.text;

    if (Platform.OS === 'ios') {
        return (
            <SymbolView
                name={mapped.ios}
                size={size}
                tintColor={iconColor}
            />
        );
    }

    return (
        <MaterialIcons
            name={mapped.android}
            size={size}
            color={iconColor}
        />
    );
}