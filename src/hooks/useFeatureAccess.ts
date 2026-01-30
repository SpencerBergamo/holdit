import { useConvexAuth } from 'convex/react';

type FeatureName = 'cloudSync' | 'unlimitedStorage' | 'advancedFeatures';

export const useFeatureAccess = () => {
  const { isAuthenticated } = useConvexAuth();

  const hasFeature = (feature: FeatureName): boolean => {
    return !!isAuthenticated;
  };

  const canAccessCloudSync = hasFeature('cloudSync');
  const canAccessUnlimitedStorage = hasFeature('unlimitedStorage');
  const canAccessAdvancedFeatures = hasFeature('advancedFeatures');

  return {
    isAuthenticated,
    hasFeature,
    canAccessCloudSync,
    canAccessUnlimitedStorage,
    canAccessAdvancedFeatures,
  };
};
