import React, { useState } from "react";
import { useInsights } from "@/hooks/useInsights";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, RefreshCw, AlertCircle, CheckCircle, Mail, Settings, Filter, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EmailSyncPage = () => {
  const { gmailAccounts, syncAccount, connectAccount, disconnectAccount, isLoading } = useInsights();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [newAccountEmail, setNewAccountEmail] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [syncOptions, setSyncOptions] = useState({
    subscriptions: true,
    newsletters: true,
    expenses: true,
    syncDepth: "3months"
  });

  const handleSync = async (accountId: string) => {
    setSyncingId(accountId);
    setSyncStatus("syncing");
    setSyncProgress(0);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    try {
      // Simulate API call
      await syncAccount(accountId);
      setSyncStatus("success");
      
      // Ensure progress reaches 100%
      setSyncProgress(100);
    } catch (error) {
      setSyncStatus("error");
      clearInterval(interval);
    } finally {
      setSyncingId(null);
      // Reset after a delay
      setTimeout(() => {
        setSyncStatus("idle");
      }, 3000);
    }
  };

  const handleConnect = async () => {
    if (newAccountEmail && newAccountName) {
      await connectAccount(newAccountEmail, newAccountName);
      setNewAccountEmail("");
      setNewAccountName("");
      setIsDialogOpen(false);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    await disconnectAccount(accountId);
  };

  const handleSyncOptionChange = (option: keyof typeof syncOptions, value: boolean | string) => {
    setSyncOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  return (
    <AppLayout>
      <div className="container-app animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Email Sync</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Connect Gmail Account
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

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                Connected Accounts
              </CardTitle>
              <CardDescription>
                Manage and sync your connected Gmail accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {gmailAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No accounts connected</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your Gmail accounts to get started
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    Connect Account
                  </Button>
                </div>
              ) : (
                gmailAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={account.avatarUrl} />
                          <AvatarFallback>{account.email[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-muted-foreground">{account.email}</div>
                        </div>
                        {account.connected ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Disconnected
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {account.connected ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnect(account.id)}
                              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              Disconnect
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSync(account.id)}
                              disabled={syncingId === account.id || isLoading}
                            >
                              {syncingId === account.id ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Syncing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Sync Now
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" onClick={() => handleConnect()}>
                            Reconnect
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {syncingId === account.id && (
                      <div className="p-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Syncing data...</span>
                          <span className="text-sm text-muted-foreground">{syncProgress}%</span>
                        </div>
                        <Progress value={syncProgress} className="h-2" />
                      </div>
                    )}
                    
                    {account.lastSynced && (
                      <div className="px-4 py-2 border-t text-sm text-muted-foreground">
                        Last synced {formatDistanceToNow(new Date(account.lastSynced), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Sync Options
              </CardTitle>
              <CardDescription>
                Configure what data to extract
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="subscriptions">Subscriptions</Label>
                  <p className="text-sm text-muted-foreground">
                    Find recurring payments
                  </p>
                </div>
                <Switch
                  id="subscriptions"
                  checked={syncOptions.subscriptions}
                  onCheckedChange={(checked) => handleSyncOptionChange("subscriptions", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="newsletters">Newsletters</Label>
                  <p className="text-sm text-muted-foreground">
                    Organize newsletter emails
                  </p>
                </div>
                <Switch
                  id="newsletters"
                  checked={syncOptions.newsletters}
                  onCheckedChange={(checked) => handleSyncOptionChange("newsletters", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="expenses">Expenses</Label>
                  <p className="text-sm text-muted-foreground">
                    Track purchases and receipts
                  </p>
                </div>
                <Switch
                  id="expenses"
                  checked={syncOptions.expenses}
                  onCheckedChange={(checked) => handleSyncOptionChange("expenses", checked)}
                />
              </div>
              
              <div className="pt-2">
                <Label htmlFor="sync-depth" className="mb-2 block">
                  Sync Depth
                </Label>
                <Select 
                  value={syncOptions.syncDepth} 
                  onValueChange={(value) => handleSyncOptionChange("syncDepth", value)}
                >
                  <SelectTrigger id="sync-depth">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">Last month</SelectItem>
                    <SelectItem value="3months">Last 3 months</SelectItem>
                    <SelectItem value="6months">Last 6 months</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="help" className="space-y-4">
          <TabsList>
            <TabsTrigger value="help">Help & Tips</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="help" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>How Email Sync Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What data is extracted?</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">Our system analyzes your emails to identify:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Subscription confirmations and receipts</li>
                        <li>Newsletter emails and content</li>
                        <li>Purchase receipts and expense information</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How often should I sync?</AccordionTrigger>
                    <AccordionContent>
                      We recommend syncing once a week to keep your data up to date. The first sync may take longer as we process your historical emails.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Troubleshooting sync issues</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">If you encounter sync problems:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Check your Gmail permissions are still valid</li>
                        <li>Try disconnecting and reconnecting your account</li>
                        <li>Ensure you have a stable internet connection</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Your data is secure</AlertTitle>
                  <AlertDescription>
                    We use OAuth to securely access your Gmail account. We never store your password, and you can revoke access at any time.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <h3 className="font-medium">What we access:</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Email metadata (subject, sender, date)</li>
                    <li>Email content (to identify subscriptions and expenses)</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">What we don't do:</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Access personal correspondence</li>
                    <li>Share your data with third parties</li>
                    <li>Store full email content after processing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default EmailSyncPage;
