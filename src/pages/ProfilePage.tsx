import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, User } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface ProfilePageProps {
  navigate: (page: string) => void;
}

export function ProfilePage({ navigate }: ProfilePageProps) {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "jobconnect_preset");
    formData.append("cloud_name", "dpdhqkpmm");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dpdhqkpmm/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      await updateDoc(doc(db, "users", currentUser.uid), {
        photoUrl: data.secure_url,
      });
      toast({
        title: "Photo Updated",
        description: "Your profile photo has been updated successfully.",
      });
      window.location.reload();
    } catch (err) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-16">
      <div className="container max-w-lg">
        <BackButton navigate={navigate} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="premium-card p-8"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Edit Profile</h2>

          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userData?.photoUrl} alt={userData?.username} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {userData?.username?.charAt(0).toUpperCase() || <User />}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-lg hover:opacity-90 transition-opacity">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  accept="image/*"
                />
              </label>
            </div>
            {loading && (
              <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={userData?.username || ""} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={userData?.email || ""} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={userData?.role === "JobFinder" ? "Job Seeker" : "Recruiter"}
                disabled
                className="bg-muted"
              />
            </div>

            {userData?.role === "JobFinder" && userData.interests && (
              <div className="space-y-2">
                <Label>My Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {userData.interests.length > 0 ? (
                    userData.interests.map((tag) => (
                      <span key={tag} className="tag-chip tag-chip-active">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No interests selected
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
