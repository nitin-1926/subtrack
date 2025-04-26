
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Subscription } from "@/types/subscription";

interface SubscriptionCardProps {
  subscription: Subscription;
}

export const SubscriptionCard = ({ subscription }: SubscriptionCardProps) => {
  const { serviceName, amount, billingDate, logoUrl } = subscription;
  
  // Format the billing date to a readable string
  const formattedDate = new Date(billingDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
  
  // Calculate days until next billing
  const today = new Date();
  const nextBillingDate = new Date(billingDate);
  nextBillingDate.setMonth(today.getMonth());
  if (nextBillingDate < today) {
    nextBillingDate.setMonth(today.getMonth() + 1);
  }
  const daysUntil = Math.ceil((nextBillingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Card className="subscription-card">
      <CardHeader className="p-0 pb-3 space-y-0 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={serviceName} className="w-8 h-8 object-contain" />
          ) : (
            <div className="w-8 h-8 bg-brand-100 rounded-md flex items-center justify-center">
              <span className="text-brand-700 font-medium text-sm">
                {serviceName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h3 className="font-medium">{serviceName}</h3>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 space-y-3">
        <div className="flex justify-between items-end">
          <p className="text-2xl font-semibold">{formatCurrency(amount)}</p>
          <div className="text-right">
            <p className="text-sm text-gray-500">Next payment</p>
            <p className="text-sm font-medium">{formattedDate}</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {daysUntil <= 0
            ? "Due today"
            : daysUntil === 1
            ? "Due tomorrow"
            : `Due in ${daysUntil} days`}
        </div>
      </CardContent>
    </Card>
  );
};
