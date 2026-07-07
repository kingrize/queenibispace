"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Heart, Image as ImageIcon, Plus, Search, Loader2, Trash2, Server, ServerCrash, HelpCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAlert } from "@/lib/alert-context";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { getIdToken } from "firebase/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useUpload } from "@/lib/upload-context";
import { StorageFile, inferCategory } from "@/lib/storage-utils";

type UploadTarget = "discord" | "telegram" | "both";

export default function GalleryApp() {
  const { user } = useAuth();
  const { confirm, alert } = useAlert();
  const [userToken, setUserToken] = useState<string | null>(null);
  const { startUpload, isUploading } = useUpload();
  
  const [memories, setMemories] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<StorageFile | null>(null);
  
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [targetServer, setTargetServer] = useState<UploadTarget>("both");

  // Prevent memory leaks on unmount
  const isMounted = useRef(true);

  // Fetch auth token and memories
  useEffect(() => {
    isMounted.current = true;
    if (!user) return;
    
    // Get token for proxy image requests
    getIdToken(user).then((token) => {
      if (isMounted.current) setUserToken(token);
    }).catch(console.error);

    let unsubscribe: () => void;
    try {
      const q = query(
        collection(db, "storage_files")
        // Removed 'where' clause so the gallery acts as a shared space
      );
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!isMounted.current) return;
        const dbFiles: StorageFile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          dbFiles.push({ id: docSnap.id, ...data } as StorageFile);
        });
        
        // Sort client-side to avoid Firestore composite index requirement
        dbFiles.sort((a, b) => {
          const aTime = a.created_at?.toMillis?.() || Date.now();
          const bTime = b.created_at?.toMillis?.() || Date.now();
          return bTime - aTime;
        });
        
        // Filter only images
        const imageFiles = dbFiles.filter(f => inferCategory(f) === 'image');
        setMemories(imageFiles);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching memories:", error);
        if (isMounted.current) setLoading(false);
      });
    } catch (e) {
      console.error("Firebase fetch setup error:", e);
      if (isMounted.current) setLoading(false);
    }
    
    return () => {
      isMounted.current = false;
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const filteredMemories = memories.filter(m => {
    const search = searchQuery.toLowerCase();
    const captionText = m.message || m.description || m.title || m.original_filename || "";
    return captionText.toLowerCase().includes(search);
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file || !user) return;
    
    startUpload({
      files: [file],
      targetStorage: targetServer,
      meta: {
        name: file.name,
        description: caption,
        category: "image"
      },
      message: caption,
      uid: user.uid,
      author: user.displayName || "User"
    });
    
    setShowUploadModal(false);
    setFile(null);
    setCaption("");
    setTargetServer("both");
  };

  const handleDelete = async (target: StorageFile, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const isConfirmed = await confirm({
      title: "Delete Memory",
      message: "Are you sure you want to delete this memory? It will be removed from your gallery.",
      type: "destructive",
      confirmText: "Delete"
    });
    
    if (!isConfirmed) return;
    
    try {
      // User only needs UI/database deletion, backend deletion is bypassed per request
      await deleteDoc(doc(db, 'storage_files', target.id));
      if (selectedImage?.id === target.id) {
        setSelectedImage(null);
      }
    } catch (error) { 
      console.error('Delete failed:', error); 
      await alert({
        title: "Deletion Failed",
        message: "Failed to delete the memory. Please try again."
      });
    }
  };

  const getFileUrl = (fileDef: StorageFile) => {
    if (!userToken) return "";
    const isDiscord = fileDef.storage_type === 'discord';
    if (isDiscord && fileDef.discord_chunks) {
      return `/api/discord/stream?fileId=${fileDef.id}&token=${userToken}`;
    }
    if (!isDiscord && fileDef.telegram_file_id) {
      return `/api/telegram/getfile?file_id=${fileDef.telegram_file_id}&filename=${encodeURIComponent(fileDef.original_filename || fileDef.title || 'image.jpg')}&token=${userToken}`;
    }
    return "";
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfdfc] dark:bg-[#000000] font-sans">
      
      {/* macOS Style Toolbar */}
      <div className="h-12 sm:h-16 shrink-0 sticky top-0 z-10 bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-[40px] border-b border-black/5 dark:border-white/10 px-3 sm:px-5 flex items-center justify-between gap-2">
        
        {/* Invisible spacer for window controls */}
        <div className="w-16 h-full flex items-center">
          <span className="text-[13px] font-semibold text-foreground/80 pl-2">Photos</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
            <input 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-32 sm:w-48 h-7 pl-8 pr-3 text-[12px] bg-black/5 dark:bg-white/10 border border-transparent focus:border-blue-500 rounded-md outline-none text-foreground placeholder:text-muted-foreground transition-all"
            />
          </div>
          
          <button 
            onClick={() => setShowUploadModal(true)} 
            disabled={isUploading}
            className="h-7 px-2 sm:px-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-md text-[12px] font-medium flex items-center gap-1 sm:gap-1.5 transition-colors shadow-sm shrink-0"
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isUploading ? "Uploading..." : "Import"}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6">
        {loading ? (
          // Skeleton Loader
          <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-6 space-y-3 sm:space-y-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="break-inside-avoid bg-black/5 dark:bg-white/5 animate-pulse rounded-[18px] h-64 border border-black/5 dark:border-white/5"></div>
            ))}
          </div>
        ) : filteredMemories.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
            <div className="w-24 h-24 mb-6 text-black/10 dark:text-white/10 flex items-center justify-center">
              <ImageIcon className="w-20 h-20" strokeWidth={1} />
            </div>
            <h3 className="text-[18px] font-medium text-foreground mb-1">No Photos Found</h3>
            <p className="text-[13px] text-muted-foreground mb-6">
              {searchQuery ? "No matches for your search." : "Import your first memory to securely store it on our proxy servers."}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-1.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-md text-[13px] font-medium transition-colors"
              >
                Import Photos
              </button>
            )}
          </div>
        ) : (
          // Masonry Grid Squircles
          <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-6 space-y-3 sm:space-y-6 pb-10">
            <AnimatePresence>
              {filteredMemories.map((memory) => (
                <motion.div
                  key={memory.id}
                  layout
                  layoutId={`memory-card-${memory.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="break-inside-avoid relative rounded-[14px] sm:rounded-[20px] overflow-hidden cursor-pointer group bg-black/5 dark:bg-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/10 transition-all duration-300"
                  onClick={() => setSelectedImage(memory)}
                >
                  <img
                    src={getFileUrl(memory)}
                    alt={memory.title || "Memory"}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-end">
                      <div className="flex flex-col gap-1">
                        <p className="text-white text-[12px] font-medium drop-shadow-md line-clamp-2 max-w-[85%]">
                          {memory.message || memory.description || memory.title || ""}
                        </p>
                        {memory.author && (
                          <span className="text-[10px] text-white/70 font-medium tracking-wide uppercase">
                            {memory.author}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDelete(memory, e)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 hover:bg-red-500/80 text-white/90 hover:text-white transition-colors backdrop-blur-md"
                        title="Delete memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upload Modal (macOS Style) */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Import Memory" maxWidth="md">
        <div className="space-y-5 p-2">
          
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[16px] p-8 flex flex-col items-center justify-center transition-all duration-200 ${
              isDragging ? "border-blue-500 bg-blue-500/10 scale-[1.02]" : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-3">
                  <ImageIcon className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-[13px] font-medium text-foreground truncate max-w-[200px]">{file.name}</p>
                <button 
                  onClick={() => setFile(null)} 
                  className="text-[11px] text-red-500 mt-1 hover:underline"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center mb-3 text-muted-foreground group-hover:text-blue-500 transition-colors">
                  <Upload className="w-5 h-5" strokeWidth={2} />
                </div>
                <p className="text-[13px] font-medium text-foreground mb-1">Drag & drop image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <button 
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="text-[12px] text-blue-500 hover:underline mt-1"
                >
                  or browse files
                </button>
              </>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Caption</label>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a description..."
                className="w-full h-8 px-3 text-[13px] bg-black/5 dark:bg-white/10 border border-transparent focus:border-blue-500 rounded-md outline-none text-foreground placeholder:text-muted-foreground transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Upload Target</span>
                <span title="Select which backend proxy server handles your file."><HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50" /></span>
              </label>
              <div className="flex items-center bg-black/5 dark:bg-white/10 p-1 rounded-[10px]">
                {[
                  { id: "telegram", label: "Server 1", sub: "Fast" },
                  { id: "discord", label: "Server 2", sub: "Capacity" },
                  { id: "both", label: "Both", sub: "Redundant" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTargetServer(t.id as UploadTarget)}
                    className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-[7px] transition-all duration-200 ${
                      targetServer === t.id 
                        ? "bg-white dark:bg-[#3a3a3c] shadow-sm text-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="text-[12px] font-medium leading-none">{t.label}</span>
                    <span className="text-[9px] opacity-70 mt-0.5">{t.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button 
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-1.5 rounded-md text-[13px] font-medium text-foreground bg-transparent hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload} 
              disabled={!file} 
              className="px-4 py-1.5 rounded-md text-[13px] font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 transition-colors shadow-sm"
            >
              Import
            </button>
          </div>
        </div>
      </Modal>

      {/* Quick Look Image Viewer Overlay */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-2xl"
              onClick={() => setSelectedImage(null)}
            />
            
            {/* Quick Look Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 z-20 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-xl shadow-2xl"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
              <div className="w-px h-5 bg-white/20 mx-1" />
              <button
                onClick={() => handleDelete(selectedImage)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/80 text-white/90 hover:text-white transition-colors group"
                title="Delete from proxy servers"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={2} />
              </button>
            </motion.div>

            <motion.div
              layoutId={`memory-card-${selectedImage.id}`}
              className="relative z-10 max-w-5xl w-full flex flex-col items-center justify-center h-full pointer-events-none"
            >
              <img
                src={getFileUrl(selectedImage)}
                alt={selectedImage.title || "Memory"}
                className="max-h-[80vh] w-auto object-contain shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-[8px] pointer-events-auto"
              />
              
              {(selectedImage.message || selectedImage.description || selectedImage.title || selectedImage.author) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-6 bg-black/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-[14px] text-white/90 shadow-xl max-w-xl text-center pointer-events-auto"
                >
                  <p className="text-[14px] font-medium leading-snug">
                    {selectedImage.message || selectedImage.description}
                  </p>
                  {selectedImage.author && (
                    <p className="mt-1.5 text-[11px] font-semibold tracking-wider text-white/50 uppercase">
                      By {selectedImage.author}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
