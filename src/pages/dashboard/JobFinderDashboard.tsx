import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Briefcase, MapPin } from "lucide-react";
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationTimeline } from "@/components/ui/ApplicationTimeline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Calendar, Link as LinkIcon, MessageSquare } from "lucide-react";

interface Job {
  id: string;
  title: string;
  location: string;
  description: string;
  tags?: string[];
  posterUsername: string;
  matchScore?: number;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  status: string;
  interviewDetails?: {
    date: string;
    link: string;
  };
}

interface JobFinderDashboardProps {
  navigate: (page: string, params?: Record<string, string>) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function JobFinderDashboard({ navigate }: JobFinderDashboardProps) {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !userData) return;

    const fetchData = async () => {
      try {
        const jobsSnap = await getDocs(collection(db, "jobs"));
        let jobsData = jobsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Job[];

        const userInterests = userData.interests || [];
        jobsData = jobsData.map((job) => {
          const jobTags = job.tags || [];
          const matchCount = jobTags.filter((tag) =>
            userInterests.some(
              (uTag) => uTag.toLowerCase() === tag.toLowerCase()
            )
          ).length;
          return { ...job, matchScore: matchCount };
        });

        jobsData.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setAllJobs(jobsData);

        const appsSnap = await getDocs(
          query(
            collection(db, "applications"),
            where("applicantId", "==", currentUser.uid)
          )
        );
        setMyApplications(
          appsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Application[]
        );

        const savedSnap = await getDocs(
          query(
            collection(db, "saved_jobs"),
            where("userId", "==", currentUser.uid)
          )
        );
        setSavedJobIds(savedSnap.docs.map((d) => d.data().jobId));

        setLoading(false);
      } catch (e) {
        console.error("Error fetching dashboard data:", e);
      }
    };

    fetchData();
  }, [currentUser, userData]);

  const toggleSaveJob = async (jobId: string) => {
    if (!currentUser) return;

    if (savedJobIds.includes(jobId)) {
      const q = query(
        collection(db, "saved_jobs"),
        where("userId", "==", currentUser.uid),
        where("jobId", "==", jobId)
      );
      const snap = await getDocs(q);
      snap.forEach(async (d) => await deleteDoc(doc(db, "saved_jobs", d.id)));
      setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
    } else {
      await addDoc(collection(db, "saved_jobs"), {
        userId: currentUser.uid,
        jobId,
      });
      setSavedJobIds((prev) => [...prev, jobId]);
    }
  };

  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch = job.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "saved" ? savedJobIds.includes(job.id) : true;
    return matchesSearch && matchesTab;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      {/* Main Content */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-6"
        >
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              onClick={() => setActiveTab("all")}
              className={activeTab === "all" ? "bg-gradient-primary shadow-glow" : ""}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              All Jobs
            </Button>
            <Button
              variant={activeTab === "saved" ? "default" : "outline"}
              onClick={() => setActiveTab("saved")}
              className={activeTab === "saved" ? "bg-gradient-primary shadow-glow" : ""}
            >
              <Heart className="w-4 h-4 mr-2" />
              Saved ({savedJobIds.length})
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search jobs..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.95 }}
                className="premium-card p-6 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      {job.matchScore && job.matchScore > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                          {job.matchScore} Match{job.matchScore > 1 ? "es" : ""}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4" />
                      {job.location} • {job.posterUsername}
                    </p>

                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.tags.map((tag) => (
                          <span key={tag} className="tag-chip text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:flex-col">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleSaveJob(job.id)}
                      className={
                        savedJobIds.includes(job.id)
                          ? "text-red-500 border-red-200 hover:bg-red-50"
                          : ""
                      }
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={savedJobIds.includes(job.id) ? "currentColor" : "none"}
                      />
                    </Button>
                    <Button
                      onClick={() => navigate("applyJob", { jobId: job.id })}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="premium-card p-12 text-center"
            >
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search or check back later
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="premium-card p-6 lg:sticky lg:top-24"
        >
          <h3 className="font-semibold text-lg mb-6">My Applications</h3>

          <div className="space-y-4">
            {myApplications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-secondary/50 border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{app.jobTitle}</h4>
                  <StatusBadge status={app.status} />
                </div>

                <ApplicationTimeline status={app.status} />

                {app.status === "Interview" && app.interviewDetails && (
                  <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-xs font-medium text-success flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" /> Interview Scheduled
                    </p>
                    <p className="text-xs mb-2">
                      {new Date(app.interviewDetails.date).toLocaleString()}
                    </p>
                    <a
                      href={app.interviewDetails.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-success flex items-center gap-1 hover:underline"
                    >
                      <LinkIcon className="w-3 h-3" /> Join Meeting
                    </a>
                  </div>
                )}

                {(app.status === "Approved" || app.status === "Interview") && (
                  <Button
                    size="sm"
                    onClick={() => navigate("chat", { appId: app.id })}
                    className="w-full mt-4 bg-gradient-primary hover:opacity-90"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with HR
                  </Button>
                )}
              </motion.div>
            ))}

            {myApplications.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No applications yet. Start applying!
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
