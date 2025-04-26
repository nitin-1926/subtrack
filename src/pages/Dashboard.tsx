import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";
import { SubscriptionChart } from "@/components/dashboard/SubscriptionChart";
import { AddSubscriptionForm } from "@/components/subscriptions/AddSubscriptionForm";
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Mail, 
  Inbox, 
  FileText, 
  ArrowRight,
  RefreshCw,
  Download
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
    newsletters, 
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

  // Get unread newsletters
  const unreadNewsletters = newsletters.filter(n => !n.read).slice(0, 3);

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
            <AddSubscriptionForm />
          </div>
        </div>

        {/* Connected Accounts Summary */}
        {gmailAccounts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Connected Accounts</h2>
            <div className="flex flex-wrap gap-2">
              {gmailAccounts.map((account) => (
                <div 
                  key={account.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                    account.connected 
                      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30" 
                      : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/30"
                  }`}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={account.avatarUrl} />
                    <AvatarFallback>{account.email[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{account.email}</span>
                  {account.connected ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      Disconnected
                    </Badge>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" className="h-10" onClick={() => setIsDialogOpen(true)}>
                <Mail className="h-4 w-4 mr-1" />
                Add Account
              </Button>
            </div>
          </div>
        )}

        {/* Insight Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
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
          <StatCard
            title="Newsletters"
            value={insightSummary.unreadNewsletters.toString()}
            description="Unread newsletters"
            icon={<FileText className="h-4 w-4" />}
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
                                {format(new Date(expense.date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link to="/expenses" className="w-full">
                    <Button variant="ghost" size="sm" className="w-full">
                      View All Expenses
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Unread Newsletters */}
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Unread Newsletters</CardTitle>
                  <CardDescription>Your latest newsletters</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  {unreadNewsletters.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No unread newsletters
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {unreadNewsletters.map((newsletter) => (
                        <div key={newsletter.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={newsletter.logoUrl} />
                              <AvatarFallback>{newsletter.sender[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{newsletter.sender}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {newsletter.subject}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            New
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link to="/newsletters" className="w-full">
                    <Button variant="ghost" size="sm" className="w-full">
                      View All Newsletters
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Spending Trends */}
              <Card className="lg:col-span-1 md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Spending Trends</CardTitle>
                  <CardDescription>6-month expense history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={timelineData.expenses}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <RechartsTooltip formatter={(value) => [`$${value}`, 'Amount']} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8B5CF6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/reports" className="w-full">
                    <Button variant="ghost" size="sm" className="w-full">
                      View Detailed Reports
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscriptions">
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Your Subscriptions</h2>
                <SubscriptionList subscriptions={subscriptions} isLoading={isLoading} />
              </div>
              <div>
                <SubscriptionChart data={categoryBreakdowns.subscriptions} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Email Insights</CardTitle>
                  <CardDescription>Summary of your email data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Inbox className="h-4 w-4 text-primary" />
                      <span>Connected Accounts</span>
                    </div>
                    <span className="font-semibold">{insightSummary.connectedAccounts}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Total Newsletters</span>
                    </div>
                    <span className="font-semibold">{insightSummary.totalNewsletters}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span>Total Expenses</span>
                    </div>
                    <span className="font-semibold">{insightSummary.totalExpenses}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/accounts" className="w-full">
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Email Accounts
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                  <CardDescription>Download insights as reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border border-dashed flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Monthly Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete overview of your monthly activity
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg border border-dashed flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Subscription Report</h3>
                      <p className="text-sm text-muted-foreground">
                        Detailed breakdown of all subscriptions
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg border border-dashed flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Expense Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Spending patterns and category breakdown
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/reports" className="w-full">
                    <Button className="w-full">
                      View All Reports
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
