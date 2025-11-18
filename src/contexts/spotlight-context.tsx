'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { IngressData } from '@/types/ingress';

interface SpotlightContextType {
  ingresses: IngressData[];
  setIngresses: (ingresses: IngressData[]) => void;
}

const SpotlightContext = createContext<SpotlightContextType | undefined>(undefined);

export function SpotlightProvider({ children }: { children: ReactNode }) {
  const [ingresses, setIngressesState] = useState<IngressData[]>([]);

  const setIngresses = useCallback((newIngresses: IngressData[]) => {
    setIngressesState(newIngresses);
  }, []);

  return (
    <SpotlightContext.Provider value={{ ingresses, setIngresses }}>
      {children}
    </SpotlightContext.Provider>
  );
}

export function useSpotlightIngresses() {
  const context = useContext(SpotlightContext);
  if (context === undefined) {
    throw new Error('useSpotlightIngresses must be used within a SpotlightProvider');
  }
  return context;
}
