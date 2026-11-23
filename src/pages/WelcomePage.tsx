import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { TestimonyComposer } from '../components/TestimonyComposer';
import type { MemberSession } from '../types/rcf';

export function WelcomePage() {
  const { loading, firebaseUser, adminUser, memberProfile } = useAuth();

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#0B2545] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-slate-600">Loading your testimony studio...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (!memberProfile && !adminUser) {
    return <Navigate to="/complete-profile" replace />;
  }

  const memberSession: MemberSession = memberProfile
    ? {
        uid: memberProfile.uid,
        email: memberProfile.email,
        memberId: memberProfile.memberId,
        fullName: memberProfile.fullName,
        category: memberProfile.category,
        unit: memberProfile.unit,
        executivePortfolio: memberProfile.executivePortfolio,
      }
    : {
        uid: adminUser!.uid,
        email: adminUser!.email,
        memberId: 'ADMIN',
        fullName: adminUser!.displayName || firebaseUser.displayName || adminUser!.email,
        category: 'Executive',
      };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-4">
      <div className="flex items-center justify-between gap-3">
        {memberProfile ? (
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0B2545] hover:underline"
          >
            <User className="w-4 h-4" />
            Back to My Profile ({memberProfile.fullName})
          </Link>
        ) : (
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0B2545] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </Link>
        )}
      </div>

      <TestimonyComposer memberSession={memberSession} />
    </div>
  );
}
