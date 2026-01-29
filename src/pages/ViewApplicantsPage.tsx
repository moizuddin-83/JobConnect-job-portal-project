import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Check, XCircle, Calendar, MessageSquare, ExternalLink, Phone, FileText } from "lucide-react";
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendEmail } from "@/lib/email";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  applicantId: string;
  applicantUsername: string;
  fullName?: string;
  age?: string;
  phone?: string;
  experience?: string;
  cvUrl: string;
  status: string;
  jobTitle: string;
  interviewDetails?: {
    date: string;
    link: string;
  };
}

interface ViewApplicantsPageProps {
  navigate: (page: string, params?: Record<string, string>) => void;
  params: { jobId: string };
}

export function ViewApplicantsPage({ navigate, params }: ViewApplicantsPageProps) {
  const { jobId } = params;
  const [apps, setApps] = useState<Application[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewLink, setInterviewLink] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!jobId) return;
    getDocs(query(collection(db, "applications"), where("jobId", "==", jobId))).then(
      (snap) => setApps(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Application[])
    );
  }, [jobId]);

  const updateStatus = async (appId: string, newStatus: string) => {
    const appToUpdate = apps.find((a) => a.id === appId);
    if (!appToUpdate) return;

    await updateDoc(doc(db, "applications", appId), { status: newStatus });
    setApps(apps.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));

    const applicantSnap = await getDoc(doc(db, "users", appToUpdate.applicantId));
    if (applicantSnap.exists()) {
      const applicantData = applicantSnap.data();
      if (newStatus === "Approved") {
        await sendEmail(
          applicantData.email,
          applicantData.username,
          `Application Approved: ${appToUpdate.jobTitle}`,
          `Great news! Your application for ${appToUpdate.jobTitle} has been APPROVED.\n\nThe employer is interested in your profile. Please log in to your dashboard to chat with them.`
        );
        toast({ title: "Applicant Approved", description: "Email notification sent." });
      } else if (newStatus === "Rejected") {
        await sendEmail(
          applicantData.email,
          applicantData.username,
          `Update on your application: ${appToUpdate.jobTitle}`,
          `Thank you for applying to ${appToUpdate.jobTitle}. Unfortunately, the employer has decided not to proceed with your application at this time.`
        );
        toast({ title: "Applicant Rejected", description: "Email notification sent." });
      }
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    await updateDoc(doc(db, "applications", selectedApp.id), {
      status: "Interview",
      interviewDetails: { date: interviewDate, link: interviewLink },
    });

    setApps(
      apps.map((a) =>
        a.id === selectedApp.id
          ? { ...a, status: "Interview", interviewDetails: { date: interviewDate, link: interviewLink } }
          : a
      )
    );

    const applicantSnap = await getDoc(doc(db, "users", selectedApp.applicantId));
    if (applicantSnap.exists()) {
      const applicantData = applicantSnap.data();
      const readableDate = new Date(interviewDate).toLocaleString();
      await sendEmail(
        applicantData.email,
        applicantData.username,
        `Interview Invitation: ${selectedApp.jobTitle}`,
        `You have been invited to an interview!\n\n📅 Date: ${readableDate}\n🔗 Link: ${interviewLink}\n\nPlease ensure you are ready 5 minutes before the call.`
      );
    }

    setShowModal(false);
    setInterviewDate("");
    setInterviewLink("");
    toast({ title: "Interview Scheduled", description: "Invitation sent via email!" });
  };

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-16">
      <div className="container max-w-4xl">
        <BackButton navigate={navigate} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Applicants</h2>
              <p className="text-muted-foreground text-sm">
                {apps.length} application{apps.length !== 1 ? "s" : ""} received
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {apps.map((app, idx) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-5 rounded-xl bg-secondary/50 border border-border"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">
                          {app.fullName || app.applicantUsername}
                        </h4>
                        {app.age && app.experience && (
                          <span className="text-xs text-muted-foreground">
                            {app.age} yrs • {app.experience} yrs exp
                          </span>
                        )}
                      </div>
                      {app.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4" />
                          {app.phone}
                        </p>
                      )}
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        View CV
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {app.status === "Pending" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(app.id, "Approved")}
                            className="bg-success hover:bg-success/90"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(app.id, "Rejected")}
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge status={app.status} />
                          <div className="flex gap-2">
                            {app.status === "Approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setShowModal(true);
                                }}
                              >
                                <Calendar className="w-4 h-4 mr-1" />
                                Schedule
                              </Button>
                            )}
                            {(app.status === "Approved" || app.status === "Interview") && (
                              <Button
                                size="sm"
                                onClick={() => navigate("chat", { appId: app.id })}
                                className="bg-gradient-primary hover:opacity-90"
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Chat
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {apps.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No applicants yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Schedule Interview Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Schedule Interview"
        >
          <p className="text-sm text-muted-foreground mb-6">
            Send a meeting invitation to {selectedApp?.fullName || selectedApp?.applicantUsername}
          </p>
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Meeting Link</Label>
              <Input
                type="url"
                placeholder="https://meet.google.com/..."
                value={interviewLink}
                onChange={(e) => setInterviewLink(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-primary hover:opacity-90"
              >
                Send Invite
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
