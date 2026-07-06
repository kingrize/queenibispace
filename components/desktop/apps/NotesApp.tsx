"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Search, FileText, ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAlert } from "@/lib/alert-context";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

interface Note {
  id: string;
  title: string;
  content: string;
  uid: string;
  author?: string;
  createdAt: number;
  updatedAt: number;
}

export default function NotesApp() {
  const { user } = useAuth();
  const { confirm, alert } = useAlert();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  
  const [activeTitle, setActiveTitle] = useState("");
  const [activeContent, setActiveContent] = useState("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch notes
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "notes")
      // Removed the 'where' clause so we fetch all shared notes across the couple!
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Note[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as Note);
      });
      // Sort locally so we don't need a composite index on uid+updatedAt
      fetched.sort((a, b) => b.updatedAt - a.updatedAt);
      setNotes(fetched);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching notes:", error);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Load selected note into editor state
  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  
  useEffect(() => {
    if (selectedNote) {
      setActiveTitle(selectedNote.title);
      setActiveContent(selectedNote.content);
    } else {
      setActiveTitle("");
      setActiveContent("");
    }
  }, [selectedNoteId]); // Only trigger when selection changes!

  // Auto-save logic
  useEffect(() => {
    if (!selectedNoteId || !user) return;
    
    // Prevent saving if it hasn't actually changed from DB state (e.g. initial load)
    if (selectedNote && selectedNote.title === activeTitle && selectedNote.content === activeContent) {
      return;
    }
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateDoc(doc(db, "notes", selectedNoteId), {
          title: activeTitle,
          content: activeContent,
          updatedAt: Date.now(),
        });
      } catch (error) {
        console.error("Failed to auto-save note:", error);
      }
    }, 1000); // 1s debounce
    
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [activeTitle, activeContent, selectedNoteId, user, selectedNote]);

  const handleCreateNote = async () => {
    if (!user) return;
    
    const newNote = {
      title: "New Note",
      content: "",
      uid: user.uid,
      author: user.displayName || "User",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    try {
      const docRef = await addDoc(collection(db, "notes"), newNote);
      setSelectedNoteId(docRef.id);
      setIsMobileListVisible(false);
    } catch (error) {
      console.error("Failed to create note:", error);
      alert({
        title: "Permission Denied",
        message: "Failed to create note. Please ensure you have added the 'notes' collection security rule to your Firebase Console!"
      });
    }
  };

  const handleDeleteNote = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const confirmed = await confirm({
      title: "Delete Note",
      message: "Are you sure you want to delete this note? This action cannot be undone.",
      type: "destructive",
      confirmText: "Delete"
    });
    
    if (!confirmed) return;
    
    try {
      await deleteDoc(doc(db, "notes", id));
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
        setIsMobileListVisible(true);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Failed to delete the note. Please try again.");
    }
  };

  const filteredNotes = notes.filter(n => 
    (n.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (n.content || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    if (Date.now() - timestamp < 86400000) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-full bg-[#fdfdfc] dark:bg-[#1e1e1e] font-sans overflow-hidden">
      
      {/* Sidebar / List Pane */}
      <div 
        className={`${!isMobileListVisible ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-64 lg:w-72 shrink-0 border-r border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] h-full`}
      >
        <div className="h-16 flex items-center px-4 justify-between border-b border-black/5 dark:border-white/10">
          <button 
            onClick={handleCreateNote}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="New Note"
          >
            <Plus className="w-5 h-5 text-black/70 dark:text-white/70" />
          </button>
        </div>
        
        <div className="p-3 border-b border-black/5 dark:border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border-none rounded-lg pl-9 pr-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-black/40 dark:placeholder:text-white/40"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-[13px] text-black/40 dark:text-white/40">Loading...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-black/40 dark:text-white/40 flex flex-col items-center">
              <FileText className="w-8 h-8 mb-2 opacity-20" />
              <p>No notes found</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setIsMobileListVisible(false);
                  }}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNoteId === note.id 
                      ? 'bg-blue-500/10 dark:bg-blue-500/20' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <h4 className={`font-semibold text-[13px] truncate pr-6 ${selectedNoteId === note.id ? 'text-blue-600 dark:text-blue-400' : 'text-black/90 dark:text-white/90'}`}>
                    {note.title || "Untitled"}
                  </h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[11px] font-medium text-black/40 dark:text-white/40">
                      {formatDate(note.updatedAt)}
                      {note.author && (
                        <span className="ml-2 px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded text-[9px] uppercase tracking-wider text-black/50 dark:text-white/50">
                          {note.author}
                        </span>
                      )}
                    </span>
                    <span className="text-[12px] text-black/50 dark:text-white/50 truncate pl-2">
                      {note.content.substring(0, 30) || "No additional text"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className="absolute right-2 top-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Editor Pane */}
      <div className={`${isMobileListVisible ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full relative`}>
        {selectedNoteId ? (
          <>
            <div className="h-16 flex items-center px-4 border-b border-black/5 dark:border-white/10 shrink-0 bg-black/[0.01] dark:bg-white/[0.01]">
              <button 
                onClick={() => setIsMobileListVisible(true)}
                className="md:hidden mr-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-black/70 dark:text-white/70"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex-1" />
              <button
                onClick={() => handleDeleteNote(selectedNoteId)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-black/40 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 transition-colors"
                title="Delete Note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 sm:p-12 lg:px-24">
              <div className="max-w-3xl mx-auto flex flex-col h-full space-y-4">
                <input
                  type="text"
                  value={activeTitle}
                  onChange={(e) => setActiveTitle(e.target.value)}
                  placeholder="Note Title"
                  className="w-full bg-transparent border-none text-[28px] font-bold text-black/90 dark:text-white/90 focus:outline-none focus:ring-0 placeholder:text-black/20 dark:placeholder:text-white/20 px-0"
                />
                <p className="text-[11px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-wider">
                  {formatDate(selectedNote?.updatedAt || Date.now())}
                </p>
                <textarea
                  value={activeContent}
                  onChange={(e) => setActiveContent(e.target.value)}
                  placeholder="Start typing..."
                  className="w-full flex-1 bg-transparent border-none resize-none text-[15px] leading-relaxed text-black/80 dark:text-white/80 focus:outline-none focus:ring-0 placeholder:text-black/30 dark:placeholder:text-white/30 px-0"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-black/30 dark:text-white/30">
            <FileText className="w-12 h-12 mb-4 opacity-20" strokeWidth={1} />
            <p className="text-[13px] font-medium">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
