export interface StorageFile {
  id: string;
  uid: string;
  author: string;
  title: string;
  message: string;
  description: string | null;
  category: string | null;
  original_filename: string | null;
  storage_type?: 'telegram' | 'discord';
  discord_chunks?: { url: string; id: string }[];
  telegram_file_id: string | null;
  telegram_file_type: string | null;
  telegram_file_size: number | null;
  telegram_message_id: number | null;
  telegram_chat_id: number | null;
  created_at: { toMillis?: () => number; toDate?: () => Date } | null;
}

export type SavedItemsFilter = 'all' | 'note' | 'image' | 'audio' | 'video' | 'document' | 'backup' | 'other';

export const FILE_CATEGORIES = [
  { value: 'image', label: 'Image', color: 'bg-red-100 text-red-700 dark:bg-red-900/10 dark:text-red-400' },
  { value: 'audio', label: 'Audio', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400' },
  { value: 'video', label: 'Video', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400' },
  { value: 'document', label: 'Document', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400' },
  { value: 'note', label: 'Note', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/10 dark:text-orange-400' },
  { value: 'backup', label: 'Backup', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/10 dark:text-purple-400' },
  { value: 'other', label: 'Other', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
] as const;

export const SAVED_ITEMS_FILTERS: Array<{ value: SavedItemsFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'note', label: 'Notes' },
  { value: 'image', label: 'Images' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Documents' },
  { value: 'backup', label: 'Backups' },
  { value: 'other', label: 'Other' },
];

export const getCategoryStyle = (category: string | null) =>
  FILE_CATEGORIES.find((item) => item.value === category)?.color || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

export const getCategoryLabel = (category: string | null) =>
  FILE_CATEGORIES.find((item) => item.value === category)?.label || 'Other';

export const inferCategory = (fileDef: StorageFile): Exclude<SavedItemsFilter, 'all'> => {
  if (fileDef.category === 'note' || !fileDef.original_filename) return 'note';
  if (fileDef.category === 'audio' || fileDef.telegram_file_type?.startsWith('audio/')) return 'audio';
  if (fileDef.category === 'video' || fileDef.telegram_file_type?.startsWith('video/')) return 'video';
  if (fileDef.category === 'image' || fileDef.telegram_file_type?.startsWith('image/')) return 'image';
  if (fileDef.category === 'backup') return 'backup';
  if (fileDef.category === 'other') return 'other';
  return 'document';
};

export const formatFileSize = (size: number | null) => {
  if (!size) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};
