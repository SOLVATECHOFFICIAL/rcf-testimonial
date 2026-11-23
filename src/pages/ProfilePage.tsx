import { Link, Navigate } from 'react-router-dom';
import {
  Award,
  Briefcase,
  Calendar,
  GraduationCap,
  HeartHandshake,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { formatNigeriaDateTime } from '../lib/rcf-utils';
import { RcfLogo } from '../components/RcfLogo';

export function ProfilePage() {
  const { loading, firebaseUser, adminUser, memberProfile, signOutUser } = useAuth();

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#0B2545] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminUser && !memberProfile) {
    return <Navigate to="/admin" replace />;
  }

  if (!memberProfile) {
    return <Navigate to="/complete-profile" replace />;
  }

  const joinedLabel = [
    memberProfile.dateJoined ? `Day ${memberProfile.dateJoined}` : '',
    memberProfile.monthJoined || '',
    String(memberProfile.yearJoined),
    memberProfile.timeJoined ? `at ${memberProfile.timeJoined}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Header Identity Card */}
      <section className="bg-gradient-to-br from-[#0B2545] to-[#1A3B6E] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            {firebaseUser.photoURL ? (
              <img
                src={firebaseUser.photoURL}
                alt={memberProfile.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#F5B700]/60 shrink-0"
              />
            ) : (
              <RcfLogo size="md" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F5B700]">
                RCF Fellowship Profile
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold truncate mt-0.5">
                {memberProfile.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-200 mt-1">
                <span className="font-mono-tabular font-semibold text-[#F5B700]">
                  {memberProfile.memberId}
                </span>
                <span aria-hidden="true">&middot;</span>
                <span>{memberProfile.category}</span>
                {memberProfile.category === 'Worker' && memberProfile.unit && (
                  <>
                    <span aria-hidden="true">&middot;</span>
                    <span>{memberProfile.unit} Unit</span>
                  </>
                )}
                {memberProfile.category === 'Executive' && memberProfile.executivePortfolio && (
                  <>
                    <span aria-hidden="true">&middot;</span>
                    <span>
                      {memberProfile.executivePortfolio}
                      {memberProfile.executiveSession ? ` (${memberProfile.executiveSession})` : ''}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/welcome"
              className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F5B700] to-[#FBBF24] text-[#0B2545] text-sm font-bold hover:from-[#eab000] hover:to-[#F59E0B] transition-all shadow-xs"
            >
              <HeartHandshake className="w-4 h-4" />
              Share Testimony
            </Link>
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="inline-flex items-center justify-center gap-2 min-h-[46px] px-4 py-2.5 rounded-xl border border-white/25 bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* Profile Details Grid */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0B2545]">
              Registered Fellowship Details
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Linked to your verified Google email for passwordless login recovery.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4" />
            Verified via Google
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#0369A1]" />
              Membership Category
            </dt>
            <dd className="font-semibold text-[#0B2545]">{memberProfile.category}</dd>
          </div>

          {memberProfile.category === 'Worker' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#0F766E]" />
                Fellowship Unit
              </dt>
              <dd className="font-semibold text-[#0B2545]">
                {memberProfile.unit || '—'}
                {memberProfile.workerRole ? ` · ${memberProfile.workerRole}` : ''}
              </dd>
            </div>
          )}

          {memberProfile.category === 'Executive' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#B45309]" />
                Executive Portfolio &amp; Session
              </dt>
              <dd className="font-semibold text-[#0B2545]">
                {memberProfile.executivePortfolio || '—'}
                {memberProfile.executiveSession ? ` (${memberProfile.executiveSession})` : ''}
              </dd>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#6D28D9]" />
              Joined RCF
            </dt>
            <dd className="font-semibold text-[#0B2545]">{joinedLabel}</dd>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#0369A1]" />
              Google Email
            </dt>
            <dd className="font-semibold text-[#0B2545] break-all">
              {memberProfile.email || firebaseUser.email || '—'}
            </dd>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#0F766E]" />
              Phone Number
            </dt>
            <dd className="font-semibold text-[#0B2545]">{memberProfile.phone || '—'}</dd>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 sm:col-span-2">
            <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#0B2545]" />
              Academic Details
            </dt>
            <dd className="font-semibold text-[#0B2545]">
              {[memberProfile.department, memberProfile.faculty, memberProfile.level]
                .filter(Boolean)
                .join(' · ') || '—'}
            </dd>
          </div>
        </dl>

        {memberProfile.createdAt && (
          <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
            Profile registered: {formatNigeriaDateTime(memberProfile.createdAt)}
          </p>
        )}
      </section>
    </div>
  );
}
