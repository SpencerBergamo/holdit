import { useAuth } from '@/contexts/AuthContext';

type FeatureName = 'cloudSync' | 'unlimitedStorage' | 'advancedFeatures';

export const useFeatureAccess = () => {
  const { isGuest, session } = useAuth();

  const hasFeature = (feature: FeatureName): boolean => {
    // Guests don't have access to premium features
    if (isGuest) {
      return false;
    }

    // All authenticated users have full access
    // You can expand this later with subscription tiers
    return session !== null;
  };

  const canAccessCloudSync = hasFeature('cloudSync');
  const canAccessUnlimitedStorage = hasFeature('unlimitedStorage');
  const canAccessAdvancedFeatures = hasFeature('advancedFeatures');

  return {
    isGuest,
    isAuthenticated: session !== null,
    hasFeature,
    canAccessCloudSync,
    canAccessUnlimitedStorage,
    canAccessAdvancedFeatures,
  };
};
