import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, FileText, Plus, X, Tag } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, JOB_TAGS } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface PostJobPageProps {
  navigate: (page: string) => void;
}

export function PostJobPage({ navigate }: PostJobPageProps) {
  const { currentUser, userData } = useAuth();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setCustomTag("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userData) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "jobs"), {
        title,
        location,
        description,
        tags: selectedTags,
        posterId: currentUser.uid,
        posterUsername: userData.username,
        timestamp: serverTimestamp(),
      });
      toast({
        title: "Job Posted!",
        description: "Your job posting is now live.",
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
              <h2 className="text-2xl font-bold">Post a Position</h2>
              <p className="text-muted-foreground text-sm">
                Find the perfect candidate for your team
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="title"
                  placeholder="e.g. Senior React Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g. Remote, New York, NY"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="pl-10 min-h-[120px]"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags (Select relevant skills)
              </Label>
              <div className="flex flex-wrap gap-2">
                {JOB_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`tag-chip transition-all ${
                      selectedTags.includes(tag) ? "tag-chip-active" : ""
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {selectedTags
                  .filter((t) => !JOB_TAGS.includes(t))
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="tag-chip tag-chip-active flex items-center gap-1"
                    >
                      {tag}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add custom tag..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  className="text-sm"
                />
                <Button type="button" variant="outline" size="icon" onClick={addCustomTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 shadow-glow"
              disabled={loading}
            >
              {loading ? "Posting..." : "Launch Posting"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
