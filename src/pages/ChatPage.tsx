import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Message {
  id: string;
  body: string;
  sender_id: string;
  timestamp?: any;
}

interface OtherUser {
  id: string;
  username: string;
  photoUrl?: string;
}

interface Application {
  applicantId: string;
  posterId: string;
}

interface ChatPageProps {
  navigate: (page: string) => void;
  params: { appId: string };
}

export function ChatPage({ navigate, params }: ChatPageProps) {
  const { appId } = params;
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const setup = async () => {
      if (!currentUser) return;
      
      const appSnap = await getDoc(doc(db, "applications", appId));
      if (appSnap.exists()) {
        const data = appSnap.data() as Application;
        setApplication(data);
        
        const otherId = currentUser.uid === data.applicantId ? data.posterId : data.applicantId;
        const userSnap = await getDoc(doc(db, "users", otherId));
        if (userSnap.exists()) {
          setOtherUser({ id: userSnap.id, ...userSnap.data() } as OtherUser);
        }
      }
    };
    setup();
  }, [appId, currentUser]);

  useEffect(() => {
    if (!application) return;
    
    const q = query(
      collection(db, "messages"),
      where("application_id", "==", appId),
      orderBy("timestamp", "asc")
    );
    
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Message[]);
    });
  }, [application, appId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUser || !currentUser) return;
    
    await addDoc(collection(db, "messages"), {
      body: newMessage,
      sender_id: currentUser.uid,
      receiver_id: otherUser.id,
      application_id: appId,
      timestamp: serverTimestamp(),
    });
    setNewMessage("");
  };

  if (!otherUser) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-16">
      <div className="container max-w-2xl">
        <BackButton navigate={navigate} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.photoUrl} alt={otherUser.username} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {otherUser.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{otherUser.username}</h3>
              <p className="text-xs text-muted-foreground">Active conversation</p>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-secondary/30">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  No messages yet. Start the conversation!
                </p>
              </div>
            )}
            
            {messages.map((msg, idx) => {
              const isSender = msg.sender_id === currentUser?.uid;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`chat-bubble ${
                      isSender ? "chat-bubble-sent" : "chat-bubble-received"
                    }`}
                  >
                    {msg.body}
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-border bg-card">
            <div className="flex gap-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-gradient-primary hover:opacity-90 shadow-glow"
                disabled={!newMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
