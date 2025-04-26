import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/context/AuthProvider";
import { InsightsProvider } from "@/context/InsightsContext";
import Dashboard from "@/pages/Dashboard";
import EmailSyncPage from "@/pages/EmailSyncPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import RegisterPage from "@/pages/RegisterPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AccountsPage from "./pages/AccountsPage";
import ExpensesPage from "./pages/ExpensesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <InsightsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/email-sync" element={<EmailSyncPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </InsightsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
