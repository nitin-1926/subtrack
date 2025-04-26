import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Star, Mail, MailOpen, Filter } from "lucide-react";
import { useInsights } from "@/hooks/useInsights";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NewslettersPage = () => {
  const { newsletters, isLoading } = useInsights();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("date-desc");

  const filteredNewsletters = newsletters
    .filter(
      (newsletter) =>
        newsletter.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        newsletter.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((newsletter) => categoryFilter === "all" || newsletter.category === categoryFilter)
    .filter((newsletter) => {
      if (readFilter === "all") return true;
      if (readFilter === "read") return newsletter.read;
      if (readFilter === "unread") return !newsletter.read;
      return true;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "date-asc":
          return new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime();
        case "date-desc":
          return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
        case "sender-asc":
          return a.sender.localeCompare(b.sender);
        case "sender-desc":
          return b.sender.localeCompare(a.sender);
        default:
          return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
      }
    });

  // Extract unique categories for filter
  const categories = Array.from(new Set(newsletters.map((n) => n.category)));

  return (
    <AppLayout>
      <div className="container-app animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Newsletters</h1>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search newsletters..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
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
              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="sender-asc">Sender: A-Z</SelectItem>
                  <SelectItem value="sender-desc">Sender: Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredNewsletters.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No newsletters found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search term
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNewsletters.map((newsletter) => (
              <Card
                key={newsletter.id}
                className={`transition-all hover:shadow-md ${
                  !newsletter.read ? "border-l-4 border-l-primary" : ""
                }`}
              >
                <CardContent className="p-0">
                  <div className="flex items-start p-4 gap-4">
                    <Avatar className="h-10 w-10 rounded-md">
                      <AvatarImage src={newsletter.logoUrl} />
                      <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                        {newsletter.sender.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{newsletter.sender}</h3>
                          <Badge variant="outline" className="text-xs">
                            {newsletter.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(newsletter.receivedAt), { addSuffix: true })}
                          </span>
                          {newsletter.starred && (
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          )}
                          {newsletter.read ? (
                            <MailOpen className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Mail className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                      <h4 className="font-semibold mt-1">{newsletter.subject}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {newsletter.snippet}
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-2 px-4 flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      Mark as {newsletter.read ? "unread" : "read"}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          {newsletter.starred ? "Remove star" : "Star"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default NewslettersPage;
