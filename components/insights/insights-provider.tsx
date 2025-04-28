'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useInsights } from '@/hooks/useInsights';

export const InsightsContext = createContext<ReturnType<typeof useInsights> | undefined>(undefined);

export const InsightsProvider = ({ children }: { children: ReactNode }) => {
	const insights = useInsights();

	return <InsightsContext.Provider value={insights}>{children}</InsightsContext.Provider>;
};

export const useInsightsContext = () => {
	const context = useContext(InsightsContext);
	if (context === undefined) {
		throw new Error('useInsightsContext must be used within an InsightsProvider');
	}
	return context;
};
