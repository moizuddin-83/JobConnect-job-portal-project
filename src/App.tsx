import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { PostJobPage } from "@/pages/PostJobPage";
import { ApplyJobPage } from "@/pages/ApplyJobPage";
import { ViewApplicantsPage } from "@/pages/ViewApplicantsPage";
import { ChatPage } from "@/pages/ChatPage";
import { InstallPage } from "@/pages/InstallPage";

const queryClient = new QueryClient();

type PageName = 
  | "home" 
  | "login" 
  | "signup" 
  | "dashboard" 
  | "profile" 
  | "postJob" 
  | "applyJob" 
  | "viewApplicants" 
  | "chat"
  | "install";

const App = () => {
  const [page, setPage] = useState<PageName>("home");
  const [params, setParams] = useState<Record<string, string>>({});

  const navigate = (name: PageName, p: Record<string, string> = {}) => {
    setPage(name);
    setParams(p);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage navigate={navigate} />;
      case "login":
        return <LoginPage navigate={navigate} />;
      case "signup":
        return <SignUpPage navigate={navigate} />;
      case "dashboard":
        return <DashboardPage navigate={navigate} />;
      case "profile":
        return <ProfilePage navigate={navigate} />;
      case "postJob":
        return <PostJobPage navigate={navigate} />;
      case "applyJob":
        return <ApplyJobPage navigate={navigate} params={params as { jobId: string }} />;
      case "viewApplicants":
        return <ViewApplicantsPage navigate={navigate} params={params as { jobId: string }} />;
      case "chat":
        return <ChatPage navigate={navigate} params={params as { appId: string }} />;
      case "install":
        return <InstallPage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <Navbar navigate={navigate} />
          <main>{renderPage()}</main>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
