
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";
import { AddSubscriptionForm } from "@/components/subscriptions/AddSubscriptionForm";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";

const SubscriptionsPage = () => {
  const { subscriptions, isLoading } = useSubscriptions();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("amount-desc");

  const filteredSubscriptions = subscriptions
    .filter(
      (sub) =>
        sub.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case "amount-asc":
          return a.amount - b.amount;
        case "amount-desc":
          return b.amount - a.amount;
        case "name-asc":
          return a.serviceName.localeCompare(b.serviceName);
        case "name-desc":
          return b.serviceName.localeCompare(a.serviceName);
        case "date-asc": {
          const dateA = new Date(a.billingDate);
          const dateB = new Date(b.billingDate);
          return dateA.getTime() - dateB.getTime();
        }
        case "date-desc": {
          const dateA = new Date(a.billingDate);
          const dateB = new Date(b.billingDate);
          return dateB.getTime() - dateA.getTime();
        }
        default:
          return 0;
      }
    });

  return (
    <AppLayout>
      <div className="container-app animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold">Subscriptions</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                className="pl-8 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              defaultValue="amount-desc"
              onValueChange={(value) => setSortOrder(value)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount-desc">Price: High to Low</SelectItem>
                <SelectItem value="amount-asc">Price: Low to High</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
                <SelectItem value="date-asc">Date: Soonest</SelectItem>
                <SelectItem value="date-desc">Date: Latest</SelectItem>
              </SelectContent>
            </Select>
            <AddSubscriptionForm />
          </div>
        </div>

        <SubscriptionList 
          subscriptions={filteredSubscriptions} 
          isLoading={isLoading} 
        />
      </div>
    </AppLayout>
  );
};

export default SubscriptionsPage;
