
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/layout/Sidebar";
import CrowdfundingPage from "./pages/Crowdfunding";
import ProfilePage from "./pages/ProfilePage";
import EventsPage from "./pages/EventsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CommunityPage from "./pages/CommunityPage";
import AdminPage from "./pages/AdminPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/*"
                element={
                  <div className="flex min-h-screen w-full flex-col md:flex-row">
                    <Sidebar />
                    <div className="flex-1 overflow-x-hidden">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/funding" element={<CrowdfundingPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/events" element={<EventsPage />} />
                        <Route path="/community" element={<CommunityPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </div>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
