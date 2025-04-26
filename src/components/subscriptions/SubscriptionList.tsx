
import React from "react";
import { SubscriptionCard } from "./SubscriptionCard";
import { Subscription } from "@/types/subscription";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  isLoading?: boolean;
}

export const SubscriptionList = ({ subscriptions, isLoading = false }: SubscriptionListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="h-36 bg-gray-100 animate-pulse rounded-xl"
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {subscriptions.map((subscription) => (
        <SubscriptionCard key={subscription.id} subscription={subscription} />
      ))}
    </div>
  );
};
