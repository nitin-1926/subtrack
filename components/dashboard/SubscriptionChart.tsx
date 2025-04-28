import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CategoryBreakdown } from '@/types/gmail';

// Chart colors
const COLORS = [
	'#A78BFA', // Muted purple
	'#93C5FD', // Soft blue
	'#6EE7B7', // Pastel green
	'#FCD34D', // Soft yellow
	'#FDA4AF', // Pastel red
	'#F9A8D4', // Soft pink
	'#A5B4FC', // Pastel indigo
	'#C4B5FD', // Lavender
	'#5EEAD4', // Pastel teal
];

interface SubscriptionChartProps {
	data: CategoryBreakdown[];
}

export const SubscriptionChart: React.FC<SubscriptionChartProps> = ({ data }) => {
	if (!data || data.length === 0) {
		return (
			<div className="h-[300px] flex items-center justify-center">
				<p className="text-muted-foreground">No data available</p>
			</div>
		);
	}

	return (
		<div className="h-[300px]">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						data={data}
						cx="50%"
						cy="50%"
						labelLine={false}
						outerRadius={80}
						fill="#8884d8"
						dataKey="value"
						nameKey="name"
						label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
					>
						{data.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
						))}
					</Pie>
					<Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
					<Legend />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
};
