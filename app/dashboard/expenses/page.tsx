"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Calendar,
  Pencil,
  Trash2,
  ArrowUpDown,
  Download,
} from "lucide-react";
import { useInsightsContext } from "@/components/insights/insights-provider";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExpensesPage() {
  const { expenses } = useInsightsContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Get unique categories for filter
  const categories = Array.from(new Set(expenses.map((exp) => exp.category)));

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(
      (expense) =>
        (categoryFilter === "all" || expense.category === categoryFilter) &&
        (searchTerm === "" ||
          expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "amount") {
        return sortDirection === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else if (sortBy === "merchant") {
        return sortDirection === "asc"
          ? a.merchant.localeCompare(b.merchant)
          : b.merchant.localeCompare(a.merchant);
      }
      return 0;
    });

  const totalExpenses = filteredExpenses.reduce(
    (total, exp) => total + exp.amount,
    0
  );

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  return (
    <div className="container-app animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Expenses</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>All your tracked expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredExpenses.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle>Timeframe</CardTitle>
            <CardDescription>Filter options for your expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
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
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search expenses..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>
            A complete list of your expenses and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-5 md:grid-cols-6 bg-muted rounded-t-md py-2 px-4 text-sm font-medium">
              <button
                className="flex items-center col-span-2 hover:text-primary transition"
                onClick={() => toggleSort("merchant")}
              >
                Merchant
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </button>
              <button
                className="flex items-center justify-end hover:text-primary transition"
                onClick={() => toggleSort("amount")}
              >
                Amount
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </button>
              <button
                className="hidden md:flex items-center hover:text-primary transition"
                onClick={() => toggleSort("category")}
              >
                Category
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </button>
              <button
                className="flex items-center hover:text-primary transition"
                onClick={() => toggleSort("date")}
              >
                Date
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </button>
              <div className="flex justify-end">Actions</div>
            </div>
            {filteredExpenses.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No expenses found matching your filters
              </div>
            ) : (
              <div>
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="grid grid-cols-5 md:grid-cols-6 py-3 px-4 border-b last:border-b-0 items-center"
                  >
                    <div className="col-span-2 flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={expense.logoUrl} />
                        <AvatarFallback>{expense.merchant[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{expense.merchant}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-medium">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="hidden md:block">
                      <Badge variant="outline">{expense.category}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(expense.date), "MMM d, yyyy")}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
