import { Users, Briefcase, Award, MessageSquareQuote, ArrowRight } from 'lucide-react';
import { formatNigeriaDateTime } from '../../lib/rcf-utils';
import type { Member, Testimony } from '../../types/rcf';

interface AdminOverviewTabProps {
  members: Member[];
  testimonies: Testimony[];
  onNavigateTab: (tab: 'members' | 'workers' | 'executives' | 'testimonies' | 'sunday') => void;
}

export function AdminOverviewTab({
  members,
  testimonies,
  onNavigateTab,
}: AdminOverviewTabProps) {
  const workersCount = members.filter((m) => m.category === 'Worker').length;
  const executivesCount = members.filter((m) => m.category === 'Executive').length;
  const consentedCount = testimonies.filter((t) => t.consentToSundaySharing).length;
  const recentTestimonies = testimonies.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* KPI Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigateTab('members')}
          className="text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#0B2545]/40 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Registered Members</span>
            <Users className="w-4 h-4 text-[#0B2545]" aria-hidden="true" />
          </div>
          <p className="font-display text-3xl font-bold text-[#0B2545] mt-2 tabular-nums">
            {members.length}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('workers')}
          className="text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#0B2545]/40 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Workers</span>
            <Briefcase className="w-4 h-4 text-[#0B2545]" aria-hidden="true" />
          </div>
          <p className="font-display text-3xl font-bold text-[#0B2545] mt-2 tabular-nums">
            {workersCount}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('executives')}
          className="text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#0B2545]/40 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Executives</span>
            <Award className="w-4 h-4 text-[#0B2545]" aria-hidden="true" />
          </div>
          <p className="font-display text-3xl font-bold text-[#0B2545] mt-2 tabular-nums">
            {executivesCount}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('testimonies')}
          className="text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#0B2545]/40 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Testimonies</span>
            <MessageSquareQuote className="w-4 h-4 text-[#0B2545]" aria-hidden="true" />
          </div>
          <p className="font-display text-3xl font-bold text-[#0B2545] mt-2 tabular-nums">
            {testimonies.length}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {consentedCount} consented for Sunday
          </p>
        </button>
      </div>

      {/* Recent Testimonies */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0B2545]">
              Recent Testimony Submissions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest testimonies received (WAT / Africa-Lagos time).
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('testimonies')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B2545] hover:underline shrink-0"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentTestimonies.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            No testimonies have been submitted yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {recentTestimonies.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex items-start gap-3">
                  <span
                    className="w-4 h-4 rounded-md border border-slate-300 shrink-0 mt-1"
                    style={{ backgroundColor: item.backgroundColor }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-sm text-[#0B2545]">
                        {item.authorName}
                      </span>
                      {item.membershipCategory && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{item.membershipCategory}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>
                        {item.consentToSundaySharing ? 'Sunday Consent: Yes' : 'Leadership Only'}
                      </span>
                    </div>
                    {item.testimonyTitle && (
                      <p className="text-sm font-medium text-slate-900 mt-0.5 truncate">
                        {item.testimonyTitle}
                      </p>
                    )}
                    <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                      {item.testimonyText}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono-tabular text-slate-500 shrink-0">
                  {formatNigeriaDateTime(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
