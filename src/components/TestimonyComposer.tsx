import { useState, type FormEvent } from 'react';
import { Check, CheckCircle2, HeartHandshake, Send } from 'lucide-react';
import {
  generateSafeId,
  getPresetForColor,
  TESTIMONY_COLOR_PRESETS,
  validateTestimonyInput,
} from '../lib/rcf-utils';
import { submitTestimony } from '../lib/firestore-service';
import { parseFirestoreErrorMessage } from '../lib/firebase';
import type { MemberSession } from '../types/rcf';
import { RcfLogo } from './RcfLogo';

interface TestimonyComposerProps {
  memberSession: MemberSession | null;
}

const INSPIRATION_TOPICS = [
  'Answered Prayer',
  'Academic Breakthrough',
  'Divine Healing',
  'Financial Provision',
  'Journey Mercies',
  'Salvation & Peace',
];

export function TestimonyComposer({ memberSession }: TestimonyComposerProps) {
  const [authorName, setAuthorName] = useState(memberSession?.fullName ?? '');
  const [authorMemberId, setAuthorMemberId] = useState(memberSession?.memberId ?? '');
  const [testimonyTitle, setTestimonyTitle] = useState('');
  const [testimonyText, setTestimonyText] = useState('');
  const [selectedColor, setSelectedColor] = useState(TESTIMONY_COLOR_PRESETS[0].backgroundColor);
  const [consentToSundaySharing, setConsentToSundaySharing] = useState(false);

  const [submissionNonce, setSubmissionNonce] = useState(() => generateSafeId('nonce'));
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const activePreset = getPresetForColor(selectedColor);
  const charCount = testimonyText.length;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitError('');
    const payload = {
      authorMemberId: authorMemberId.trim() || undefined,
      authorName: authorName.trim(),
      membershipCategory: memberSession?.category,
      unit: memberSession?.unit || memberSession?.executivePortfolio,
      testimonyTitle: testimonyTitle.trim() || undefined,
      testimonyText: testimonyText.trim(),
      backgroundColor: activePreset.backgroundColor,
      textColor: activePreset.textColor,
      consentToSundaySharing,
    };

    const validation = validateTestimonyInput(payload);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const docId = await submitTestimony(payload, submissionNonce);
      setSubmittedId(docId);
      // Clear composer ONLY after successful saving
      setTestimonyTitle('');
      setTestimonyText('');
      setConsentToSundaySharing(false);
      setSubmissionNonce(generateSafeId('nonce'));
    } catch (err) {
      setSubmitError(parseFirestoreErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="composer-heading" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200">
        <div>
          <h2 id="composer-heading" className="text-xl sm:text-2xl font-bold text-[#0B2545]">
            Share Your Testimony
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Write what God has done for you, pick from 18 vibrant card themes, preview it live, and submit to fellowship leadership.
          </p>
        </div>
        {memberSession && (
          <div className="text-xs text-slate-600 font-mono-tabular shrink-0">
            <span>{memberSession.category}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>{memberSession.memberId}</span>
          </div>
        )}
      </div>

      {submittedId && (
        <div
          role="status"
          className="mt-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-950">
                Testimony received — thank you for sharing!
              </p>
              <p className="text-xs text-emerald-800 mt-0.5">
                Your testimony has been saved for fellowship leadership review. You may share another or leave the site anytime.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmittedId(null)}
            className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition-colors shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8" noValidate>
        {/* Left: Composer Controls */}
        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="testimony-author" className="block text-sm font-medium text-slate-800 mb-1.5">
                Your Full Name <span className="text-red-600">*</span>
              </label>
              <input
                id="testimony-author"
                type="text"
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                  if (fieldErrors.authorName) {
                    setFieldErrors((prev) => ({ ...prev, authorName: '' }));
                  }
                }}
                maxLength={120}
                placeholder="e.g., Adeola Johnson"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-[#0B2545]"
                required
              />
              {fieldErrors.authorName && (
                <p className="text-xs text-red-600 mt-1" role="alert">
                  {fieldErrors.authorName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="testimony-member-id" className="block text-sm font-medium text-slate-800 mb-1.5">
                RCF Member ID <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                id="testimony-member-id"
                type="text"
                value={authorMemberId}
                onChange={(e) => setAuthorMemberId(e.target.value)}
                maxLength={32}
                placeholder="e.g., RCF-2026-482910"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-mono-tabular text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-[#0B2545]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="testimony-title" className="block text-sm font-medium text-slate-800 mb-1.5">
              Testimony Title <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="testimony-title"
              type="text"
              value={testimonyTitle}
              onChange={(e) => setTestimonyTitle(e.target.value)}
              maxLength={140}
              placeholder="e.g., Divine Provision for School Fees"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-[#0B2545]"
            />
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 mr-1">Quick topics:</span>
              {INSPIRATION_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setTestimonyTitle(topic)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    testimonyTitle === topic
                      ? 'bg-[#0B2545] text-white border-[#0B2545]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            {fieldErrors.testimonyTitle && (
              <p className="text-xs text-red-600 mt-1" role="alert">
                {fieldErrors.testimonyTitle}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="testimony-text" className="block text-sm font-medium text-slate-800">
                Your Testimony <span className="text-red-600">*</span>
              </label>
              <span className="text-xs font-mono-tabular text-slate-500">
                {charCount} / 3,000
              </span>
            </div>
            <textarea
              id="testimony-text"
              rows={5}
              value={testimonyText}
              onChange={(e) => {
                setTestimonyText(e.target.value);
                if (fieldErrors.testimonyText) {
                  setFieldErrors((prev) => ({ ...prev, testimonyText: '' }));
                }
              }}
              maxLength={3000}
              placeholder="Praise the Lord! Share what God has done for you..."
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-[#0B2545] resize-y"
              required
            />
            {fieldErrors.testimonyText && (
              <p className="text-xs text-red-600 mt-1" role="alert">
                {fieldErrors.testimonyText}
              </p>
            )}
          </div>

          {/* Background Color Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="block text-sm font-medium text-slate-800">
                Choose Card Color Theme ({TESTIMONY_COLOR_PRESETS.length} Colors)
              </span>
              <span className="text-xs font-semibold text-[#0B2545]">
                {activePreset.label}
              </span>
            </div>
            <div
              role="radiogroup"
              aria-label="Testimony card background color"
              className="grid grid-cols-6 sm:grid-cols-9 gap-2"
            >
              {TESTIMONY_COLOR_PRESETS.map((preset) => {
                const isSelected = preset.backgroundColor === activePreset.backgroundColor;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Select ${preset.label} background`}
                    title={preset.label}
                    onClick={() => setSelectedColor(preset.backgroundColor)}
                    style={{
                      background: preset.gradient ?? preset.backgroundColor,
                      color: preset.textColor,
                    }}
                    className={`w-full h-11 rounded-xl flex items-center justify-center border transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B2545] ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-[#0B2545] scale-105 border-slate-400'
                        : 'border-slate-300 hover:scale-105'
                    }`}
                  >
                    {isSelected && <Check className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Selected: <span className="font-medium text-slate-700">{activePreset.label}</span> — text contrast adjusts automatically for easy reading.
            </p>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={consentToSundaySharing}
                onChange={(e) => setConsentToSundaySharing(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-slate-400 text-[#0B2545] focus:ring-[#0B2545] shrink-0"
              />
              <span className="text-sm text-slate-800 leading-snug">
                I agree that the fellowship may consider this testimony for sharing during Sunday fellowship.
              </span>
            </label>
          </div>

          {submitError && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#1D4ED8] text-white text-sm font-semibold hover:from-[#143764] hover:to-[#2563EB] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting Testimony...' : 'Submit Testimony'}
          </button>
        </div>

        {/* Right: Live Social-Media-Style Colored Card Preview */}
        <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-800">Live Card Preview</span>
            <span className="text-xs text-slate-500">Updates automatically</span>
          </div>

          <div
            data-testid="testimony-live-preview"
            style={{
              background: activePreset.gradient ?? activePreset.backgroundColor,
              color: activePreset.textColor,
              borderColor: activePreset.borderColor,
            }}
            className="flex-1 min-h-[300px] sm:min-h-[340px] rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <RcfLogo size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {authorName.trim() || 'Your Name'}
                  </p>
                  <p
                    style={{ color: activePreset.mutedTextColor }}
                    className="text-xs truncate"
                  >
                    {memberSession?.category
                      ? `${memberSession.category}${memberSession.unit ? ` · ${memberSession.unit}` : ''}`
                      : 'RCF Fellowship Testimony'}
                  </p>
                </div>
              </div>
              <HeartHandshake className="w-5 h-5 shrink-0 opacity-80" aria-hidden="true" />
            </div>

            <div className="my-6 text-center px-1">
              {testimonyTitle.trim() && (
                <h3 className="font-display text-lg sm:text-xl font-bold mb-2.5 leading-snug break-words">
                  {testimonyTitle.trim()}
                </h3>
              )}
              <p
                className={`leading-relaxed break-words whitespace-pre-wrap ${
                  testimonyText.trim().length > 260
                    ? 'text-sm sm:text-base text-left'
                    : 'text-lg sm:text-xl font-medium text-center'
                }`}
              >
                {testimonyText.trim() ||
                  'Your testimony will appear right here as you type. Choose any background color to preview how your card looks.'}
              </p>
            </div>

            <div
              style={{ color: activePreset.mutedTextColor }}
              className="pt-3 border-t border-current/15 flex items-center justify-between text-xs"
            >
              <span>Redeemed Christian Fellowship</span>
              <span>
                {consentToSundaySharing ? 'Sunday sharing: Agreed' : 'Leadership only'}
              </span>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
