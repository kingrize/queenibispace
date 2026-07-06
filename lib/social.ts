import { ReactNode } from 'react';
import { Timestamp } from 'firebase/firestore';

export type PostCategory = 'Modules' | 'Posts' | 'Media';

export interface PostStats {
  replies: number;
  reposts: number;
  likes: number;
  views: number;
}

export interface ModuleCardData {
  gradientStart?: string;
  iconColor?: string;
  icon?: ReactNode;
  urlPath?: string;
  title?: string;
  desc?: string;
}

export interface RawPostData {
  authorId?: string;
  authorUsername?: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  authorNameEffect?: string;
  text?: string;
  category?: PostCategory;
  createdAt?: Timestamp | null;
  moduleData?: ModuleCardData;
  linkTarget?: string;
  replyToPostId?: string;
  replyToUsername?: string;
  replyToDisplayName?: string;
  likedBy?: string[];
  repostedBy?: string[];
  stats?: Partial<PostStats>;
}

export interface AppPost {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl: string;
  authorNameEffect: string;
  text: string;
  category: PostCategory;
  createdAt?: Timestamp | null;
  moduleData?: ModuleCardData;
  linkTarget?: string;
  replyToPostId?: string;
  replyToUsername?: string;
  replyToDisplayName?: string;
  likedBy: string[];
  repostedBy: string[];
  stats: PostStats;
  interacted: {
    liked: boolean;
    reposted: boolean;
  };
  date: string;
}

const DEFAULT_STATS: PostStats = {
  replies: 0,
  reposts: 0,
  likes: 0,
  views: 0,
};

export function formatFirestoreDate(timestamp: Timestamp | null | undefined, mode: 'relative' | 'full' = 'relative') {
  if (!timestamp) return 'Just now';

  const date = timestamp.toDate();

  if (mode === 'full') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function normalizePost(id: string, data: RawPostData, currentUserId?: string | null, mode: 'relative' | 'full' = 'relative'): AppPost {
  const likedBy = Array.isArray(data?.likedBy) ? data.likedBy : [];
  const repostedBy = Array.isArray(data?.repostedBy) ? data.repostedBy : [];
  const legacyStats = data?.stats ?? {};

  const stats: PostStats = {
    replies: typeof legacyStats.replies === 'number' ? legacyStats.replies : 0,
    reposts: repostedBy.length,
    likes: likedBy.length,
    views: typeof legacyStats.views === 'number' ? legacyStats.views : 0,
  };

  return {
    id,
    authorId: data?.authorId ?? '',
    authorUsername: data?.authorUsername ?? 'user',
    authorDisplayName: data?.authorDisplayName ?? 'User',
    authorAvatarUrl: data?.authorAvatarUrl ?? '/avatar.jpg',
    authorNameEffect: data?.authorNameEffect ?? 'none',
    text: data?.text ?? '',
    category: data?.category ?? 'Posts',
    createdAt: data?.createdAt ?? null,
    moduleData: data?.moduleData,
    linkTarget: data?.linkTarget,
    replyToPostId: data?.replyToPostId,
    replyToUsername: data?.replyToUsername,
    replyToDisplayName: data?.replyToDisplayName,
    likedBy,
    repostedBy,
    stats: { ...DEFAULT_STATS, ...stats },
    interacted: {
      liked: !!currentUserId && likedBy.includes(currentUserId),
      reposted: !!currentUserId && repostedBy.includes(currentUserId),
    },
    date: formatFirestoreDate(data?.createdAt ?? null, mode),
  };
}

export function sortPostsByCreatedAt<T extends { createdAt?: Timestamp | null }>(posts: T[]) {
  return [...posts].sort((a, b) => {
    const aMs = a.createdAt?.toMillis?.() ?? 0;
    const bMs = b.createdAt?.toMillis?.() ?? 0;
    return bMs - aMs;
  });
}
