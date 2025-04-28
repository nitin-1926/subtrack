export interface Subscription {
  id: string;
  serviceName: string;
  amount: number;
  billingDate: string;
  status: "active" | "inactive" | "cancelled";
  category: string;
  logoUrl: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
