import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Check,
  Copy,
  HeartHandshake,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Share2,
  Sparkles,
} from 'lucide-react';
import { fetchActiveAnnouncements, fetchPublicSettings } from '../lib/firestore-service';
import { DEFAULT_SETTINGS, formatNigeriaDateOnly } from '../lib/rcf-utils';
import type { Announcement, FellowshipSettings } from '../types/rcf';
import { RcfLogo } from '../components/RcfLogo';
import jesusLightImg from '../assets/images/jesus_light.webp';
import fellowshipGraceImg from '../assets/images/fellowship_grace.webp';

export function HomePage() {
  const [settings, setSettings] = useState<FellowshipSettings>(DEFAULT_SETTINGS);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [loadedSettings, loadedAnnouncements] = await Promise.all([
          fetchPublicSettings(),
          fetchActiveAnnouncements().catch(() => []),
        ]);
        if (!mounted) return;
        setSettings(loadedSettings);
        setAnnouncements(loadedAnnouncements);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const whatsappShareUrl = currentOrigin
    ? `https://wa.me/?text=${encodeURIComponent(
        `Praise the Lord! Visit Redeemed Christian Fellowship (RCF) to register and share your testimony: ${currentOrigin}`,
      )}`
    : '';

  async function handleCopyLink() {
    if (!currentOrigin) return;
    try {
      await navigator.clipboard.writeText(currentOrigin);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2400);
    } catch {
      // Clipboard fallback ignored
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071932] via-[#0B2545] to-[#1A3B6E] text-white border-b border-[#163861]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#F5B700]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#0EA5E9]/15 blur-3xl"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <RcfLogo size="md" />
                <span className="text-xs sm:text-sm font-semibold text-[#F5B700] tracking-wide uppercase">
                  Redeemed Christian Fellowship
                </span>
              </div>

              <h1
                className="font-display font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: 'clamp(2rem, 4.2vw, 3.35rem)', textWrap: 'balance' }}
              >
                Declare the Goodness of Jesus in Our Fellowship
              </h1>

              <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
                Welcome to Redeemed Christian Fellowship (RCF) — a Christ-centered campus family built on the Word, fervent prayer, and joyful praise. Complete a quick registration to share what the Lord has done in your life.
              </p>

              {/* Single Primary CTA */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/welcome"
                  className="inline-flex items-center justify-center gap-2.5 min-h-[52px] px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#F5B700] to-[#FBBF24] text-[#0B2545] font-bold text-sm sm:text-base hover:from-[#eab000] hover:to-[#F59E0B] transition-all shadow-md"
                >
                  <HeartHandshake className="w-5 h-5" />
                  Share Testimony
                </Link>
              </div>

              {/* Subtle 2-step expectation & social share bar */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 text-xs sm:text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#F5B700] shrink-0" />
                  Quick 2-step flow: Sign in with Google, complete your profile once, then share your testimony
                </span>
              </div>

              {currentOrigin && (
                <div className="pt-1 flex flex-wrap items-center gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => void handleCopyLink()}
                    className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-100 border border-white/15 transition-colors"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        Link Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#F5B700]" />
                        Copy Fellowship Link
                      </>
                    )}
                  </button>

                  {whatsappShareUrl && (
                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-100 border border-emerald-400/30 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share on WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Hero Jesus Artwork Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden border border-[#F5B700]/35 bg-[#091E3A] shadow-2xl">
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={jesusLightImg}
                    alt="Jesus Christ in warm golden light with open arms welcoming the fellowship"
                    width={360}
                    height={270}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-4 sm:p-5 bg-gradient-to-t from-[#071932] via-[#0B2545]/95 to-[#0B2545]/90 border-t border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#F5B700]">
                    Scripture Focus · Revelation 12:11
                  </p>
                  <p className="text-sm text-slate-100 mt-1 leading-relaxed italic">
                    &ldquo;And they overcame him by the blood of the Lamb and by the word of their testimony.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colorful 2-Step Testimony Flow Strip */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#0284C7] text-white p-5 sm:p-6 shadow-sm flex items-start gap-4">
            <span className="w-10 h-10 rounded-xl bg-white/15 font-display font-bold text-lg flex items-center justify-center shrink-0">
              01
            </span>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg">
                Sign In with Google &amp; Profile
              </h2>
              <p className="text-sm text-sky-50 mt-1 leading-relaxed">
                Sign in with your Gmail to recover your fellowship profile anytime, or complete quick registration if it is your first visit.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white p-5 sm:p-6 shadow-sm flex items-start gap-4">
            <span className="w-10 h-10 rounded-xl bg-white/15 font-display font-bold text-lg flex items-center justify-center shrink-0">
              02
            </span>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg">
                Design &amp; Submit Your Testimony Card
              </h2>
              <p className="text-sm text-fuchsia-50 mt-1 leading-relaxed">
                Choose from 18 joyful card colors and gradients, preview your testimony live, and submit directly to fellowship leadership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section aria-labelledby="announcements-heading" className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <h2 id="announcements-heading" className="text-2xl font-bold text-[#0B2545] flex items-center gap-2.5">
              <Megaphone className="w-6 h-6 text-[#BE185D]" aria-hidden="true" />
              Fellowship Announcements
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Latest updates and notices for RCF members and students.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 rounded-2xl bg-slate-200/70 animate-pulse" />
            <div className="h-32 rounded-2xl bg-slate-200/70 animate-pulse" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-gradient-to-r from-white to-[#EFF6FF] border border-blue-200/70 rounded-2xl p-6 text-sm text-slate-700">
            No active announcements at the moment. Fellowship updates posted by leadership will appear here automatically.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((item, idx) => {
              const accents = [
                'border-t-4 border-t-[#0369A1]',
                'border-t-4 border-t-[#0F766E]',
                'border-t-4 border-t-[#6D28D9]',
                'border-t-4 border-t-[#BE185D]',
              ];
              return (
                <article
                  key={item.id}
                  className={`bg-white border border-slate-200 ${accents[idx % accents.length]} rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-3 shadow-xs`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                      {item.eventDate && (
                        <>
                          <span className="font-medium text-[#0369A1]">{item.eventDate}</span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      <span>Posted {formatNigeriaDateOnly(item.createdAt)}</span>
                    </div>
                    <h3 className="font-display font-semibold text-lg text-[#0B2545]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Scripture & Grace Banner with Second Christian Artwork */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-[#FFFDF7] via-[#FEF3C7]/40 to-[#EFF6FF] border border-amber-200/80 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex justify-center">
            <div className="w-full max-w-[260px] aspect-[4/3] rounded-2xl overflow-hidden border border-amber-300/70 shadow-sm bg-white">
              <img
                src={fellowshipGraceImg}
                alt="Golden cross and ascending white dove of peace"
                width={360}
                height={270}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B45309]">
              <BookOpen className="w-4 h-4" />
              Word of Encouragement · Psalm 107:1–2
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B2545]">
              &ldquo;Let the redeemed of the Lord say so!&rdquo;
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Every healing, open door, academic victory, and answered prayer builds up the faith of our entire campus fellowship. Your story brings glory to Jesus and hope to someone else today.
            </p>
            <div className="pt-1">
              <Link
                to="/welcome"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 rounded-xl bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#143764] transition-colors"
              >
                <HeartHandshake className="w-4 h-4 text-[#F5B700]" />
                Share Testimony
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Fellowship Activities (if configured) */}
      {settings.activities.length > 0 && (
        <section aria-labelledby="activities-heading" className="bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
            <h2 id="activities-heading" className="text-2xl font-bold text-[#0B2545] flex items-center gap-2.5 mb-6">
              <Calendar className="w-6 h-6 text-[#0F766E]" aria-hidden="true" />
              Fellowship Activities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings.activities.map((activity, idx) => (
                <div
                  key={`${activity.title}-${idx}`}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] p-5"
                >
                  <p className="text-xs font-semibold text-[#0369A1]">{activity.schedule}</p>
                  <h3 className="font-display font-semibold text-base text-[#0B2545] mt-1">
                    {activity.title}
                  </h3>
                  {activity.description && (
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {activity.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About & Contact Split Section */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-gradient-to-br from-[#0B2545] to-[#1E3A8A] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5B700]">About RCF</h2>
              <p className="text-sm sm:text-base text-slate-100 mt-3 leading-relaxed">
                {settings.aboutText}
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#F5B700] hover:text-white transition-colors py-1"
              >
                Read more about our vision &amp; mission &rarr;
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B2545]">Contact Fellowship</h2>
              <p className="text-sm text-slate-600 mt-1">
                Reach out to fellowship leadership or visit us during service.
              </p>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#0369A1] mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-500">Email</dt>
                    <dd className="text-slate-800 font-medium">
                      {settings.contactEmail || 'To be updated by fellowship leadership'}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#0F766E] mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-500">Phone</dt>
                    <dd className="text-slate-800 font-medium">
                      {settings.contactPhone || 'To be updated by fellowship leadership'}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#BE185D] mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-500">Fellowship Venue</dt>
                    <dd className="text-slate-800 font-medium">
                      {settings.contactAddress || 'To be updated by fellowship leadership'}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
