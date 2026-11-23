import type { MemberSession } from '../types/rcf';

const STORAGE_KEY = 'rcf_member_session_v1';

export function saveMemberSession(session: MemberSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage quota or private-mode restrictions
  }
}

export function getMemberSession(): MemberSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MemberSession>;
    if (
      typeof parsed.memberId === 'string' &&
      typeof parsed.fullName === 'string' &&
      typeof parsed.category === 'string'
    ) {
      return parsed as MemberSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearMemberSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
