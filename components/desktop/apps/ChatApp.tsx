"use client";

import React, { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Users, Search, Image as ImageIcon, Smile, Paperclip } from "lucide-react";

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar: string;
  createdAt: Timestamp | null;
}

export default function ChatApp() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages in real-time
  useEffect(() => {
    const q = query(
      collection(db, "chat_messages"),
      orderBy("createdAt", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const text = newMessage;
    setNewMessage(""); // Optimistic clear

    try {
      await addDoc(collection(db, "chat_messages"), {
        text,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userAvatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message: ", error);
      // Optional: restore message if failed
    }
  };

  // Find the partner's info from messages
  const partnerMessage = messages.find(m => user && m.userId !== user.uid);
  const partnerName = partnerMessage ? partnerMessage.userName : "My Love ❤️";
  const partnerAvatar = partnerMessage ? partnerMessage.userAvatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=love`;

  return (
    <div className="flex h-full bg-[#ececec] dark:bg-[#1e1e1e] font-sans overflow-hidden text-foreground">
      
      {/* Sidebar */}
      <div className="w-[280px] shrink-0 bg-[#f5f5f7]/80 dark:bg-[#2c2c2e]/80 backdrop-blur-xl border-r border-black/10 dark:border-white/10 flex flex-col z-10">
        {/* Top Spacer for Traffic Lights */}
        <div className="h-[52px] shrink-0 flex items-center px-4 pt-1">
          <div className="w-[60px]" /> {/* Traffic lights spacer */}
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3 border-b border-black/5 dark:border-white/5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full h-7 pl-8 pr-3 text-[12px] bg-black/5 dark:bg-white/10 border border-transparent focus:border-black/20 dark:focus:border-white/20 rounded-md outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <div className="flex items-center gap-3 p-2 bg-[#007aff] text-white rounded-lg cursor-pointer">
            <img 
              src={partnerAvatar}
              alt={partnerName}
              className="w-10 h-10 rounded-full object-cover shrink-0 bg-white/20"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-semibold text-[13px] truncate">{partnerName}</h3>
                <span className="text-[11px] text-white/70">Now</span>
              </div>
              <p className="text-[12px] text-white/80 truncate">
                {messages.length > 0 
                  ? (messages[messages.length - 1].userId === user?.uid ? `You: ${messages[messages.length - 1].text}` : messages[messages.length - 1].text)
                  : "Say hi to your love..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#1c1c1e] relative">
        
        {/* Header */}
        <div className="h-[52px] shrink-0 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 flex items-center px-6 z-10">
          <div className="flex flex-col">
            <span className="font-semibold text-[13px]">To: {partnerName}</span>
            <span className="text-[11px] text-muted-foreground">{messages.length} messages</span>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Users className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">No messages yet. Be the first to say hi!</p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isMe = user ? msg.userId === user.uid : false;
              const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.userId !== msg.userId);
              const isConsecutive = index > 0 && messages[index - 1].userId === msg.userId;

              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                >
                  <div className={`flex items-end max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                    
                    {/* Avatar for others */}
                    {!isMe && (
                      <div className="w-7 h-7 shrink-0">
                        {showAvatar && (
                          <img 
                            src={msg.userAvatar} 
                            alt={msg.userName} 
                            className="w-7 h-7 rounded-full object-cover shadow-sm bg-black/5 dark:bg-white/5"
                          />
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Name for others */}
                      {!isMe && !isConsecutive && (
                        <span className="text-[11px] text-muted-foreground ml-1 mb-1">{msg.userName}</span>
                      )}
                      
                      {/* Bubble */}
                      <div 
                        className={`px-4 py-2 text-[14px] leading-relaxed shadow-sm ${
                          isMe 
                            ? 'bg-[#007aff] text-white rounded-2xl rounded-br-sm' 
                            : 'bg-[#e9e9eb] dark:bg-[#3a3a3c] text-black dark:text-white rounded-2xl rounded-bl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-t border-black/5 dark:border-white/5 shrink-0">
          {!user ? (
            <div className="text-center p-3 text-sm text-muted-foreground bg-black/5 dark:bg-white/5 rounded-full">
              Please sign in to send messages.
            </div>
          ) : (
            <form 
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 bg-black/5 dark:bg-white/10 rounded-full px-4 py-2 border border-black/5 dark:border-white/10 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors"
            >
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <Paperclip className="w-5 h-5" />
              </button>
              
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="iMessage"
                className="flex-1 bg-transparent outline-none text-[14px] px-2 min-w-0"
              />
              
              {newMessage.trim() ? (
                <button 
                  type="submit" 
                  className="w-7 h-7 rounded-full bg-[#007aff] flex items-center justify-center shrink-0 hover:bg-[#006ee6] transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 text-white ml-0.5" />
                </button>
              ) : (
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <Smile className="w-5 h-5" />
                </button>
              )}
            </form>
          )}
        </div>
        
      </div>
    </div>
  );
}
