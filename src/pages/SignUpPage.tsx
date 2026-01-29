import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, Plus, X } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, JOB_TAGS } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface SignUpPageProps {
  navigate: (page: string) => void;
}

export function SignUpPage({ navigate }: SignUpPageProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"JobFinder" | "WorkerFinder">("JobFinder");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleInterest = (tag: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !selectedInterests.includes(tag)) {
      setSelectedInterests([...selectedInterests, tag]);
      setCustomTag("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        username,
        email,
        role,
        interests: role === "JobFinder" ? selectedInterests : [],
      });
      toast({
        title: "Account Created!",
        description: "Welcome to JobConnect",
      });
      navigate("dashboard");
    } catch (err: any) {
      toast({
        title: "Sign Up Failed",
        description: err.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-16 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <div className="premium-card p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow"
            >
              <UserPlus className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h2 className="text-2xl font-bold">Join JobConnect</h2>
            <p className="text-muted-foreground mt-2">Create your free account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>I want to...</Label>
              <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JobFinder">Find a job</SelectItem>
                  <SelectItem value="WorkerFinder">Hire talent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "JobFinder" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <Label>Select Your Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`tag-chip transition-all ${
                        selectedInterests.includes(tag) ? "tag-chip-active" : ""
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {selectedInterests
                    .filter((t) => !JOB_TAGS.includes(t))
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
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
                    placeholder="Add custom interest..."
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
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 shadow-glow"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <button
              onClick={() => navigate("login")}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
