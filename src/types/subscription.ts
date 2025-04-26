
export interface Subscription {
  id: string;
  serviceName: string;
  amount: number;
  billingDate: string;
  renewalDate?: string;
  status: 'active' | 'canceled';
  category?: string;
  logoUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}
