import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SetupWizard from "./pages/SetupWizard";
import ParentLogin from "./pages/ParentLogin";
import ParentDashboard from "./pages/ParentDashboard";
import KidLogin from "./pages/KidLogin";
import KidDashboard from "./pages/KidDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/setup" element={<SetupWizard />} />
            <Route path="/parent-login" element={<ParentLogin />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/parent-child-details/:childId" element={<div className="text-center py-12">Child details page coming soon</div>} />
            <Route path="/kid-login" element={<KidLogin />} />
            <Route path="/kid-dashboard" element={<KidDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
