import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Subscription } from '@/types/subscription';

interface SubscriptionListProps {
	subscriptions: Subscription[];
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({ subscriptions }) => {
	if (!subscriptions.length) {
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground">No subscriptions found</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{subscriptions.map(subscription => (
				<div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
					<div className="flex items-center gap-4">
						<Avatar className="h-10 w-10">
							<AvatarImage src={subscription.logoUrl} />
							<AvatarFallback>{subscription.serviceName[0]}</AvatarFallback>
						</Avatar>
						<div>
							<h4 className="font-medium">{subscription.serviceName}</h4>
							<p className="text-sm text-muted-foreground">
								Next billing: {format(new Date(subscription.billingDate), 'MMM d, yyyy')}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<Badge variant={subscription.status === 'active' ? 'default' : 'outline'}>
							{subscription.category}
						</Badge>
						<span className="font-semibold">{formatCurrency(subscription.amount)}</span>
						<div className="flex gap-2">
							<Button size="sm" variant="ghost" asChild>
								<Link href={`/dashboard/subscriptions/edit/${subscription.id}`}>
									<Pencil className="h-4 w-4" />
								</Link>
							</Button>
							<Button size="sm" variant="ghost" className="text-destructive">
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};
