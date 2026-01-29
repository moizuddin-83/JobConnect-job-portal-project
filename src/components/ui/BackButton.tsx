import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  navigate: (page: string) => void;
  page?: string;
}

export function BackButton({ navigate, page = "dashboard" }: BackButtonProps) {
  return (
    <motion.a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        navigate(page);
      }}
      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      whileHover={{ x: -4 }}
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      <span className="text-sm font-medium">Back</span>
    </motion.a>
  );
}
