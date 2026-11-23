import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { findMemberByAuthUser, verifyAndBootstrapAdmin } from '../lib/firestore-service';
import { clearMemberSession, getMemberSession, saveMemberSession } from '../lib/member-session';
import type { AdminUser, Member } from '../types/rcf';
import { AuthContext, type AuthOutcome } from './auth-context';

function memberToSession(member: Member) {
  return {
    uid: member.uid,
    email: member.email,
    memberId: member.memberId,
    fullName: member.fullName,
    category: member.category,
    unit: member.unit,
    executivePortfolio: member.executivePortfolio,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [memberProfile, setMemberProfile] = useState<Member | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  const resolvingRef = useRef(0);

  const resolveUserRoleAndProfile = useCallback(async (user: User): Promise<AuthOutcome> => {
    const token = ++resolvingRef.current;

    const verifiedAdmin = await verifyAndBootstrapAdmin(user);
    if (token !== resolvingRef.current) {
      return verifiedAdmin ? 'admin' : 'new';
    }

    if (verifiedAdmin) {
      setAdminUser(verifiedAdmin);
      setMemberProfile(null);
      return 'admin';
    }

    setAdminUser(null);

    const foundMember = await findMemberByAuthUser(user);
    if (token !== resolvingRef.current) {
      return foundMember ? 'member' : 'new';
    }

    if (foundMember) {
      setMemberProfile(foundMember);
      saveMemberSession(memberToSession(foundMember));
      return 'member';
    }

    // Check local cache ONLY if it belongs to this exact authenticated UID/email
    const cached = getMemberSession();
    if (
      cached &&
      ((cached.uid && cached.uid === user.uid) ||
        (cached.email && user.email && cached.email.toLowerCase() === user.email.toLowerCase()))
    ) {
      const fallbackMember: Member = {
        id: cached.memberId,
        uid: cached.uid ?? user.uid,
        memberId: cached.memberId,
        fullName: cached.fullName,
        category: cached.category,
        yearJoined: new Date().getFullYear(),
        email: cached.email ?? user.email ?? undefined,
        unit: cached.unit,
        executivePortfolio: cached.executivePortfolio,
        submissionNonce: 'cached',
        createdAt: null,
        updatedAt: null,
      };
      setMemberProfile(fallbackMember);
      return 'member';
    }

    clearMemberSession();
    setMemberProfile(null);
    return 'new';
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthError('');

      if (!user) {
        resolvingRef.current++;
        setAdminUser(null);
        setMemberProfile(null);
        clearMemberSession();
        setLoading(false);
        return;
      }

      try {
        await resolveUserRoleAndProfile(user);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [resolveUserRoleAndProfile]);

  const signInWithGoogle = useCallback(async (): Promise<AuthOutcome> => {
    if (signingIn) return 'cancelled';
    setSigningIn(true);
    setAuthError('');

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      setFirebaseUser(credential.user);
      const outcome = await resolveUserRoleAndProfile(credential.user);
      setLoading(false);
      return outcome;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Google sign-in could not be completed. Please try again.';
      setAuthError(message);
      return 'cancelled';
    } finally {
      setSigningIn(false);
    }
  }, [signingIn, resolveUserRoleAndProfile]);

  const signOutUser = useCallback(async () => {
    resolvingRef.current++;
    await signOut(auth);
    clearMemberSession();
    setFirebaseUser(null);
    setAdminUser(null);
    setMemberProfile(null);
    setAuthError('');
  }, []);

  const setResolvedMemberProfile = useCallback((member: Member) => {
    setMemberProfile(member);
    saveMemberSession(memberToSession(member));
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError('');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loading,
        firebaseUser,
        adminUser,
        memberProfile,
        signingIn,
        authError,
        clearAuthError,
        signInWithGoogle,
        signOutUser,
        setResolvedMemberProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
