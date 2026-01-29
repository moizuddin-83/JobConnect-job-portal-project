import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { JobFinderDashboard } from "./JobFinderDashboard";
import { WorkerFinderDashboard } from "./WorkerFinderDashboard";

interface DashboardPageProps {
  navigate: (page: string, params?: Record<string, string>) => void;
}

export function DashboardPage({ navigate }: DashboardPageProps) {
  const { userData } = useAuth();

  if (!userData) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-16">
      {userData.role === "JobFinder" ? (
        <div className="container">
          <JobFinderDashboard navigate={navigate} />
        </div>
      ) : (
        <WorkerFinderDashboard navigate={navigate} />
      )}
    </div>
  );
}
