import { motion } from "framer-motion";
import { Briefcase, LogOut, User, LayoutDashboard } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  navigate: (page: string) => void;
}

export function Navbar({ navigate }: NavbarProps) {
  const { currentUser, userData } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("home");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/50"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="container h-full flex items-center justify-between">
        <motion.a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("home");
          }}
          className="flex items-center gap-2 text-primary font-bold text-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Briefcase className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">JobConnect</span>
        </motion.a>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <motion.button
                onClick={() => navigate("profile")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-secondary transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData?.photoUrl} alt={userData?.username} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {userData?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">{userData?.username}</span>
              </motion.button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("dashboard")}
                className="gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("login")}
                className="text-muted-foreground hover:text-foreground"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("signup")}
                className="bg-gradient-primary hover:opacity-90 shadow-glow"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
