import { motion } from "framer-motion";
import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationTimelineProps {
  status: string;
}

export function ApplicationTimeline({ status }: ApplicationTimelineProps) {
  const isApproved = status === "Approved" || status === "Interview";
  const isInterview = status === "Interview";
  const isRejected = status === "Rejected";

  const steps = [
    { label: "Submitted", complete: true },
    { label: "Under Review", complete: isApproved || isRejected, current: !isApproved && !isRejected },
    { 
      label: isRejected ? "Rejected" : isInterview ? "Interview" : "Decision", 
      complete: isInterview, 
      rejected: isRejected,
      current: isApproved && !isInterview
    },
  ];

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-border -z-10" />
        <motion.div 
          className="absolute left-0 top-4 h-0.5 bg-primary -z-10"
          initial={{ width: "0%" }}
          animate={{ 
            width: isRejected || isInterview ? "100%" : isApproved ? "66%" : "33%",
            backgroundColor: isRejected ? "hsl(var(--destructive))" : "hsl(var(--primary))"
          }}
          transition={{ duration: 0.5 }}
        />

        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 bg-background z-10",
                step.complete && !step.rejected && "border-primary bg-primary text-primary-foreground",
                step.current && "border-primary animate-pulse-soft",
                step.rejected && "border-destructive bg-destructive text-destructive-foreground"
              )}
            >
              {step.complete && !step.rejected && <Check className="w-4 h-4" />}
              {step.rejected && <X className="w-4 h-4" />}
              {step.current && <Clock className="w-4 h-4 text-primary" />}
              {!step.complete && !step.current && !step.rejected && (
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              )}
            </motion.div>
            <span className={cn(
              "text-xs font-medium",
              step.complete ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
