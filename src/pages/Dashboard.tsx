import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";
import { SubscriptionChart } from "@/components/dashboard/SubscriptionChart";
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Mail, 
  Inbox, 
  ArrowRight,
  RefreshCw,
  Download,
  ShoppingBag
} from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useInsights } from "@/hooks/useInsights";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { 
    subscriptions, 
    expenses,
    gmailAccounts,
    insightSummary,
    categoryBreakdowns,
    timelineData,
    isLoading,
    connectAccount
  } = useInsights();

  const [newAccountEmail, setNewAccountEmail] = React.useState("");
  const [newAccountName, setNewAccountName] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleConnect = async () => {
    if (newAccountEmail && newAccountName) {
      await connectAccount(newAccountEmail, newAccountName);
      setNewAccountEmail("");
      setNewAccountName("");
      setIsDialogOpen(false);
    }
  };

  // Get the most recent expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <AppLayout>
      <div className="container-app animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Connect Gmail
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect Gmail Account</DialogTitle>
                  <DialogDescription>
                    Enter your Gmail account details to connect and analyze your emails.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAccountEmail}
                      onChange={(e) => setNewAccountEmail(e.target.value)}
                      className="col-span-3"
                      placeholder="your.email@gmail.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Account Name
                    </Label>
                    <Input
                      id="name"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                      className="col-span-3"
                      placeholder="Personal, Work, etc."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleConnect}>Connect Account</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Insight Stats */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <StatCard
            title="Monthly Subscriptions"
            value={formatCurrency(insightSummary.totalSubscriptionAmount)}
            description={`${insightSummary.totalSubscriptions} active subscriptions`}
            icon={<CreditCard className="h-4 w-4" />}
          />
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(insightSummary.monthlyExpenseAmount)}
            description={`${insightSummary.totalExpenses} transactions tracked`}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Recent Expenses */}
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Expenses</CardTitle>
                  <CardDescription>Your latest transactions</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  {recentExpenses.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No recent expenses found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={expense.logoUrl} />
                              <AvatarFallback>{expense.merchant[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{expense.merchant}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(expense.date), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(expense.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/expenses">
                      View All Expenses
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Upcoming Subscriptions */}
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Upcoming Subscriptions</CardTitle>
                  <CardDescription>Due in the next 7 days</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  {subscriptions.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No upcoming subscriptions
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {subscriptions
                        .filter(sub => {
                          const today = new Date();
                          const billingDate = new Date(sub.billingDate);
                          const diffTime = billingDate.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return diffDays >= 0 && diffDays <= 7;
                        })
                        .slice(0, 3)
                        .map((subscription) => (
                          <div key={subscription.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={subscription.logoUrl} />
                                <AvatarFallback>{subscription.serviceName[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{subscription.serviceName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Due {format(new Date(subscription.billingDate), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold">
                              {formatCurrency(subscription.amount)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/subscriptions">
                      View All Subscriptions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Spending by Category */}
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Spending by Category</CardTitle>
                  <CardDescription>Top spending categories</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  {categoryBreakdowns.expenses.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No category data available
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categoryBreakdowns.expenses
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 3)
                        .map((category) => (
                          <div key={category.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-9 w-9 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${category.color}20` }}
                              >
                                <ShoppingBag 
                                  className="h-5 w-5" 
                                  style={{ color: category.color }} 
                                />
                              </div>
                              <div>
                                <p className="font-medium">{category.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {Math.round((category.value / insightSummary.monthlyExpenseAmount) * 100)}% of total
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold">
                              {formatCurrency(category.value)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/expenses">
                      View All Categories
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Spending Timeline */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Spending Timeline</CardTitle>
                <CardDescription>Your spending over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timelineData.expenses}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <RechartsTooltip formatter={(value) => [`$${value}`, "Amount"]} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8B5CF6"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Your Subscriptions</CardTitle>
                    <CardDescription>
                      Manage and track all your subscriptions
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/subscriptions">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <SubscriptionList 
                  subscriptions={subscriptions.slice(0, 5)} 
                  isLoading={isLoading} 
                  compact 
                />
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Subscription Breakdown</CardTitle>
                <CardDescription>
                  Your subscriptions by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionChart data={categoryBreakdowns.subscriptions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subscription Insights</CardTitle>
                  <CardDescription>
                    Overview of your subscription spending
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <span>Total Monthly Cost</span>
                      <span className="font-semibold">{formatCurrency(insightSummary.totalSubscriptionAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <span>Active Subscriptions</span>
                      <span className="font-semibold">{insightSummary.totalSubscriptions}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <span>Average Cost per Subscription</span>
                      <span className="font-semibold">
                        {insightSummary.totalSubscriptions > 0
                          ? formatCurrency(insightSummary.totalSubscriptionAmount / insightSummary.totalSubscriptions)
                          : "$0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <span>Annual Subscription Cost</span>
                      <span className="font-semibold">{formatCurrency(insightSummary.totalSubscriptionAmount * 12)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Expense Insights</CardTitle>
                  <CardDescription>
                    Overview of your general spending
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <span>Total Monthly Expenses</span>
                      <span className="font-semibold">{formatCurrency(insightSummary.monthlyExpenseAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <span>Tracked Transactions</span>
                      <span className="font-semibold">{insightSummary.totalExpenses}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <span>Average Transaction Amount</span>
                      <span className="font-semibold">
                        {insightSummary.totalExpenses > 0
                          ? formatCurrency(insightSummary.monthlyExpenseAmount / insightSummary.totalExpenses)
                          : "$0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <span>Subscription to Expense Ratio</span>
                      <span className="font-semibold">
                        {insightSummary.monthlyExpenseAmount > 0
                          ? `${Math.round((insightSummary.totalSubscriptionAmount / insightSummary.monthlyExpenseAmount) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
