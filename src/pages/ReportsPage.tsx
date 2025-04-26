import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Download, Calendar, PieChart as PieChartIcon, BarChart as BarChartIcon, Mail, ShoppingBag } from "lucide-react";
import { useInsights } from "@/hooks/useInsights";
import { formatCurrency } from "@/lib/utils";
import { 
  FileText, 
  CreditCard,
  Filter,
  ChevronDown,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ReportsPage = () => {
  const { 
    subscriptions, 
    expenses, 
    categoryBreakdowns, 
    timelineData,
    insightSummary
  } = useInsights();
  
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedReportType, setSelectedReportType] = useState("all");
  
  // Sample monthly data - would come from API in a real app
  const monthlyData = timelineData.expenses;
  const categoryData = categoryBreakdowns.expenses;

  return (
    <AppLayout>
      <div className="container-app animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
          <div className="flex gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Download className="h-4 w-4" />
                  Export
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  CSV Data
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{insightSummary.totalSubscriptions}</h3>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{formatCurrency(insightSummary.totalSubscriptionAmount)}</h3>
                <p className="text-sm text-muted-foreground">Monthly Subscription Cost</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{insightSummary.totalExpenses}</h3>
                <p className="text-sm text-muted-foreground">Tracked Expenses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{insightSummary.connectedAccounts}</h3>
                <p className="text-sm text-muted-foreground">Connected Accounts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Monthly Spending</CardTitle>
                  <CardDescription>Expenses over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
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

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>Breakdown of expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Distribution</CardTitle>
                  <CardDescription>By category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryBreakdowns.subscriptions}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryBreakdowns.subscriptions.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Expenses</CardTitle>
                  <CardDescription>Highest spending categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryBreakdowns.expenses.slice(0, 5)}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="value" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="detailed">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Subscription Report</CardTitle>
                      <CardDescription>
                        Detailed breakdown of your subscriptions
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="software">Software</SelectItem>
                          <SelectItem value="music">Music</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div key={subscription.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{subscription.serviceName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {subscription.category} • Renews {format(new Date(subscription.billingDate), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(subscription.amount)}</p>
                          <p className="text-sm text-muted-foreground">Monthly</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Showing {subscriptions.length} subscriptions
                    </p>
                  </div>
                  <div className="font-semibold">
                    Total: {formatCurrency(insightSummary.totalSubscriptionAmount)}
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Expense Report</CardTitle>
                      <CardDescription>
                        Detailed breakdown of your expenses
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="shopping">Shopping</SelectItem>
                          <SelectItem value="food">Food & Drink</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenses.slice(0, 5).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{expense.merchant}</h4>
                            <p className="text-sm text-muted-foreground">
                              {expense.category} • {format(new Date(expense.date), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.description ? expense.description.substring(0, 20) : "No description"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Showing 5 of {expenses.length} expenses
                    </p>
                  </div>
                  <div className="font-semibold">
                    Total: {formatCurrency(insightSummary.monthlyExpenseAmount)}
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Summary Statistics</CardTitle>
                  <CardDescription>
                    Key metrics for your financial tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Subscriptions</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Count</span>
                          <span>{insightSummary.totalSubscriptions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Cost</span>
                          <span>{formatCurrency(insightSummary.totalSubscriptionAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annual Cost</span>
                          <span>{formatCurrency(insightSummary.totalSubscriptionAmount * 12)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Average Cost</span>
                          <span>
                            {insightSummary.totalSubscriptions > 0
                              ? formatCurrency(
                                  insightSummary.totalSubscriptionAmount / insightSummary.totalSubscriptions
                                )
                              : formatCurrency(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Expenses</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Count</span>
                          <span>{insightSummary.totalExpenses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount</span>
                          <span>{formatCurrency(insightSummary.monthlyExpenseAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Average Amount</span>
                          <span>
                            {insightSummary.totalExpenses > 0
                              ? formatCurrency(
                                  insightSummary.monthlyExpenseAmount / insightSummary.totalExpenses
                                )
                              : formatCurrency(0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Categories</span>
                          <span>{categoryBreakdowns.expenses.length}</span>
                        </div>
                      </div>
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

export default ReportsPage;
