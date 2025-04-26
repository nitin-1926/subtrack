import { useContext } from 'react';
import InsightsContext, { InsightsContextType } from '@/context/InsightsContext';

export const useInsights = (): InsightsContextType => {
  const context = useContext(InsightsContext);
  if (context === undefined) {
    throw new Error("useInsights must be used within an InsightsProvider");
  }
  return context;
};

export default useInsights;
