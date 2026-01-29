import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case "approved":
      case "interview":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "pending":
      default:
        return "status-pending";
    }
  };

  return (
    <span className={cn("status-badge", getStatusStyles(), className)}>
      {status}
    </span>
  );
}
