
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
    // Navigation
    back = 'back',
    close = 'close',
    menu = 'menu',

    // Actions
    plus = 'plus',
    compose = 'compose',
    search = 'search',
    filter = 'filter',
    download = 'download',
    share = 'share',
    replay = 'replay',
    flip = 'flip',
    checkmark = 'checkmark',

    // User & Social
    profile = 'profile',
    friends = 'friends',
    logout = 'logout',

    // Auth & Security
    eye = 'eye',
    eyeOff = 'eyeOff',
    lock = 'lock',
    shield = 'shield',

    // Communication
    bell = 'bell',
    mail = 'mail',

    // Content & Media
    camera = 'camera',
    photo = 'photo',
    link = 'link',
    gift = 'gift',
    tray = 'tray',
    clipboard = 'clipboard',

    // Settings & Preferences
    settings = 'settings',
    appearance = 'appearance',
    moon = 'moon',
    help = 'help',
}

const iconMap: Record<AvailableIcons, { ios: SFSymbol; android: keyof typeof MaterialIcons.glyphMap }> = {

    // Navigation
    back: { ios: 'chevron.left', android: 'arrow-back' },
    close: { ios: 'xmark', android: 'close' },
    menu: { ios: 'info.circle', android: 'menu' },

    // Actions
    plus: { ios: 'plus', android: 'add' },
    compose: { ios: 'square.and.pencil', android: 'create' },
    search: { ios: 'magnifyingglass', android: 'search' },
    filter: { ios: 'line.3.horizontal.decrease', android: 'filter' },
    download: { ios: 'square.and.arrow.down', android: 'download' },
    share: { ios: 'square.and.arrow.up', android: 'share' },
    replay: { ios: 'arrow.counterclockwise', android: 'replay' },
    flip: { ios: 'arrow.triangle.2.circlepath', android: 'flip' },
    checkmark: { ios: 'checkmark', android: 'check' },

    // User & Social
    profile: { ios: 'person.circle', android: 'person' },
    friends: { ios: 'person.badge.plus', android: 'people' },
    logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout' },

    // Auth & Security
    eye: { ios: 'eye', android: 'visibility' },
    eyeOff: { ios: 'eye.slash', android: 'visibility-off' },
    lock: { ios: 'lock', android: 'lock' },
    shield: { ios: 'hand.raised', android: 'security' },

    // Communication
    bell: { ios: 'bell', android: 'notifications' },
    mail: { ios: 'envelope', android: 'mail' },

    // Content & Media
    camera: { ios: 'camera', android: 'photo-camera' },
    photo: { ios: 'photo.on.rectangle.angled', android: 'photo-library' },
    link: { ios: 'link', android: 'link' },
    gift: { ios: 'gift', android: 'cake' },
    tray: { ios: 'tray', android: 'inbox' },
    clipboard: { ios: 'list.clipboard', android: 'content-paste' },

    // Settings & Preferences
    settings: { ios: 'gearshape', android: 'settings' },
    appearance: { ios: 'paintbrush', android: 'palette' },
    moon: { ios: 'moon', android: 'dark-mode' },
    help: { ios: 'questionmark.circle', android: 'help-outline' },
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