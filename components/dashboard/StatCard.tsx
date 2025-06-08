import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
	title: string;
	value: string;
	description: string;
	icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon }) => {
	return (
		<Card className="overflow-hidden glass-card">
			<CardContent className="p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-medium text-foreground">{title}</h3>
					<div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground">
						{icon}
					</div>
				</div>
				<div className="space-y-1">
					<p className="text-3xl font-bold text-foreground">{value}</p>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
			</CardContent>
		</Card>
	);
};
