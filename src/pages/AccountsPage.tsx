import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Inbox, AlertCircle, CheckCircle, Mail, Trash2, Plus, RefreshCw, Check, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useInsights } from "@/hooks/useInsights";
import { formatDistanceToNow } from "date-fns";

const AccountsPage = () => {
  const { gmailAccounts, isLoading, syncAccount, connectAccount, disconnectAccount, accountInsights } = useInsights();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [newAccountEmail, setNewAccountEmail] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSync = async (accountId: string) => {
    setSyncingId(accountId);
    await syncAccount(accountId);
    setSyncingId(null);
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

  return (
    <AppLayout>
      <div className="container-app animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Gmail Accounts</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Connect Account
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

        <div className="grid gap-6">
          {gmailAccounts.map((account) => {
            const insights = accountInsights.find(ai => ai.email === account.email);
            
            return (
              <Card key={account.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={account.avatarUrl} />
                      <AvatarFallback>{account.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {account.name}
                        {account.connected ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Disconnected
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{account.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {account.connected && insights && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/40">
                          <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Newsletters</p>
                          <p className="text-2xl font-bold">{insights.newsletterCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/40">
                          <Inbox className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Subscriptions</p>
                          <p className="text-2xl font-bold">{insights.subscriptionCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/40">
                          <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Expenses</p>
                          <p className="text-2xl font-bold">{insights.expenseCount}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {account.connected && account.lastSynced && (
                    <div className="text-sm text-muted-foreground">
                      Last synced {formatDistanceToNow(new Date(account.lastSynced), { addSuffix: true })}
                    </div>
                  )}

                  {!account.connected && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Disconnected</AlertTitle>
                      <AlertDescription>
                        This account is currently disconnected. Reconnect to continue receiving insights.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 bg-muted/20">
                  {account.connected ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleDisconnect(account.id)}
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Disconnect
                      </Button>
                      <Button
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
                    <Button onClick={() => handleConnect()}>
                      <Mail className="mr-2 h-4 w-4" />
                      Reconnect
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default AccountsPage;
