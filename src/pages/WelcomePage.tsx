import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BookOpen, Megaphone, RefreshCw } from 'lucide-react';
import { fetchActiveAnnouncements } from '../lib/firestore-service';
import { clearMemberSession, getMemberSession } from '../lib/member-session';
import { formatNigeriaDateOnly } from '../lib/rcf-utils';
import type { Announcement } from '../types/rcf';
import { RcfLogo } from '../components/RcfLogo';
import { TestimonyComposer } from '../components/TestimonyComposer';

export function WelcomePage() {
  const navigate = useNavigate();
  const [memberSession] = useState(() => getMemberSession());
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (!memberSession) return;
    let mounted = true;
    void fetchActiveAnnouncements()
      .catch(() => [])
      .then((loadedAnnouncements) => {
        if (!mounted) return;
        setAnnouncements(loadedAnnouncements);
      });
    return () => {
      mounted = false;
    };
  }, [memberSession]);

  if (!memberSession) {
    return <Navigate to="/register" replace />;
  }

  function handleSwitchMember() {
    clearMemberSession();
    navigate('/register');
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0B2545] via-[#123568] to-[#0F766E] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start sm:items-center gap-4">
          <RcfLogo size="md" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F5B700]">
              Step 2 of 2 · Testimony Studio
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-0.5">
              Welcome to RCF, {memberSession.fullName}!
            </h1>
            <p className="text-sm sm:text-base text-slate-100 mt-1 max-w-xl">
              We rejoice with you! Write your testimony below, select a vibrant card theme, and share what Jesus has done.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          <div className="rounded-xl bg-white/10 border border-white/15 px-4 py-2.5 text-xs text-slate-100 space-y-0.5">
            <p className="font-mono-tabular font-semibold text-[#F5B700]">
              {memberSession.memberId}
            </p>
            <p>
              {memberSession.category}
              {memberSession.unit ? ` · ${memberSession.unit}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSwitchMember}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-white underline py-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Not {memberSession.fullName}? Switch member
          </button>
        </div>
      </section>

      {/* Scripture Inspiration Strip */}
      <div className="rounded-2xl bg-gradient-to-r from-[#FEF3C7]/70 via-[#FFFDF7] to-[#EDE9FE]/60 border border-amber-200/80 px-5 py-4 flex items-start sm:items-center gap-3 text-sm text-[#0B2545]">
        <BookOpen className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5 sm:mt-0" />
        <p>
          <span className="font-semibold">Psalm 105:1:</span> &ldquo;Oh, give thanks to the Lord! Call upon His name; make known His deeds among the peoples!&rdquo;
        </p>
      </div>

      {/* Main Testimony Composer */}
      <TestimonyComposer memberSession={memberSession} />

      {/* Optional Announcements */}
      {announcements.length > 0 && (
        <section aria-labelledby="welcome-announcements" className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
          <h2
            id="welcome-announcements"
            className="font-display text-lg font-bold text-[#0B2545] flex items-center gap-2 mb-4"
          >
            <Megaphone className="w-5 h-5 text-[#BE185D]" aria-hidden="true" />
            Fellowship Announcements
          </h2>
          <div className="divide-y divide-slate-100">
            {announcements.map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {item.eventDate && <span className="font-medium text-[#0369A1]">{item.eventDate}</span>}
                  {item.eventDate && <span aria-hidden="true">·</span>}
                  <span>{formatNigeriaDateOnly(item.createdAt)}</span>
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-[#0B2545] mt-0.5">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{item.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
