'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getIdToken } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

// ─── Types ────────────────────────────────────────
export interface UploadJob {
  id: string;
  fileName: string;
  fileSize: number;
  status: 'queued' | 'uploading' | 'done' | 'error';
  progress: { current: number; total: number };
  error?: string;
}

export interface UploadRequest {
  files: File[];
  targetStorage: 'telegram' | 'discord' | 'both';
  meta: { name: string; description: string; category: string };
  message: string;
  uid: string;
  author: string;
}

interface UploadContextValue {
  jobs: UploadJob[];
  isUploading: boolean;
  isMinimized: boolean;
  setIsMinimized: (v: boolean) => void;
  startUpload: (req: UploadRequest) => void;
  clearCompleted: () => void;
}

const UploadContext = createContext<UploadContextValue | null>(null);
export const useUpload = () => {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('useUpload must be used within UploadProvider');
  return ctx;
};

const TELEGRAM_MAX_SIZE = 50 * 1024 * 1024;
const CHUNK_SIZE = 8 * 1024 * 1024;

// ─── Provider ─────────────────────────────────────
export function UploadProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  const isUploading = jobs.some(j => j.status === 'uploading' || j.status === 'queued');

  const getFreshToken = async (): Promise<string> => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    return await getIdToken(auth.currentUser, false);
  };

  const updateJob = (id: string, patch: Partial<UploadJob>) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
  };

  const uploadChunksToDiscord = async (file: File, category: string, jobId: string): Promise<{ url: string; id: string }[]> => {
    const chunksData: { url: string; id: string }[] = [];

    if (file.size <= CHUNK_SIZE) {
      updateJob(jobId, { progress: { current: 1, total: 1 } });
      const payload = new FormData();
      payload.append('chunk', file);
      payload.append('filename', file.name);
      payload.append('category', category);
      const token = await getFreshToken();
      const res = await fetch('/api/discord/chunk', { method: 'POST', body: payload, headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Upload failed');
      const data = await res.json();
      chunksData.push({ url: data.data.url, id: data.data.message_id });
      return chunksData;
    }

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunkBlob = file.slice(start, end);
      const chunkFile = new File([chunkBlob], `${file.name}.part${i + 1}`);
      updateJob(jobId, { progress: { current: i + 1, total: totalChunks } });
      const payload = new FormData();
      payload.append('chunk', chunkFile);
      payload.append('filename', `${file.name}.part${i + 1}`);
      payload.append('category', category);
      const token = await getFreshToken();
      const res = await fetch('/api/discord/chunk', { method: 'POST', body: payload, headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || `Chunk ${i + 1} failed`);
      const data = await res.json();
      chunksData.push({ url: data.data.url, id: data.data.message_id });
    }
    return chunksData;
  };

  const processUpload = async (req: UploadRequest) => {
    for (let idx = 0; idx < req.files.length; idx++) {
      const file = req.files[idx];
      const jobId = `upload_${Date.now()}_${idx}`;
      const job: UploadJob = {
        id: jobId,
        fileName: file.name,
        fileSize: file.size,
        status: 'uploading',
        progress: { current: 0, total: 1 },
      };
      setJobs(prev => [...prev, job]);

      try {
        if (req.targetStorage === 'discord' || req.targetStorage === 'both') {
          const uploadedChunks = await uploadChunksToDiscord(file, req.meta.category, jobId);
          await addDoc(collection(db, 'storage_files'), {
            uid: req.uid,
            author: req.author,
            title: req.files.length === 1 ? req.meta.name : file.name,
            message: req.message || '',
            description: req.meta.description || null,
            category: req.meta.category,
            original_filename: file.name,
            storage_type: 'discord',
            discord_chunks: uploadedChunks,
            telegram_file_size: file.size,
            telegram_file_type: file.type,
            created_at: serverTimestamp(),
          });
        }

        if (req.targetStorage === 'telegram' || (req.targetStorage === 'both' && file.size <= TELEGRAM_MAX_SIZE)) {
          updateJob(jobId, { progress: { current: 1, total: 1 } });
          const payload = new FormData();
          payload.append('email', req.author);
          payload.append('message', req.message);
          payload.append('file', file);
          payload.append('category', req.meta.category);
          const token = await getFreshToken();
          const res = await fetch('/api/telegram', { method: 'POST', body: payload, headers: { 'Authorization': `Bearer ${token}` } });
          if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Telegram upload failed');
          const resData = await res.json();
          await addDoc(collection(db, 'storage_files'), {
            uid: req.uid,
            author: req.author,
            title: req.files.length === 1 ? req.meta.name : file.name,
            message: req.message || '',
            description: req.meta.description || null,
            category: req.meta.category,
            original_filename: file.name,
            storage_type: 'telegram',
            telegram_message_id: resData.data?.message_id || null,
            telegram_file_id: resData.data?.file_id || null,
            telegram_file_type: resData.data?.file_type || null,
            telegram_file_size: resData.data?.file_size || null,
            telegram_chat_id: resData.data?.chat_id || null,
            created_at: serverTimestamp(),
          });
        }

        updateJob(jobId, { status: 'done', progress: { current: 1, total: 1 } });
      } catch (err: unknown) {
        console.error('Upload error:', err);
        const error = err as Error;
        updateJob(jobId, { status: 'error', error: error.message || 'Upload failed' });
      }
    }
  };

  const startUpload = useCallback((req: UploadRequest) => {
    // Fire and forget — runs independently of component lifecycle
    processUpload(req);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearCompleted = useCallback(() => {
    setJobs(prev => prev.filter(j => j.status === 'uploading' || j.status === 'queued'));
  }, []);

  return (
    <UploadContext.Provider value={{ jobs, isUploading, isMinimized, setIsMinimized, startUpload, clearCompleted }}>
      {children}
    </UploadContext.Provider>
  );
}
