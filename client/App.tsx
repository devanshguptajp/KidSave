import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getAppState, updateChild, saveNotification, addChildNotification } from "./lib/appState";
import Landing from "./pages/Landing";
import SetupWizard from "./pages/SetupWizard";
import ParentLogin from "./pages/ParentLogin";
import ParentDashboard from "./pages/ParentDashboard";
import ParentSettings from "./pages/ParentSettings";
import ParentNotifications from "./pages/ParentNotifications";
import ChildDetails from "./pages/ChildDetails";
import KidLogin from "./pages/KidLogin";
import KidDashboard from "./pages/KidDashboard";
import KidNotifications from "./pages/KidNotifications";
import KidSavings from "./pages/KidSavings";
import KidCategories from "./pages/KidCategories";
import KidGoals from "./pages/KidGoals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AllowanceProcessor() {
  useEffect(() => {
    const state = getAppState();
    const today = new Date().toDateString();
    const lastProcessDate = localStorage.getItem("lastAllowanceProcessDate");

    if (lastProcessDate !== today) {
      state.children.forEach((child) => {
        if (child.allowanceAmount && child.allowanceAmount > 0) {
          child.balance += child.allowanceAmount;

          const notification = {
            id: Date.now().toString() + Math.random(),
            type: "allowance" as const,
            message: `Your daily allowance of ${child.allowanceAmount.toFixed(2)} has been credited!`,
            timestamp: Date.now(),
            read: false,
          };

          saveNotification(notification);
          addChildNotification(child.id, notification);
          updateChild(child.id, child);
        }
      });

      localStorage.setItem("lastAllowanceProcessDate", today);
    }
  }, []);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AllowanceProcessor />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/setup" element={<SetupWizard />} />
            <Route path="/parent-login" element={<ParentLogin />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/parent-settings" element={<ParentSettings />} />
            <Route path="/parent-notifications" element={<ParentNotifications />} />
            <Route
              path="/parent-child-details/:childId"
              element={<ChildDetails />}
            />
            <Route path="/kid-login" element={<KidLogin />} />
            <Route path="/kid-dashboard" element={<KidDashboard />} />
            <Route path="/kid-notifications" element={<KidNotifications />} />
            <Route path="/kid-savings" element={<KidSavings />} />
            <Route path="/kid-categories" element={<KidCategories />} />
            <Route path="/kid-goals" element={<KidGoals />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
