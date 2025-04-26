import React from "react";
import { NavLink } from "react-router-dom";
import { Calendar, CreditCard, Home, Mail, Settings, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Sidebar = () => {
  const navigation = [
    { name: "Dashboard", to: "/", icon: Home },
    { name: "Subscriptions", to: "/subscriptions", icon: CreditCard },
    { name: "Expenses", to: "/expenses", icon: ShoppingBag },
    { name: "Email Sync", to: "/email-sync", icon: Mail },
    { name: "Reports", to: "/reports", icon: Calendar },
    { name: "Settings", to: "/settings", icon: Settings },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-brand-600">SubTrack</span>
        </div>
      </div>
      <div className="flex flex-col justify-between flex-1 p-4">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive
                    ? "bg-brand-50 text-brand-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};
