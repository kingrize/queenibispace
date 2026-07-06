export interface UserProfile {
  displayName?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate?: string;
  nameEffect?: string;
  avatarUrl?: string;
}

export const PUBLIC_SITE_CONFIG_COLLECTION = 'public_config';
export const PUBLIC_SITE_CONFIG_DOC = 'site';

export interface PublicSiteConfig {
  ownerUid?: string;
  ownerUsername?: string;
}

export const PUBLIC_OWNER_PROFILE_FALLBACK: UserProfile = {
  displayName: 'Jiya Dev',
  username: 'jiya',
  bio: 'building weird personal tools, posting build logs, and slowly making the internet feel more useful for myself.',
  location: 'Indonesia',
  website: 'jiya.local',
  joinedDate: 'February 2024',
  nameEffect: 'none',
  avatarUrl: '/avatar.jpg',
};

export const PUBLIC_SITE_CONFIG_FALLBACK: Required<Pick<PublicSiteConfig, 'ownerUsername'>> = {
  ownerUsername: PUBLIC_OWNER_PROFILE_FALLBACK.username || 'jiya',
};

export function resolvePublicOwnerUsername(config?: PublicSiteConfig | null) {
  return config?.ownerUsername?.trim().toLowerCase() || PUBLIC_SITE_CONFIG_FALLBACK.ownerUsername;
}

export function isConfiguredOwner(input?: { currentUid?: string | null; config?: PublicSiteConfig | null }) {
  const currentUid = input?.currentUid?.trim() || '';
  const ownerUid = input?.config?.ownerUid?.trim() || '';

  return Boolean(currentUid && ownerUid && currentUid === ownerUid);
}
