import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, BarChart3, MapPin, Trash2 } from "lucide-react";
import { collection, getDocs, query, where, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  title: string;
  location: string;
  timestamp?: Timestamp;
}

interface ChartData {
  name: string;
  count: number;
  fullTitle: string;
}

interface WorkerFinderDashboardProps {
  navigate: (page: string, params?: Record<string, string>) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function WorkerFinderDashboard({ navigate }: WorkerFinderDashboardProps) {
  const { currentUser } = useAuth();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      const jobsSnap = await getDocs(
        query(collection(db, "jobs"), where("posterId", "==", currentUser.uid))
      );
      const jobs = jobsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Job[];
      setMyJobs(jobs);

      const appsSnap = await getDocs(collection(db, "applications"));
      const apps = appsSnap.docs.map((d) => d.data());

      const stats = jobs.map((job) => {
        const count = apps.filter((a) => a.jobId === job.id).length;
        return {
          name: job.title.substring(0, 12) + (job.title.length > 12 ? "..." : ""),
          count,
          fullTitle: job.title,
        };
      });
      setChartData(stats);
    };

    fetchData();
  }, [currentUser]);

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;

    try {
      await deleteDoc(doc(db, "jobs", jobId));
      setMyJobs((prev) => prev.filter((job) => job.id !== jobId));
      setChartData((prev) => prev.filter((item) => {
        const job = myJobs.find((j) => j.id === jobId);
        return !job || !job.title.includes(item.name.replace("...", ""));
      }));
    } catch (err: any) {
      alert("Error deleting job: " + err.message);
    }
  };

  return (
    <div className="container max-w-5xl pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold">Hiring Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage postings and view analytics
          </p>
        </div>
        <Button
          onClick={() => navigate("postJob")}
          className="bg-gradient-primary hover:opacity-90 shadow-glow gap-2"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </Button>
      </motion.div>

      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-6 mb-8"
        >
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            Application Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--secondary))" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "var(--shadow-lg)",
                    backgroundColor: "hsl(var(--card))",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {myJobs.map((job) => (
          <motion.div
            key={job.id}
            variants={itemVariants}
            className="premium-card p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                  {job.timestamp && (
                    <>
                      {" "}
                      • Posted{" "}
                      {job.timestamp.toDate().toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("viewApplicants", { jobId: job.id })}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  View Applicants
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDeleteJob(job.id)}
                  className="text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {myJobs.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="premium-card p-12 text-center"
          >
            <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No job postings yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first job posting to start receiving applications
            </p>
            <Button
              onClick={() => navigate("postJob")}
              className="bg-gradient-primary hover:opacity-90 shadow-glow"
            >
              Post Your First Job
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
