type FeatureName = 'cloudSync' | 'unlimitedStorage' | 'advancedFeatures';

export const useFeatureAccess = () => {
  // TODO: Replace with Supabase auth state
  const isSignedIn = false;

  const hasFeature = (feature: FeatureName): boolean => {
    return !!isSignedIn;
  };

  const canAccessCloudSync = hasFeature('cloudSync');
  const canAccessUnlimitedStorage = hasFeature('unlimitedStorage');
  const canAccessAdvancedFeatures = hasFeature('advancedFeatures');

  return {
    isAuthenticated: !!isSignedIn,
    hasFeature,
    canAccessCloudSync,
    canAccessUnlimitedStorage,
    canAccessAdvancedFeatures,
  };
};
