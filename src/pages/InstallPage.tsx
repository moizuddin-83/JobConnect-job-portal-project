import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/BackButton";
import { Download, Smartphone, Check, Share, Plus, MoreVertical } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPageProps {
  navigate: (page: string) => void;
}

export const InstallPage = ({ navigate }: InstallPageProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: "⚡", title: "Lightning Fast", desc: "Instant loading, even offline" },
    { icon: "📱", title: "Native Feel", desc: "Works just like a native app" },
    { icon: "🔔", title: "Stay Updated", desc: "Get notified about new jobs" },
    { icon: "💾", title: "Save Data", desc: "Uses less data than browsing" },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-lg mx-auto">
        <BackButton navigate={navigate} page="home" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-8"
        >
          {/* App Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <Smartphone className="w-12 h-12 text-primary-foreground" />
          </motion.div>

          <h1 className="text-3xl font-bold text-foreground mb-3">
            Install JobConnect
          </h1>
          <p className="text-muted-foreground mb-8">
            Add JobConnect to your home screen for the best experience
          </p>

          {/* Status */}
          {isInstalled ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 mb-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Already Installed!
              </h2>
              <p className="text-muted-foreground">
                JobConnect is installed on your device. Open it from your home screen.
              </p>
            </motion.div>
          ) : deferredPrompt ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <Button
                onClick={handleInstall}
                size="lg"
                className="w-full py-6 text-lg font-semibold"
              >
                <Download className="w-5 h-5 mr-2" />
                Install App
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6 mb-8"
            >
              {isIOS ? (
                <>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Install on iPhone/iPad
                  </h2>
                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Share className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">1. Tap the Share button</p>
                        <p className="text-sm text-muted-foreground">In Safari's toolbar at the bottom</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">2. Tap "Add to Home Screen"</p>
                        <p className="text-sm text-muted-foreground">Scroll down if you don't see it</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">3. Tap "Add"</p>
                        <p className="text-sm text-muted-foreground">JobConnect will appear on your home screen</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : isAndroid ? (
                <>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Install on Android
                  </h2>
                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <MoreVertical className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">1. Tap the menu (⋮)</p>
                        <p className="text-sm text-muted-foreground">In Chrome's top-right corner</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Download className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">2. Tap "Install app" or "Add to Home screen"</p>
                        <p className="text-sm text-muted-foreground">Look for the install option</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">3. Confirm installation</p>
                        <p className="text-sm text-muted-foreground">JobConnect will appear on your home screen</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    Install from your browser
                  </h2>
                  <p className="text-muted-foreground">
                    Open this page on your mobile device's browser to install the app.
                  </p>
                </>
              )}
            </motion.div>
          )}

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="glass-card p-4 text-left"
              >
                <span className="text-2xl mb-2 block">{feature.icon}</span>
                <h3 className="font-semibold text-foreground text-sm">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
