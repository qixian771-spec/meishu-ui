import { createContext, useContext, type ReactNode } from 'react';

const PrecomposedDepthContext = createContext(0);

export function usePrecomposedDepth(): number {
  return useContext(PrecomposedDepthContext);
}

export function PrecomposedDepthProvider({
  depth,
  children,
}: {
  depth: number;
  children: ReactNode;
}) {
  return (
    <PrecomposedDepthContext.Provider value={depth}>{children}</PrecomposedDepthContext.Provider>
  );
}
