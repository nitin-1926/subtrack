import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, ShoppingBag, CreditCard, Calendar, Download, ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { useInsights } from "@/hooks/useInsights";
import { formatDistanceToNow, format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

const ExpensesPage = () => {
  const { expenses, categoryBreakdowns, isLoading } = useInsights();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("date-desc");
  const [timeRange, setTimeRange] = useState("all");
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });
  const [merchantFilter, setMerchantFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Extract unique categories and merchants for filters
  const categories = Array.from(new Set(expenses.map((e) => e.category)));
  const merchants = Array.from(new Set(expenses.map((e) => e.merchant)));

  // Filter expenses based on all criteria
  const filteredExpenses = expenses
    .filter(
      (expense) =>
        expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((expense) => categoryFilter === "all" || expense.category === categoryFilter)
    .filter((expense) => merchantFilter === "all" || expense.merchant === merchantFilter)
    .filter((expense) => {
      if (timeRange === "all" && !dateRange) return true;
      
      const expenseDate = new Date(expense.date);
      const now = new Date();
      
      // Check custom date range first
      if (dateRange && dateRange.from) {
        if (dateRange.to) {
          return expenseDate >= dateRange.from && expenseDate <= dateRange.to;
        }
        return expenseDate >= dateRange.from;
      }
      
      // Then check predefined time ranges
      if (timeRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return expenseDate >= weekAgo;
      }
      
      if (timeRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return expenseDate >= monthAgo;
      }
      
      if (timeRange === "quarter") {
        const quarterAgo = new Date();
        quarterAgo.setMonth(now.getMonth() - 3);
        return expenseDate >= quarterAgo;
      }
      
      if (timeRange === "year") {
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        return expenseDate >= yearAgo;
      }
      
      return true;
    })
    .filter((expense) => {
      const { min, max } = amountRange;
      const minAmount = min ? parseFloat(min) : null;
      const maxAmount = max ? parseFloat(max) : null;
      
      if (minAmount !== null && maxAmount !== null) {
        return expense.amount >= minAmount && expense.amount <= maxAmount;
      } else if (minAmount !== null) {
        return expense.amount >= minAmount;
      } else if (maxAmount !== null) {
        return expense.amount <= maxAmount;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "amount-asc":
          return a.amount - b.amount;
        case "amount-desc":
          return b.amount - a.amount;
        case "merchant-asc":
          return a.merchant.localeCompare(b.merchant);
        case "merchant-desc":
          return b.merchant.localeCompare(a.merchant);
        case "category-asc":
          return a.category.localeCompare(b.category);
        case "category-desc":
          return b.category.localeCompare(a.category);
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  // Calculate total for filtered expenses
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by category for the chart
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory).map(([name, value], index) => ({
    name,
    value,
    color: `hsl(${index * 40}, 70%, 50%)`,
  }));

  // Group expenses by merchant for the bar chart (top 5)
  const expensesByMerchant = filteredExpenses.reduce((acc, expense) => {
    if (!acc[expense.merchant]) {
      acc[expense.merchant] = 0;
    }
    acc[expense.merchant] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const merchantChartData = Object.entries(expensesByMerchant)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({
      name,
      value,
    }));

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setMerchantFilter("all");
    setTimeRange("all");
    setAmountRange({ min: "", max: "" });
    setDateRange(undefined);
    setSortOrder("date-desc");
  };

  // Export expenses as CSV
  const exportToCSV = () => {
    const headers = ["Merchant", "Amount", "Date", "Category", "Description"];
    const csvData = [
      headers.join(","),
      ...filteredExpenses.map(expense => [
        `"${expense.merchant}"`,
        expense.amount,
        new Date(expense.date).toLocaleDateString(),
        `"${expense.category}"`,
        `"${expense.description || ""}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="container-app animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Expenses</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {(categoryFilter !== "all" || merchantFilter !== "all" || timeRange !== "all" || 
                          amountRange.min || amountRange.max || dateRange) && (
                          <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                            {[
                              categoryFilter !== "all" ? 1 : 0,
                              merchantFilter !== "all" ? 1 : 0,
                              timeRange !== "all" || dateRange ? 1 : 0,
                              amountRange.min || amountRange.max ? 1 : 0
                            ].reduce((a, b) => a + b, 0)}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Filters</h4>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Category</label>
                          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Merchant</label>
                          <Select value={merchantFilter} onValueChange={setMerchantFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Merchants" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Merchants</SelectItem>
                              {merchants.map((merchant) => (
                                <SelectItem key={merchant} value={merchant}>
                                  {merchant}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Time Range</label>
                          <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Time Range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Time</SelectItem>
                              <SelectItem value="week">Past Week</SelectItem>
                              <SelectItem value="month">Past Month</SelectItem>
                              <SelectItem value="quarter">Past 3 Months</SelectItem>
                              <SelectItem value="year">Past Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Custom Date Range</label>
                          <DatePickerWithRange 
                            date={dateRange} 
                            setDate={setDateRange} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Amount Range</label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={amountRange.min}
                              onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                            />
                            <Input
                              type="number"
                              placeholder="Max"
                              value={amountRange.max}
                              onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full" onClick={resetFilters}>
                          Reset Filters
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Newest First</SelectItem>
                      <SelectItem value="date-asc">Oldest First</SelectItem>
                      <SelectItem value="amount-desc">Highest Amount</SelectItem>
                      <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                      <SelectItem value="merchant-asc">Merchant: A-Z</SelectItem>
                      <SelectItem value="merchant-desc">Merchant: Z-A</SelectItem>
                      <SelectItem value="category-asc">Category: A-Z</SelectItem>
                      <SelectItem value="category-desc">Category: Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>View</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setViewMode("card")}>
                        <Checkbox checked={viewMode === "card"} className="mr-2" />
                        Card View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode("table")}>
                        <Checkbox checked={viewMode === "table"} className="mr-2" />
                        Table View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredExpenses.length} expenses
                </div>
                <div className="font-semibold">
                  Total: {formatCurrency(totalAmount)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-semibold">No expenses found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or connect a Gmail account to import expenses.
                  </p>
                </div>
              ) : viewMode === "card" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredExpenses.map((expense) => (
                    <Card key={expense.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={expense.logoUrl} />
                            <AvatarFallback>{expense.merchant[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{expense.merchant}</CardTitle>
                            <CardDescription className="text-xs">
                              {format(new Date(expense.date), "PPP")}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {expense.category}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {expense.description || "No description"}
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(expense.amount)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Merchant</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={expense.logoUrl} />
                                <AvatarFallback>{expense.merchant[0]}</AvatarFallback>
                              </Avatar>
                              {expense.merchant}
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(expense.date), "PP")}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {expense.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {expense.description || "—"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Expenses by Category</CardTitle>
                  <CardDescription>
                    Breakdown of your spending by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <p className="text-muted-foreground">No data to display</p>
                    </div>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Merchants */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Merchants</CardTitle>
                  <CardDescription>
                    Your highest spending merchants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {merchantChartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <p className="text-muted-foreground">No data to display</p>
                    </div>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={merchantChartData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Bar dataKey="value" fill="#8B5CF6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expense Details */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Expense Details</CardTitle>
                  <CardDescription>
                    Detailed breakdown of your expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {categories.map((category) => {
                      const categoryExpenses = filteredExpenses.filter(e => e.category === category);
                      const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
                      const percentage = totalAmount > 0 
                        ? ((categoryTotal / totalAmount) * 100).toFixed(1) 
                        : "0";
                      
                      return (
                        <AccordionItem key={category} value={category}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex justify-between w-full pr-4">
                              <span>{category}</span>
                              <div className="flex items-center gap-4">
                                <span>{formatCurrency(categoryTotal)}</span>
                                <Badge variant="outline">{percentage}%</Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pt-2">
                              {categoryExpenses.map((expense) => (
                                <div key={expense.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={expense.logoUrl} />
                                      <AvatarFallback>{expense.merchant[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{expense.merchant}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {format(new Date(expense.date), "PP")}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="font-medium">
                                    {formatCurrency(expense.amount)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ExpensesPage;
