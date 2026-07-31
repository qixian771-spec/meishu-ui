import { createContext, useContext } from 'react';

export const GlassDepthContext = createContext(0);

export function useGlassDepth(): number {
  return useContext(GlassDepthContext);
}
