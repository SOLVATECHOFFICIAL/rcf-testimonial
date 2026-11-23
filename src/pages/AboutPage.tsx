import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, HeartHandshake, Mail, MapPin, Phone } from 'lucide-react';
import { fetchPublicSettings } from '../lib/firestore-service';
import { DEFAULT_SETTINGS } from '../lib/rcf-utils';
import type { FellowshipSettings } from '../types/rcf';
import { RcfLogo } from '../components/RcfLogo';
import fellowshipGraceImg from '../assets/images/fellowship_grace_dove_1795453960062.jpg';

export function AboutPage() {
  const [settings, setSettings] = useState<FellowshipSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void fetchPublicSettings().then((s) => {
      if (mounted) {
        setSettings(s);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center gap-3">
            <RcfLogo size="md" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0369A1]">
              About Our Fellowship
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0B2545]">
            {settings.fellowshipName}
          </h1>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {loading ? 'Loading fellowship overview...' : settings.aboutText}
          </p>
        </div>
        <div className="md:col-span-4 flex justify-center">
          <div className="rounded-2xl overflow-hidden border border-[#F5B700]/30 shadow-sm bg-[#FFFDF7] w-full max-w-[240px] aspect-[4/3]">
            <img
              src={fellowshipGraceImg}
              alt="Radiant golden cross and white dove symbolizing fellowship in Christ"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-gradient-to-br from-[#0B2545] to-[#1E3A8A] text-white rounded-2xl p-6 sm:p-7">
          <h2 className="font-display text-xl font-bold text-[#F5B700]">Our Vision</h2>
          <p className="text-sm sm:text-base text-slate-100 mt-3 leading-relaxed whitespace-pre-wrap">
            {settings.visionText}
          </p>
        </section>

        <section className="bg-gradient-to-br from-[#0F766E] to-[#0369A1] text-white rounded-2xl p-6 sm:p-7">
          <h2 className="font-display text-xl font-bold text-[#FEF3C7]">Our Mission</h2>
          <p className="text-sm sm:text-base text-slate-100 mt-3 leading-relaxed whitespace-pre-wrap">
            {settings.missionText}
          </p>
        </section>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-[#0B2545] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#0369A1]" aria-hidden="true" />
          Fellowship Activities
        </h2>
        {settings.activities.length === 0 ? (
          <p className="text-sm text-slate-600 mt-3">
            Weekly fellowship services and campus activities can be configured by fellowship leadership in Admin Settings.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {settings.activities.map((act, idx) => (
              <div key={`${act.title}-${idx}`} className="p-4 rounded-xl bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] border border-slate-200">
                <p className="text-xs font-semibold text-[#0369A1]">{act.schedule}</p>
                <h3 className="font-semibold text-base text-[#0B2545] mt-1">{act.title}</h3>
                {act.description && (
                  <p className="text-sm text-slate-600 mt-1.5">{act.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-[#0B2545]">Contact Information</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-[#EFF6FF] border border-blue-100">
            <div className="flex items-center gap-2 text-[#0369A1] text-xs font-semibold mb-1">
              <Mail className="w-4 h-4" />
              Email
            </div>
            <p className="font-medium text-slate-900 break-words">
              {settings.contactEmail || 'Not yet configured'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#ECFDF5] border border-emerald-100">
            <div className="flex items-center gap-2 text-[#0F766E] text-xs font-semibold mb-1">
              <Phone className="w-4 h-4" />
              Phone
            </div>
            <p className="font-medium text-slate-900">
              {settings.contactPhone || 'Not yet configured'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#FEF3C7]/60 border border-amber-200">
            <div className="flex items-center gap-2 text-[#B45309] text-xs font-semibold mb-1">
              <MapPin className="w-4 h-4" />
              Venue
            </div>
            <p className="font-medium text-slate-900">
              {settings.contactAddress || 'Not yet configured'}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/welcome"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#1D4ED8] text-white text-sm font-semibold hover:from-[#143764] hover:to-[#2563EB] transition-all"
          >
            <HeartHandshake className="w-4 h-4 text-[#F5B700]" />
            Share Testimony
          </Link>
        </div>
      </section>
    </div>
  );
}
