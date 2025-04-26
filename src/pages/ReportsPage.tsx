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
    newsletters, 
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

        <div className="mb-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Spending</CardTitle>
                    <CardDescription>
                      Subscription and expense costs over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis 
                          tickFormatter={(value) => `$${value}`}
                          domain={[0, 'dataMax + 20']}
                        />
                        <Tooltip 
                          formatter={(value) => [`${formatCurrency(Number(value))}`, "Amount"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expense Categories</CardTitle>
                    <CardDescription>
                      Spending by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <CardTitle>Monthly Summary Report</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      New
                    </Badge>
                  </div>
                  <CardDescription>
                    Comprehensive insights across all your data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">April 2025 Summary</h3>
                          <p className="text-sm text-muted-foreground">Generated on {format(new Date(), 'MMMM d, yyyy')}</p>
                        </div>
                        <Button variant="outline" size="sm" className="flex gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="flex flex-col p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm text-muted-foreground">Subscriptions</span>
                          <span className="text-lg font-semibold">{formatCurrency(insightSummary.totalSubscriptionAmount)}</span>
                        </div>
                        <div className="flex flex-col p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm text-muted-foreground">Expenses</span>
                          <span className="text-lg font-semibold">{formatCurrency(insightSummary.monthlyExpenseAmount)}</span>
                        </div>
                        <div className="flex flex-col p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm text-muted-foreground">Newsletters</span>
                          <span className="text-lg font-semibold">{insightSummary.totalNewsletters}</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">March 2025 Summary</h3>
                          <p className="text-sm text-muted-foreground">Generated on March 31, 2025</p>
                        </div>
                        <Button variant="outline" size="sm" className="flex gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">February 2025 Summary</h3>
                          <p className="text-sm text-muted-foreground">Generated on February 28, 2025</p>
                        </div>
                        <Button variant="outline" size="sm" className="flex gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <CardTitle>Subscription Analytics</CardTitle>
                    </div>
                    <CardDescription>
                      Track and analyze your recurring payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Subscription Breakdown</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={categoryBreakdowns.subscriptions}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-muted/30">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Total Monthly Cost</h4>
                            <span className="text-xl font-bold">{formatCurrency(insightSummary.totalSubscriptionAmount)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Based on {insightSummary.totalSubscriptions} active subscriptions
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-muted/30">
                          <h4 className="font-medium mb-2">Top Subscriptions</h4>
                          <div className="space-y-2">
                            {subscriptions.slice(0, 3).map(sub => (
                              <div key={sub.id} className="flex justify-between items-center">
                                <span>{sub.serviceName}</span>
                                <span className="font-medium">{formatCurrency(sub.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-muted/30">
                          <h4 className="font-medium mb-2">Potential Savings</h4>
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(insightSummary.totalSubscriptionAmount * 0.15)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            By canceling unused subscriptions
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline" className="flex gap-2">
                      <Download className="h-4 w-4" />
                      Download Subscription Report
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="newsletters">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      <CardTitle>Newsletter Analytics</CardTitle>
                    </div>
                    <CardDescription>
                      Track and analyze your newsletter subscriptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Newsletter Categories</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={categoryBreakdowns.newsletters}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {categoryBreakdowns.newsletters.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} newsletters`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-muted/30">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Total Newsletters</h4>
                            <span className="text-xl font-bold">{insightSummary.totalNewsletters}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {insightSummary.unreadNewsletters} unread newsletters
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-muted/30">
                          <h4 className="font-medium mb-2">Top Newsletter Senders</h4>
                          <div className="space-y-2">
                            {newsletters.slice(0, 3).map(newsletter => (
                              <div key={newsletter.id} className="flex justify-between items-center">
                                <span>{newsletter.sender}</span>
                                <Badge variant={newsletter.read ? "outline" : "default"}>
                                  {newsletter.read ? "Read" : "Unread"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-muted/30">
                          <h4 className="font-medium mb-2">Reading Stats</h4>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ 
                                  width: `${(insightSummary.totalNewsletters - insightSummary.unreadNewsletters) / insightSummary.totalNewsletters * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {Math.round((insightSummary.totalNewsletters - insightSummary.unreadNewsletters) / insightSummary.totalNewsletters * 100)}% read
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline" className="flex gap-2">
                      <Download className="h-4 w-4" />
                      Download Newsletter Report
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="expenses">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      <CardTitle>Expense Analytics</CardTitle>
                    </div>
                    <CardDescription>
                      Track and analyze your spending patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Monthly Expense Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={timelineData.expenses}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis 
                              tickFormatter={(value) => `$${value}`}
                              domain={[0, 'dataMax + 20']}
                            />
                            <Tooltip 
                              formatter={(value) => [`${formatCurrency(Number(value))}`, "Amount"]}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-muted/30">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Total Monthly Expenses</h4>
                            <span className="text-xl font-bold">{formatCurrency(insightSummary.monthlyExpenseAmount)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Based on {insightSummary.totalExpenses} transactions
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-muted/30">
                          <h4 className="font-medium mb-2">Top Expense Categories</h4>
                          <div className="space-y-2">
                            {categoryBreakdowns.expenses.slice(0, 3).map((category, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span>{category.name}</span>
                                <span className="font-medium">{formatCurrency(category.value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-muted/30">
                          <h4 className="font-medium mb-2">Recent Transactions</h4>
                          <div className="space-y-2">
                            {expenses.slice(0, 3).map(expense => (
                              <div key={expense.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-muted">
                                    {expense.category}
                                  </Badge>
                                  <span>{expense.merchant}</span>
                                </div>
                                <span className="font-medium">{formatCurrency(expense.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline" className="flex gap-2">
                      <Download className="h-4 w-4" />
                      Download Expense Report
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
