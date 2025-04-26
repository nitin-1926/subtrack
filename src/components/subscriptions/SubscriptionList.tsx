import React from "react";
import { SubscriptionCard } from "./SubscriptionCard";
import { Subscription } from "@/types/subscription";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  isLoading?: boolean;
  compact?: boolean;
}

export const SubscriptionList = ({ 
  subscriptions, 
  isLoading = false,
  compact = false 
}: SubscriptionListProps) => {
  if (isLoading) {
    return (
      <div className={compact 
        ? "space-y-4" 
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      }>
        {[...Array(compact ? 3 : 6)].map((_, i) => (
          <div 
            key={i} 
            className={compact 
              ? "h-16 bg-gray-100 animate-pulse rounded-lg" 
              : "h-36 bg-gray-100 animate-pulse rounded-xl"
            }
          />
        ))}
      </div>
    );
  }

  if (!subscriptions.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No subscriptions found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Connect your email or add subscriptions manually to get started.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {subscriptions.map((subscription) => (
          <div key={subscription.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={subscription.logoUrl} />
                <AvatarFallback>{subscription.serviceName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{subscription.serviceName}</p>
                <p className="text-xs text-muted-foreground">
                  Next billing: {format(new Date(subscription.billingDate), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <span className="font-semibold">
              {formatCurrency(subscription.amount)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {subscriptions.map((subscription) => (
        <SubscriptionCard key={subscription.id} subscription={subscription} />
      ))}
    </div>
  );
};
