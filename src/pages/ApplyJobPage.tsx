import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, Briefcase, FileText, Upload, Clock } from "lucide-react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { sendEmail } from "@/lib/email";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

interface Job {
  title: string;
  posterId: string;
}

interface ApplyJobPageProps {
  navigate: (page: string) => void;
  params: { jobId: string };
}

export function ApplyJobPage({ navigate, params }: ApplyJobPageProps) {
  const { jobId } = params;
  const { currentUser, userData } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getDoc(doc(db, "jobs", jobId)).then((snap) => {
      if (snap.exists()) {
        setJob(snap.data() as Job);
      }
    });
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile || !currentUser || !userData || !job) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields and upload your CV.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", cvFile);
      formData.append("upload_preset", "jobconnect_preset");
      formData.append("cloud_name", "dpdhqkpmm");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dpdhqkpmm/auto/upload`,
        { method: "POST", body: formData }
      );
      const fileData = await res.json();

      await addDoc(collection(db, "applications"), {
        jobId,
        jobTitle: job.title,
        posterId: job.posterId,
        applicantId: currentUser.uid,
        applicantUsername: userData.username,
        fullName,
        age,
        phone,
        experience,
        cvUrl: fileData.secure_url,
        details,
        status: "Pending",
        timestamp: serverTimestamp(),
      });

      const posterSnap = await getDoc(doc(db, "users", job.posterId));
      if (posterSnap.exists()) {
        const posterData = posterSnap.data();
        await sendEmail(
          posterData.email,
          posterData.username,
          `New Applicant for ${job.title}`,
          `You have received a new application.\n\nName: ${fullName}\nAge: ${age}\nExperience: ${experience} years\nPhone: ${phone}\n\nCover Letter: "${details}"\n\nLog in to your dashboard to view their CV.`
        );
      }

      toast({
        title: "Application Submitted!",
        description: "Good luck with your application.",
      });
      navigate("dashboard");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (!job) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-16">
      <div className="container max-w-2xl">
        <BackButton navigate={navigate} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="premium-card p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Apply for {job.title}</h2>
              <p className="text-muted-foreground text-sm">
                Complete the form below to submit your application
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (Years)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="experience"
                    type="number"
                    placeholder="3"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Cover Letter</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="details"
                  placeholder="Tell us why you're the perfect fit for this role..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="pl-10 min-h-[120px]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv">Upload CV (PDF)</Label>
              <div className="relative">
                <label className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {cvFile ? cvFile.name : "Click to upload your CV"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF format, max 10MB
                    </p>
                  </div>
                  <input
                    id="cv"
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    required
                  />
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 shadow-glow"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
