# Authentication Setup

## Overview

The app now includes authentication with guest mode support. Users can either sign in/create an account for full features, or continue as a guest with limited functionality.

## Features

### Authentication Flow
- **Sign In**: Users can sign in with email and password
- **Sign Up**: New users can create an account with email verification
- **Guest Mode**: Users can try the app using Supabase anonymous authentication (limited features)
- **Account Upgrade**: Guest users can upgrade to a full account, preserving all their data
- **Auto-redirect**: Unauthenticated users are redirected to sign-in page
- **Session persistence**: Auth state persists across app restarts

### Guest Mode Limitations
Guest users have restricted access to:
- Cloud sync (not available)
- Unlimited storage (not available)
- Advanced features (not available)

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx        # Auth state management with anonymous auth
├── hooks/
│   └── useFeatureAccess.ts   # Feature gating based on auth status
├── app/
│   ├── _layout.tsx           # Root layout with auth provider & redirects
│   ├── index.tsx             # Homepage (protected)
│   ├── sign-in.tsx           # Sign-in/sign-up screen
│   └── upgrade-account.tsx   # Upgrade guest to full account
└── utils/
    └── supabase.ts          # Supabase client
```

## Usage

### Check Authentication Status

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isGuest, session, signOut } = useAuth();
  
  if (isGuest) {
    return <Text>You're in guest mode</Text>;
  }
  
  return <Text>Welcome {user?.email}</Text>;
}
```

### Check Feature Access

```tsx
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

function MyFeature() {
  const { canAccessCloudSync, isGuest } = useFeatureAccess();
  
  if (!canAccessCloudSync) {
    return (
      <View>
        <Text>This feature requires an account</Text>
        <Button title="Sign In" />
      </View>
    );
  }
  
  return <CloudSyncComponent />;
}
```

### Sign Out

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();
  
  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };
  
  return <Button title="Sign Out" onPress={handleSignOut} />;
}
```

### Upgrade Guest Account

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

function UpgradePrompt() {
  const { isGuest, upgradeGuestAccount } = useAuth();
  const router = useRouter();
  
  if (!isGuest) return null;
  
  const handleUpgrade = async () => {
    // Navigate to upgrade screen
    router.push('/upgrade-account');
    
    // Or upgrade directly:
    // const result = await upgradeGuestAccount(email, password);
    // if (result.success) {
    //   Alert.alert('Success', 'Account upgraded!');
    // }
  };
  
  return (
    <View>
      <Text>You\'re using guest mode</Text>
      <Button title="Upgrade Account" onPress={handleUpgrade} />
    </View>
  );
}
```

## How It Works

1. **App Launch**: `AuthContext` checks for existing session (including anonymous sessions)
2. **Redirect Logic**: `_layout.tsx` redirects based on auth state
   - Not authenticated → `/sign-in`
   - Authenticated (including guests) → `/` (homepage)
3. **Sign In**: User signs in → session stored → redirect to homepage
4. **Guest Mode**: 
   - User clicks "Continue as Guest" → Supabase creates anonymous session → redirect to homepage with limited features
   - All data is stored with the anonymous user ID
5. **Account Upgrade**: 
   - Guest clicks "Upgrade Account" → navigates to `/upgrade-account`
   - User enters email/password → Supabase converts anonymous account to permanent account
   - All guest data is preserved and now linked to the permanent account
6. **Sign Out**: Clears session → redirect to sign-in

## Environment Variables

Make sure you have these in your `.env.local`:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

## Extending Features

To add more feature gates:

1. Add feature type in `useFeatureAccess.ts`:
```tsx
type FeatureName = 'cloudSync' | 'unlimitedStorage' | 'advancedFeatures' | 'yourFeature';
```

2. Add feature check:
```tsx
const canAccessYourFeature = hasFeature('yourFeature');
```

3. Use in components:
```tsx
const { canAccessYourFeature } = useFeatureAccess();
```
