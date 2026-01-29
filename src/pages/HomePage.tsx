import { motion } from "framer-motion";
import { Briefcase, ArrowRight, Sparkles, Users, Target, Zap, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface HomePageProps {
  navigate: (page: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const features = [
  {
    icon: Target,
    title: "Smart Matching",
    description: "Our AI matches your skills with perfect opportunities",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Get instant notifications on application status",
  },
  {
    icon: Users,
    title: "Direct Connect",
    description: "Chat directly with employers and candidates",
  },
];

export function HomePage({ navigate }: HomePageProps) {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-16">
      <div className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Hero Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              The #1 Job Matching Platform
            </span>
          </motion.div>

          {/* Hero Icon */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mb-8 w-24 h-24 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow animate-float"
          >
            <Briefcase className="w-12 h-12 text-primary-foreground" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
          >
            Unlock Your{" "}
            <span className="text-gradient">Dream Career</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Connect with top employers and talent through our intelligent, 
            streamlined hiring platform. Your next opportunity is just a click away.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            {!currentUser ? (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate("signup")}
                  className="bg-gradient-primary hover:opacity-90 shadow-glow text-lg px-8 py-6 gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("login")}
                  className="text-lg px-8 py-6"
                >
                  Sign In
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate("dashboard")}
                className="bg-gradient-primary hover:opacity-90 shadow-glow text-lg px-8 py-6 gap-2 group"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            className="grid sm:grid-cols-3 gap-6"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="premium-card p-6 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Install App CTA */}
          <motion.div variants={itemVariants} className="mt-16">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("install")}
              className="gap-2"
            >
              <Download className="w-5 h-5" />
              Install Mobile App
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
