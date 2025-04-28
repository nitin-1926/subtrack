"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CreditCard,
  Home,
  Mail,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Sidebar = () => {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", to: "/dashboard", icon: Home },
    { name: "Subscriptions", to: "/dashboard/subscriptions", icon: CreditCard },
    { name: "Expenses", to: "/dashboard/expenses", icon: ShoppingBag },
    { name: "Email Sync", to: "/dashboard/email-sync", icon: Mail },
    { name: "Reports", to: "/dashboard/reports", icon: Calendar },
    { name: "Settings", to: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-sidebar-border">
      <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-primary">SubTrack</span>
        </div>
      </div>
      <div className="flex flex-col justify-between flex-1 p-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.name}
                href={item.to}
                className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
