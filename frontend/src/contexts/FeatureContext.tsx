'use client';

import { createContext, useContext, ReactNode } from 'react';

interface FeatureContextType {
  showLogin: boolean;
  showRegistration: boolean;
}

const features: FeatureContextType = {
  showLogin: process.env.NEXT_PUBLIC_SHOW_LOGIN === 'true',
  showRegistration: process.env.NEXT_PUBLIC_SHOW_REGISTRATION === 'true',
};

const FeatureContext = createContext<FeatureContextType>(features);

export function FeatureProvider({ children }: { children: ReactNode }) {
  return (
    <FeatureContext.Provider value={features}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures() {
  return useContext(FeatureContext);
} 