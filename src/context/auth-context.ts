import { createContext, useContext } from 'react';
import type { User } from 'firebase/auth';
import type { AdminUser, Member } from '../types/rcf';

export type AuthOutcome = 'admin' | 'member' | 'new' | 'cancelled';

export interface AuthContextValue {
  loading: boolean;
  firebaseUser: User | null;
  adminUser: AdminUser | null;
  memberProfile: Member | null;
  signingIn: boolean;
  authError: string;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<AuthOutcome>;
  signOutUser: () => Promise<void>;
  setResolvedMemberProfile: (member: Member) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
